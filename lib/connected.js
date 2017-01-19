// == Imports ===============================================================

const Config = require('./config');
const RabbitMQ = require('./rabbitmq');

// == Constants =============================================================

// == Exported Class ========================================================

class Connected {
  constructor(options) {
    this.config = new Config(options);

    this.connection = RabbitMQ.connect(this.config);
  }
}

// == Exports ===============================================================

module.exports = Connected;
