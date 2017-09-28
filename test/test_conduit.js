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
      var connected = new Connected();

      await connected.init;

      var readable = new Readable(connected, 'test-queue');
      var readableData = helpers.eventCounter(readable, 'data');
      var buffer = new WritableArray();

      await readable.init;

      readable.pipe(buffer);

      connected.publishAsJson('', 'test-queue', { test: true });

      await readableData;

      assert.equal(1, buffer.length);

      var received = buffer.pop();

      assert.deepEqual({ test: true }, received);

      readable.destroy();
    });
  });

  describe('Writable', () => {
    it('can be initialized with a valid Connected object', async () => {
      var connected = new Connected();

      await connected.init;

      var writable = new Writable(connected, 'test-queue');
      var readable = new Readable(connected, 'test-queue');
      var readableData = helpers.eventCounter(readable, 'data');
      var buffer = new WritableArray();

      await writable.init;
      await readable.init;

      readable.pipe(buffer);

      writable.write({ test: true });

      await readableData;

      assert.equal(1, buffer.length);

      var received = buffer.pop();

      assert.deepEqual({ test: true }, received);
    });
  });
});
