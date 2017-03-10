// == Imports ===============================================================

const Client = require('../lib/client');

const Worker = require('../lib/worker');

const EchoWorker = require('./examples/echo_worker');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Worker', () => {
  it('can be created with defaults', () => {
    var client = new Client();

    var worker = new EchoWorker('test_echo_worker', 'test_exchange', client);
    var rpc;

    return worker.init.then(() => {
      assert.ok(worker);

      rpc = client.rpc('test_exchange', 'test_echo_worker');

      return rpc.init;
    }).then(() => {
      return rpc.echo('with test data').then(reply => {
        assert.equal(reply, 'with test data');
      })
    });
  });
});
