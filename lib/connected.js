// == Imports ===============================================================


const { Promise } = require('bluebird');
const merge = require('merge');

const { Readable, Writable } = require('./conduit');
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

  prepareQueue(queueName, exchangeName, options) {
    return this.init = this.init.then(() => {
      return this.assertExchange(exchangeName);
    }).then(exchange => {
      return this.assertQueue(queueName);
    }).then(q => {
      return this.bindQueue(queueName, exchangeName, '*');
    });
  }

  isCustomExchange(name) {
    return typeof(name) == 'string' && name.length > 0;
  }

  assertExchange(name, type) {
    if (!this.isCustomExchange(name)) {
      return;
    }

    return this.channel.assertExchange(
      name,
      type || 'topic'
    );
  }

  assertQueue(name, autoDelete) {
    return this.channel.assertQueue(
      name,
      {
        autoDelete: typeof(autoDelete) == 'undefined' ? true : autoDelete
      }
    );
  }

  bindQueue(queueName, exchangeName) {
    if (!this.isCustomExchange(exchangeName)) {
      return;
    }

    return this.channel.bindQueue(queueName, exchangeName, '*');  
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

  readStream(queueName, exchangeName, options) {
    return new Readable(this, queueName, exchangeName, options);
  }

  writeStream(routingKey, exchangeName, options) {
    return new Writable(this, routingKey, exchageName, options);
  }
}

// == Exports ===============================================================

module.exports = Connected;
