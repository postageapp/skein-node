// == Imports ===============================================================

const Client = require('../lib/client');

const Worker = require('../lib/worker');

// == Constants =============================================================

// == Support ===============================================================

class DemoWorker extends Worker {
  echo(value) {
    return value;
  }
}

// == Tests =================================================================

describe('Worker', () => {
  it('can be created with defaults', () => {
    var client = new Client();

    var worker = new DemoWorker(null, 'test_exchange', client);
    var rpc;

    return worker.init.then(() => {
      assert.ok(worker);

      rpc = client.rpc('test_exchange');

      return rpc.init;
    }).then(() => {
      return rpc.echo('with test data').then(reply => {
        assert.equal(reply, 'with test data');
      })
    });
  });
});
