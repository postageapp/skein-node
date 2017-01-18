// == Imports ===============================================================

const assert = require('chai').assert;

// == Globals ===============================================================

global.assert = assert;

process.env.NODE_ENV = 'test';

// == Exports ===============================================================

module.exports = {
  assert: assert
};
