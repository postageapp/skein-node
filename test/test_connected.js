// == Imports ===============================================================

const path = require('path');

const helpers = require('./helpers');

const Connected = require('../lib/connected');

const { WritableArray } = require('./support');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Connected', () => {
  describe('open()', () => {
    it('will permit waiting for full initialization', async() => {
      var connected = await Connected.open();

      assert.ok(connected.channel);
    });
  });

  it('can provide a default configuration', async () => {
    var connected = await Connected.open();

    assert.ok(connected.channel);
  });

  it('can create, check and delete queues', async () => {
    const queueName = 'q-connected-create-queues';
    var connected = await Connected.open();

    await connected.assertQueue(queueName);

    assert.ok(connected.checkQueue(queueName));

    // Unconsumed queues are not auto-deleted, so a force-delete is required.
    connected.deleteQueue(queueName);
  })

  it('provides a simple stream interface for reading', async () => {
    const streamName = 'q-connected-read-stream';
    var connected = await Connected.open();

    await connected.assertQueue(streamName);

    var buffer = new WritableArray();

    var readable = await connected.readStream(streamName);
    var readableData = helpers.eventCounter(readable, 'data');
    readable.pipe(buffer);

    connected.publishAsJson('', streamName, { stream: 'read' });

    await readableData;

    assert.equal(1, buffer.length);

    var read = buffer.pop();

    assert.deepEqual({ stream: 'read' }, read);
  });

  it('provides a simple stream interface for writing', async () => {
    const streamName = 'q-connected-write-stream';
    var connected = await Connected.open();

    await connected.assertQueue(streamName);

    var writable = await connected.writeStream(streamName);
    var readable = await connected.readStream(streamName);

    var readableData = helpers.eventCounter(readable, 'data');
    var buffer = new WritableArray();
    readable.pipe(buffer);

    writable.write({ stream: 'write' });

    await readableData;

    assert.equal(1, buffer.length);

    var read = buffer.pop();

    assert.deepEqual({ stream: 'write' }, read);
  });
});
