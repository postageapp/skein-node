// == Imports ===============================================================

const Config = require('./config');

// == Constants =============================================================

// == Exported Class ========================================================

class Client {
  constructor(options) {
    this.config = new Config(options);
  }
}

// == Exports ===============================================================

module.exports = Client;
