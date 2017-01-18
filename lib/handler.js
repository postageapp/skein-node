// == Imports ===============================================================

const Config = require('./config');

// == Exported Class ========================================================

class Handler {
  constructor(options) {
    this.config = new Config(options);
  }
}

// == Exports ===============================================================

module.exports = Handler;
