// == Imports ===============================================================

const Client = require('../lib/client');

// == Constants =============================================================

const exchange = 'test_exchange';

// == Support ===============================================================

// == Tests =================================================================

describe('Client', () => {
  it('can be created with defaults', async () => {
    let client = new Client();
    await client.init;

    assert.ok(client);
    
    await client.close();
  });

  describe('rpc()', () => {
    it('can create an RPC client', async () => {
      let client = new Client();
      await client.init;

      let rpc = client.rpc(exchange);
      await rpc.init;

      assert.ok(rpc);

      rpc.close();
      client.close();
    });
  });

  describe('worker()', () => {
    it('can create a generic worker instance', async () => {
      let client = new Client();
      await client.init;

      let worker = client.worker(exchange);
      await worker.init;

      assert.ok(worker);

      worker.close();
      client.close();
    });
  });
});
