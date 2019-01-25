// == Imports ===============================================================

const Promise = require('bluebird').Promise;
const uuid = require('uuid/v4');

const Client = require('../lib/client');
const Connected = require('../lib/connected');

const Worker = require('../lib/worker');

const json = require('../lib/json');

const EchoWorker = require('./examples/echo_worker');
const ErrorWorker = require('./examples/error_worker');

// == Constants =============================================================

const exchange = 'test_exchange';

// == Support ===============================================================

// == Tests =================================================================

describe('Worker', () => {
  it('can be created with a simple subclass (EchoWorker)', async () => {
    let client = new Client();
    await client.init;

    let worker = client.worker('test_echo_worker', exchange, client, EchoWorker);
    await worker.init;

    let rpc = client.rpc(exchange, 'test_echo_worker');
    await rpc.init;

    let reply = await rpc.echo('with test data');

    assert.equal(reply, 'with test data');

    worker.close();
    rpc.close();
    client.close();
  });

  it('can deal with malformed JSON data', async () => {
    const queueName = 'q-worker-malformed-json';

    let connected = new Connected();
    await connected.init;

    let worker = new Worker(queueName, exchange);
    let replyQueue = uuid();
    let messageId = uuid();

    await worker.init;

    let response = connected.consumeAsPromise(replyQueue);

    connected.channel.publish(
      '',
      queueName,
      Buffer.from('{ "jsonrpc": "2.0", ***', 'utf8'),
      {
        contentType: 'application/json',
        contentEncoding: 'utf8',
        messageId: messageId,
        replyTo: replyQueue
      }
    );

    let msg = await response;

    let reply = json.fromBuffer(msg.content);

    assert.equal(reply.error.code, -32700);
    assert.equal(reply.error.message, 'Invalid JSON data');
    assert.equal(reply.id, messageId);

    connected.close();
    worker.close();
  });

  it('can deal with an incomplete RPC call', async () => {
    const queueName = 'q-worker-incomplete-rpc';
    let connected = new Connected();
    await connected.init;

    let worker = new Worker(queueName, exchange);
    await worker.init;

    let replyQueue = uuid();
    let messageId = uuid();

    await connected.publishAsJson(
      exchange,
      queueName,
      {
      },
      {
        messageId: messageId,
        replyTo: replyQueue
      }
    );

    let msg = await connected.consumeAsPromise(replyQueue);

    let reply = json.fromBuffer(msg.content);

    assert.equal(reply.error.code, -32600);
    assert.equal(reply.error.message, 'Invalid request: Missing or invalid "jsonrpc" property');
    assert.equal(reply.id, messageId);

    worker.close();
    connected.close();
  });

  it('can deal with an RPC call missing a method', async () => {
    let connected = new Connected();
    await connected.init;
    
    let worker = new Worker('test_worker', exchange);
    await worker.init;

    let replyQueue = uuid();
    let messageId = uuid();

    let msg = await connected.consumeAsPromise(replyQueue, () => {
      return connected.publishAsJson(
        '',
        'test_worker',
        {
          "jsonrpc": "2.0",
          "id": messageId
        },
        {
          messageId: messageId,
          replyTo: replyQueue
        }
      );
    });

    let reply = json.fromBuffer(msg.content);

    assert.equal(reply.error.code, -32600);
    assert.equal(reply.error.message, 'Invalid request: Missing or invalid "method" property');
    assert.equal(reply.id, messageId);

    connected.close();
    worker.close();
  });

  it('catches errors triggered within the worker code', async () => {
    let connected = new Connected();
    let worker = new ErrorWorker('test_error_worker', exchange);
    let replyQueue = uuid();
    let messageId = uuid();

    await connected.init;
    await worker.init;

    let msg = await connected.consumeAsPromise(replyQueue, () => {
      return connected.publishAsJson(
        '',
        'test_error_worker',
        {
          "jsonrpc": "2.0",
          "id": messageId,
          "method": "error"
        },
        {
          messageId: messageId,
          replyTo: replyQueue
        }
      );
    });

    let reply = json.fromBuffer(msg.content);

    assert.equal(reply.error.code, -32603);
    assert.equal(reply.error.message, 'Internal error when handling "error"');
    assert.equal(reply.id, messageId);

    worker.close();
    connected.close();
  });
});
