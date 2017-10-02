// == Imports ===============================================================

const path = require('path');

const helpers = require('./helpers');

const Connected = require('../lib/connected');

const { WritableArray } = require('./support');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Connected', () => {
  it('can provide a default configuration', async () => {
    var connected = new Connected();

    await connected.init;

    assert.ok(connected.channel);
  });

  it('can create queues', async () => {
    const queueName = 'q-connected-create-queues';
    var connected = new Connected();

    await connected.init;

    await connected.assertQueue(queueName);

    assert.ok(connected.checkQueue(queueName));
  })

  it('provides a simple stream interface for reading', async () => {
    const streamName = 'q-connected-read-stream';
    var connected = new Connected();

    await connected.init;

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
    var connected = new Connected();

    await connected.init;

    // await connected.assertQueue(streamName);

    // var buffer = new WritableArray();
    // var readableData = helpers.eventCounter(readable, 'data');

    // var readStream = connected.readStream(streamName);
    // readStream.pipe(buffer);

    // var writeStream = connected.writeStream(streamName);
    // writeStream.write({ stream: 'write' });

    // await readableData;

    // assert.equal(1, buffer.length);

    // var read = buffer.pop();

    // assert.deepEqual({ stream: 'write' }, read);

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
