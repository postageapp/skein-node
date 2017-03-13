// == Imports ===============================================================

const Promise = require('bluebird').Promise;
const merge = require('merge');

const Context = require('./context');
const Config = require('./config');
const RabbitMQ = require('./rabbitmq');

const json = require('./json');

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

  publishAsJson(exchangeName, routingKey, data, options) {
    return this.channel.publish(
      exchangeName,
      routingKey,
      json.toBuffer(data),
      merge(
        {
          contentType: 'application/json',
          contentEncoding: 'utf8'
        }, options
      )
    );
  }

  consumeAsPromise(replyQueue, action) {
    return new Promise((resolve, reject) => {
      if (!replyQueue) {
        replyQueue = this.context.ident();
      }

      this.channel.assertQueue(replyQueue, {
        exclusive: true,
        autoDelete: true
      }).then(() => {
        this.channel.consume(replyQueue, msg => {
          resolve(msg);
        });
      }).then(() => {
        if (action) {
          action();
        }
      })
    });
  }
}

// == Exports ===============================================================

module.exports = Connected;
