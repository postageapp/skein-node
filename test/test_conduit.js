// == Imports ===============================================================

const helpers = require('./helpers');

const { Readable, Writable } = require('../lib/conduit');
const Connected = require('../lib/connected');

const WritableArray = require('./support/writable_array');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Conduit', () => {
  describe('Readable', () => {
    it('can be initialized with a valid Connected object', async () => {
      const streamName = 'q-readable-test';
      let connected = await Connected.open();

      let readable = new Readable(connected, streamName);
      let readableData = helpers.eventCounter(readable, 'data');
      let buffer = new WritableArray();

      await readable.init;

      readable.pipe(buffer);

      connected.publishAsJson('', streamName, { test: true });

      await readableData;

      assert.equal(1, buffer.length);

      let received = buffer.pop();

      assert.deepEqual({ test: true }, received);

      readable.destroy();
    });
  });

  describe('Writable', () => {
    it('can be initialized with a valid Connected object', async () => {
      const streamName = 'q-writable-test';
      let connected = await Connected.open();

      await connected.assertQueue(streamName);

      let writable = new Writable(connected, streamName);
      let readable = new Readable(connected, streamName);

      let readableData = helpers.eventCounter(readable, 'data');
      let buffer = new WritableArray();

      await writable.init;
      await readable.init;

      readable.pipe(buffer);

      writable.write({ test: true });

      await readableData;

      assert.equal(1, buffer.length);

      let received = buffer.pop();

      assert.deepEqual({ test: true }, received);
    });
  });
});
