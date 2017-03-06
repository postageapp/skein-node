// == Imports ===============================================================

const Config = require('./config');
const Connected = require('./connected');

// == Exported Class ========================================================

class RPC extends Connected {
  constructor(exchange_name, options) {
    if (options && options.config) {
      options.config = new Config(options.config);
    }

    super(options);

    this.init = this.init.then(() => {
      this.queue = this.channel.assertQueue();
    });
  }
}

// == Exports ===============================================================

module.exports = RPC;
