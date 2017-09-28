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
  it('can be created with a simple subclass (EchoWorker)', () => {
    var client = new Client();

    var worker = client.worker('test_echo_worker', exchange, client, EchoWorker);
    var rpc = client.rpc(exchange, 'test_echo_worker');

    return Promise.all([ worker.init, rpc.init ]).then(() => {
      return rpc.echo('with test data');
    }).then(reply => {
      assert.equal(reply, 'with test data');
    });
  });

  it('can deal with malformed JSON data', () => {
    var connected = new Connected();
    var worker = new Worker('test_worker', exchange);
    var replyQueue = uuid();
    var messageId = uuid();

    return Promise.all([ connected.init, worker.init ]).then(() => {
      return connected.consumeAsPromise(replyQueue, () => {
        return connected.channel.publish(
          '',
          'test_worker',
          Buffer.from('{ "jsonrpc": "2.0", ***', 'utf8'),
          {
            contentType: 'application/json',
            contentEncoding: 'utf8',
            messageId: messageId,
            replyTo: replyQueue
          }
        );
      });
    }).then(msg => {
      var reply = json.fromBuffer(msg.content);

      assert.equal(reply.error.code, -32700);
      assert.equal(reply.error.message, 'Invalid JSON data');
      assert.equal(reply.id, messageId);
    });
  });

  it('can deal with an incomplete RPC call', () => {
    var connected = new Connected();
    var worker = new Worker('test_worker', exchange);
    var replyQueue = uuid();
    var messageId = uuid();

    return Promise.all([ connected.init, worker.init ]).then(() => {
      return connected.consumeAsPromise(replyQueue, () => {
        return connected.publishAsJson(
          '',
          'test_worker',
          {
          },
          {
            messageId: messageId,
            replyTo: replyQueue
          }
        );
      });
    }).then(msg => {
      var reply = json.fromBuffer(msg.content);

      assert.equal(reply.error.code, -32600);
      assert.equal(reply.error.message, 'Invalid request: Missing or invalid "jsonrpc" property');
      assert.equal(reply.id, messageId);
    });
  });

  it('can deal with an RPC call missing a method', () => {
    var connected = new Connected();
    var worker = new Worker('test_worker', exchange);
    var replyQueue = uuid();
    var messageId = uuid();

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
      var reply = json.fromBuffer(msg.content);

      assert.equal(reply.error.code, -32600);
      assert.equal(reply.error.message, 'Invalid request: Missing or invalid "method" property');
      assert.equal(reply.id, messageId);
    });
  });

  it('catches errors triggered within the worker code', () => {
    var connected = new Connected();
    var worker = new ErrorWorker('test_error_worker', exchange);
    var replyQueue = uuid();
    var messageId = uuid();

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
      var reply = json.fromBuffer(msg.content);

      assert.equal(reply.error.code, -32603);
      assert.equal(reply.error.message, 'Internal error when handling "error"');
      assert.equal(reply.id, messageId);
    });
  });
});
