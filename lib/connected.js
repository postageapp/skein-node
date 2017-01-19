// == Imports ===============================================================

const Config = require('./config');
const RabbitMQ = require('./rabbitmq');

// == Constants =============================================================

// == Exported Class ========================================================

class Connected {
  constructor(options) {
    this.config = new Config(options);

    this.init = RabbitMQ.connect(this.config).then((rmq) => {
      this.rmq = rmq;

      return rmq.createChannel();
    }).then((ch) => {
      this.ch = ch;
    });
  }
}

// == Exports ===============================================================

module.exports = Connected;
