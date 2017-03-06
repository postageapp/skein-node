// == Imports ===============================================================

const Client = require('../lib/client');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Client', () => {
  it('can be created with defaults', () => {
    var client = new Client();

    return client.init.then(() => {
      assert.ok(client);
    })
  });

  describe('RPC', () => {
    it('can create an RPC client', () => {
      var client = new Client();

      var rpc = client.rpc('test-exchange');

      return rpc.init.then(() => {
        assert.ok(rpc);  
      });
    });
  });
});
