// == Imports ===============================================================

const path = require('path');

const Connected = require('../lib/connected');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Connected', () => {
  it('can provide a default configuration', async () => {
    var connected = new Connected();

    await connected.init;
  });
});
