// == Imports ===============================================================

const Connected = require('./connected');

// == Exported Class ========================================================

class Publisher extends Connected {
  constructor(queueName, options) {
    super(options);

    this.queueName = queueName;
  }
}

// == Exports ===============================================================

module.exports = Publisher;
