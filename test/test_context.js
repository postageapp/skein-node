// == Imports ===============================================================

const Context = require('../lib/context');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Context', () => {
  it('can work with defaults', () => {
    var context = new Context();

    assert.ok(context);

    assert.equal(context.processName, '_mocha');

    assert.ok(context.processId);
  });
});
