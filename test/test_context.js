// == Imports ===============================================================

const Context = require('../lib/context');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Context', () => {
  it('can work with defaults', () => {
    let context = new Context();

    assert.ok(context);

    assert.equal(context.processName, '_mocha');

    assert.ok(context.processId);
  });

  it('consistently issues ident values', () => {
    let context = new Context();

    let idents = [
      context.ident(),
      context.ident()
    ];

    assert.equal(idents[0], idents[1]);
  });

  it('consistently issues unique ident values per-context', () => {
    let idents = [
      new Context().ident(),
      new Context().ident()
    ];

    assert.notEqual(idents[0], idents[1]);
  });
});
