// == Imports ===============================================================

const Client = require('../lib/client');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Client', () => {
  it('can be created with defaults', async () => {
    let client = new Client();

    await client.init;

    assert.ok(client);

    client.close();
  });

  describe('rpc()', () => {
    it('can create an RPC client', async () => {
      let client = new Client();

      await client.init;

      let rpc = client.rpc('test-exchange');

      await client.init;

      assert.ok(rpc);

      client.close();
    });
  });

  describe('worker()', () => {
    it('can create a generic worker instance', async () => {
      let client = new Client();

      await client.init;

      let worker = client.worker('test-exchange');

      await client.init;

      assert.ok(worker);

      client.close();
    });
  })
});
