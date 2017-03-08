// == Imports ===============================================================

const Client = require('../lib/client');

const RPC = require('../lib/rpc');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('RPC', () => {
  it('can be created with defaults', () => {
    var client = new Client();

    var rpc = new RPC('test_exchange', client);

    return rpc.init.then(() => {
      return rpc.test().then((response) => {
        assert.ok(response);
      });
    });
  });
});
