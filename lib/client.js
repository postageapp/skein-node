// == Imports ===============================================================

const merge = require('merge');

const Connected = require('./connected');

const RPC = require('./rpc');

// == Exported Class ========================================================

// Options:
//  * "exchange" = Which exchange to route messages to.

class Client extends Connected {
  constructor(options) {
    super(options);
  }

  rpc(exchange_name, options) {
    return new RPC(exchange_name, merge(true, this, options));
  }

  worker(options) {
    // ...
  }

  subscriber(queue_name, routing_key, options) {
    // ...
  }

  publisher(queue_name, options) {
    // ...
  }
}

// == Exports ===============================================================

module.exports = Client;
