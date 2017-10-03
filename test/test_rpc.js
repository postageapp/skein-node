// == Imports ===============================================================

const Client = require('../lib/client');

const RPC = require('../lib/rpc');
const EchoWorker = require('./examples/echo_worker');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('RPC', () => {
  it('can be created with defaults', async () => {
    var client = new Client();
    var worker = new EchoWorker('test_echo_rpc', 'test_exchange', client);

    var rpc = new RPC('test_exchange', 'test_echo_rpc', client);

    await rpc.init;
    await worker.init;

    var response = await rpc.echo('test');

    assert.equal(response, 'test');
  });
});
