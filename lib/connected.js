// == Imports ===============================================================

const Promise = require('bluebird').Promise;

const Context = require('./context');
const Config = require('./config');
const RabbitMQ = require('./rabbitmq');

// == Constants =============================================================

// == Exported Class ========================================================

class Connected {
  constructor(options, init) {
    this.config = options && options.config || new Config(options);

    this.init = (init || Promise.resolve()).then(() => {
      if (options && options.connection) {
        this.connection = options.connection;
      }
      else {
        return RabbitMQ.connect(this.config).then(connection => {
          this.connection = connection;
        });
      }
    }).then(() => {
      if (options && options.channel) {
        this.channel = options.channel;
      }
      else {
       return this.connection.createChannel().then(channel => {
          this.channel = channel;
        });
      }
    });

    this.context = new Context(options);
  }
}

// == Exports ===============================================================

module.exports = Connected;
