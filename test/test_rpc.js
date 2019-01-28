// == Imports ===============================================================

const Client = require('../lib/client');

const RPC = require('../lib/rpc');
const EchoWorker = require('./examples/echo_worker');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('RPC', () => {
  it('can be created with defaults', async () => {
    let client = new Client();
    
    await client.init;

    let worker = new EchoWorker('test_echo_rpc', '', client);

    let rpc = new RPC('', 'test_echo_rpc', client);

    await rpc.init;
    await worker.init;

    let response = await rpc.echo('test');

    assert.equal(response, 'test');

    rpc.close();
    worker.close();
    client.close();
  });
});
