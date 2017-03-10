// == Imports ===============================================================

const Connected = require('./connected');
const json = require('./json');

// == Constants =============================================================

const defaults = {
  exchangeName: ''
};

// == Exported Class ========================================================

class Worker extends Connected {
  constructor(queueName, exchangeName, options) {
    super(options);

    this.exchangeName = exchangeName || defaults.exchangeName;
    this.queueName = queueName || this.context.ident();

    this.init = this.init.then(() => {
      return this.channel.assertExchange(
        this.exchangeName,
        'topic'
      );
    }).then(exchange => {
      return this.channel.assertQueue(
        this.queueName,
        {
          autoDelete: true
        }
      );
    }).then((q) => {
      return this.channel.bindQueue(this.queueName, this.exchangeName, '*');
    }).then((r) => {
      return this.channel.consume(this.queueName, msg => {
        var request = json.fromBuffer(msg.content);
        var replyTo = msg.properties.replyTo;

        if (this[request.method]) {
          Promise.resolve().then(() => {
            return this[request.method].apply(this, request.params);
          }).then(result => {
            this.channel.publish(
              '',
              replyTo,
              json.toBuffer({
                jsonrpc: "2.0",
                id: request.id,
                result: result
              }),
              {
                contentType: 'application/json',
                contentEncoding: 'utf8'
              }
            );

          });
        }

      });
    });
  }

  // FIX: Bind to queue, receive messages via subscription
};

// == Exports ===============================================================

module.exports = Worker;
