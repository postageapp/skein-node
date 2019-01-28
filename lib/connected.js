// == Imports ===============================================================

const EventEmitter = require('events');

const { Promise } = require('bluebird');
const merge = require('merge');

const { Readable, Writable } = require('./conduit');
const Context = require('./context');
const Config = require('./config');
const RabbitMQ = require('./rabbitmq');

const json = require('./json');

// == Constants =============================================================

// == Exported Class ========================================================

class Connected extends EventEmitter{
  static async open(options) {
    let connected = new Connected(options);

    await connected.init;

    return connected;
  }

  constructor(options, init) {
    super();
    
    this.config = options && options.config || new Config(options);

    this.init = (async () => {
      if (init) {
        await init;
      }

      if (options && options.connection) {
        this.connection = options.connection;
        ++this.connection.__refs;
      }
      else {
        this.connection = await RabbitMQ.connect(this.config);
        this.connection.__refs = 1;
      }

      if (options && options.channel) {
        this.channel = options.channel;
      }
      else {
        this.channel = await this.connection.createChannel();
      }
    })();

    this.context = new Context(options);
  }

  async createChannel() {
    return this.connection.createChannel();
  }

  async close() {
    let channel = this.channel;

    if (channel) {
      delete this.channel;

      try {
        await channel.close();
      }
      catch (err) {
        /// Close attempt failed, but must carry on.
      }
    }

    --this.connection.__refs;

    if (!this.connection.__refs) {
      let connection = this.connection;

      delete this.connection;

      return connection.close();
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
    let autoDelete = options && options.autoDelete;

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

  async publishAsJson(exchangeName, routingKey, data, options) {
    await this.channel.publish(
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

  async consumeAsPromise(replyQueue, action) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!replyQueue) {
          replyQueue = this.context.ident();
        }
  
        await this.channel.assertQueue(replyQueue, {
          exclusive: true,
          autoDelete: true
        });

        await this.channel.consume(replyQueue, msg => {
          resolve(msg);
        });
        
        if (action) {
          action();
        }
      }
      catch (err) {
        reject(err);
      }
    });
  }

  async readStream(queueName, exchangeName, options) {
    let stream = new Readable(this, queueName, exchangeName, options);

    await stream.init;

    return stream;
  }

  async writeStream(routingKey, exchangeName, options) {
    let stream = new Writable(this, routingKey, exchangeName, options);

    await stream.init;

    return stream;
  }
}

// == Exports ===============================================================

module.exports = Connected;
