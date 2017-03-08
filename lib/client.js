// == Imports ===============================================================

const merge = require('merge');

const Connected = require('./connected');

const RPC = require('./rpc');
const Worker = require('./worker');
const Subscriber = require('./subscriber');
const Publisher = require('./publisher');

// == Exported Class ========================================================

// Options:
//  * "exchange" = Which exchange to route messages to.

class Client extends Connected {
  constructor(options) {
    super(options);
  }

  createOptions(options) {
    return merge({
      config: this.config,
      connection: this.connection,
      channel: this.channel
    }, options);
  }

  rpc(exchangeName, options) {
    return new RPC(exchangeName, this.createOptions(options));
  }

  worker(options) {
    return new Worker(this.createOptions(options));
  }

  subscriber(queueName, routing_key, options) {
    return new Subscriber(queueName, routing_key, this.createOptions(options));
  }

  publisher(queueName, options) {
    return new Publisher(queueName, this.createOptions(options));
  }
}

// == Exports ===============================================================

module.exports = Client;
