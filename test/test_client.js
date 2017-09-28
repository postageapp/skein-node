// == Imports ===============================================================

const Client = require('../lib/client');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Client', () => {
  it('can be created with defaults', async () => {
    var client = new Client();

    await client.init;

    assert.ok(client);
  });

  describe('rpc()', () => {
    it('can create an RPC client', async () => {
      var client = new Client();

      var rpc = client.rpc('test-exchange');

      await client.init;

      assert.ok(rpc);
    });
  });

  describe('worker()', () => {
    it('can create a generic worker instance', async () => {
      var client = new Client();

      var worker = client.worker('test-exchange');

      await client.init;

      assert.ok(worker);
    });
  })
});
