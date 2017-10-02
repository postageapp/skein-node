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
  static async open(options) {
    var connected = new Connected(options);

    await connected.init;

    return connected;
  }

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

  close() {
    if (this.channel) {
      this.channel.close();

      delete this.channel;
    }
  }

  prepareQueue(queueName, exchangeName, options) {
    return this.init = this.init.then(() => {
      return this.assertExchange(exchangeName, {
        exchangeType: options && options.exchangeType
      });
    }).then(exchange => {
      return this.assertQueue(queueName, {
        autoDelete: options && options.autoDelete
      });
    }).then(q => {
      return this.bindQueue(queueName, exchangeName, '*');
    });
  }

  isCustomExchange(name) {
    return typeof(name) == 'string' && name.length > 0;
  }

  assertExchange(name, options) {
    if (!this.isCustomExchange(name)) {
      return;
    }

    return this.channel.assertExchange(
      name,
      options && options.exchangeType || 'topic'
    );
  }

  assertQueue(name, options) {
    var autoDelete = options && options.autoDelete;

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

  checkQueue(queueName) {
    return this.channel.checkQueue(queueName);
  }

  deleteQueue(queueName, options) {
    return this.channel.deleteQueue(queueName, options);
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

  async readStream(queueName, exchangeName, options) {
    var stream = new Readable(this, queueName, exchangeName, options);

    await stream.init;

    return stream;
  }

  async writeStream(routingKey, exchangeName, options) {
    var stream = new Writable(this, routingKey, exchangeName, options);

    await stream.init;

    return stream;
  }
}

// == Exports ===============================================================

module.exports = Connected;
