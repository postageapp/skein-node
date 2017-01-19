// == Imports ===============================================================

const Connected = require('./connected');

// == Exported Class ========================================================

// Options:
//  * "exchange" = Which exchange to route messages to.

class Client extends Connected {
  constructor(options) {
    super(options);

    this.init.then(() => {
      this.ch.createQueue();
    });
  }
}

// == Exports ===============================================================

module.exports = Client;
