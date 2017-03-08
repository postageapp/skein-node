// == Imports ===============================================================

const Connected = require('./connected');

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
      return this.channel.assertExchange(this.exchangeName);
    }).then(exchange => {
      return this.channel.assertQueue(
        this.queueName,
        {
          autoDelete: true
        }
      );
    }).then(() => {
      this.channel.consume(this.queueName, function(msg) {
        console.log(msg);
      });
    });
  }

  // FIX: Bind to queue, receive messages via subscription
};

// == Exports ===============================================================

module.exports = Worker;
