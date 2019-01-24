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

    let worker = client.worker('test_echo_worker', exchange, client, EchoWorker);
    let rpc = client.rpc(exchange, 'test_echo_worker');

    await Promise.all([ worker.init, rpc.init ]);

    let reply = await rpc.echo('with test data');

    assert.equal(reply, 'with test data');
  });

  it('can deal with malformed JSON data', async () => {
    const queueName = 'q-worker-malformed-json';
    let connected = new Connected();
    let worker = new Worker(queueName, exchange);
    let replyQueue = uuid();
    let messageId = uuid();

    await Promise.all([ connected.init, worker.init ]);

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
  });

  it('can deal with an incomplete RPC call', async () => {
    const queueName = 'q-worker-incomplete-rpc';
    let connected = new Connected();
    let worker = new Worker(queueName, exchange);
    let replyQueue = uuid();
    let messageId = uuid();

    await Promise.all([ connected.init, worker.init ]);

    return connected.publishAsJson(
      '',
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
  });

  it('can deal with an RPC call missing a method', () => {
    let connected = new Connected();
    let worker = new Worker('test_worker', exchange);
    let replyQueue = uuid();
    let messageId = uuid();

    return Promise.all([ connected.init, worker.init ]).then(() => {
      return connected.consumeAsPromise(replyQueue, () => {
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
    }).then(msg => {
      let reply = json.fromBuffer(msg.content);

      assert.equal(reply.error.code, -32600);
      assert.equal(reply.error.message, 'Invalid request: Missing or invalid "method" property');
      assert.equal(reply.id, messageId);
    });
  });

  it('catches errors triggered within the worker code', () => {
    let connected = new Connected();
    let worker = new ErrorWorker('test_error_worker', exchange);
    let replyQueue = uuid();
    let messageId = uuid();

    return Promise.all([ connected.init, worker.init ]).then(() => {
      return connected.consumeAsPromise(replyQueue, () => {
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
    }).then(msg => {
      let reply = json.fromBuffer(msg.content);

      assert.equal(reply.error.code, -32603);
      assert.equal(reply.error.message, 'Internal error when handling "error"');
      assert.equal(reply.id, messageId);
    });
  });
});
