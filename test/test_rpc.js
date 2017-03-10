// == Imports ===============================================================

const Client = require('../lib/client');

const RPC = require('../lib/rpc');
const EchoWorker = require('./examples/echo_worker');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('RPC', () => {
  it('can be created with defaults', () => {
    var client = new Client();
    var worker = new EchoWorker('test_echo_rpc', 'test_exchange', client);

    var rpc = new RPC('test_exchange', 'test_echo_rpc', client);

    return rpc.init.then(() => {
      return worker.init;
    }).then(() => {
      return rpc.echo();
    }).then(response => {
      assert.ok(response);
    });
  });
});
