// == Imports ===============================================================

const { Readable, Writable } = require('stream');

const json = require('./json');

// == Constants =============================================================

const defaults = {
  exchangeName: ''
};

// == Exported Functions ====================================================

// == Exported Class ========================================================

class ReadableCondiut extends Readable {
  constructor(connected, queueName, exchangeName, options) {
    super({ objectMode: true });

    this.connected = connected;

    this.exchangeName = exchangeName || defaults.exchangeName;
    this.queueName = queueName || this.connected.context.ident();

    const customExchange = typeof(this.exchangeName) == 'string' && this.exchangeName.length > 0;

    this.init = (async () => {
      await this.connected.init;

      this.channel = await this.connected.createChannel();

      await this.connected.prepareQueue(this.queueName, this.exchangeName);

      let consumer = await this.channel.consume(this.queueName, msg => {
        this.channel.ack(msg);

        this.push(json.fromBuffer(msg.content));
      });

      this.consumerTag = consumer.consumerTag;
    })();
  }

  _read(size) {
    // Nothing special here.
  }

  _destroy(err, cb) {
    if (this.consumerTag) {
      try {
        this.channel.close();
      }
      catch (err) {
        // Close failed, but this is being shut down anyway.
      }
    }

    cb();
  }
}

class WriteableConduit extends Writable {
  constructor(connected, routingKey, exchangeName, options) {
    super({ objectMode: true });

    this.connected = connected;
    this.routingKey = routingKey;
    this.exchangeName = exchangeName || '';
  }

  _write(msg, enc, cb) {
    this.connected.publishAsJson(this.exchangeName, this.routingKey, msg);

    cb();
  }

  _final(cb) {
    cb();
  }
}

// == Exports ===============================================================

module.exports = {
  Readable: ReadableCondiut,
  Writable: WriteableConduit
};
