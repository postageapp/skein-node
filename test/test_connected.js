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
      let connected = await Connected.open();

      assert.ok(connected.channel);

      connected.close();
    });
  });

  it('can provide a default configuration', async () => {
    let connected = await Connected.open();

    assert.ok(connected.channel);

    connected.close();
  });

  it('can create, check and delete queues', async () => {
    const queueName = 'q-connected-create-queues';
    let connected = await Connected.open();

    await connected.assertQueue(queueName);

    assert.ok(connected.checkQueue(queueName));

    // Unconsumed queues are not auto-deleted, so a force-delete is required.
    await connected.deleteQueue(queueName);

    connected.close();
  })

  it('provides a simple stream interface for reading', async () => {
    const streamName = 'q-connected-read-stream';
    let connected = await Connected.open();

    await connected.assertQueue(streamName);

    let buffer = new WritableArray();

    let readable = await connected.readStream(streamName);
    let readableData = helpers.eventCounter(readable, 'data');
    readable.pipe(buffer);

    connected.publishAsJson('', streamName, { stream: 'read' });

    await readableData;

    assert.equal(1, buffer.length);

    let read = buffer.pop();

    assert.deepEqual({ stream: 'read' }, read);

    connected.close();
  });

  it('provides a simple stream interface for writing', async () => {
    const streamName = 'q-connected-write-stream';
    let connected = await Connected.open();

    await connected.assertQueue(streamName);

    let writable = await connected.writeStream(streamName);
    let readable = await connected.readStream(streamName);

    let readableData = helpers.eventCounter(readable, 'data');
    let buffer = new WritableArray();
    readable.pipe(buffer);

    writable.write({ stream: 'write' });

    await readableData;

    assert.equal(1, buffer.length);

    let read = buffer.pop();

    assert.deepEqual({ stream: 'write' }, read);

    connected.close();
  });
});
