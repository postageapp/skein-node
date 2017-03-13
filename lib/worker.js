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
        var request;
        var replyTo = msg.properties.replyTo;

        try {
          request = json.fromBuffer(msg.content);
        }
        catch (err) {
          return this.replyParseError(msg, err);
        }

        if (request.jsonrpc != '2.0') {
          return this.replyInvalidRequest(msg, 'Missing or invalid "jsonrpc" property');
        }

        if (!request.method) {
          return this.replyInvalidRequest(msg, 'Missing or invalid "method" property');
        }

        if (this[request.method]) {
          Promise.resolve().then(() => {
            try {
              return this[request.method].apply(this, [ request.params ]);
            }
            catch (err) {
              return this.replyWithInternalError(replyTo, request.id, request.method, err);
            }
          }).then(result => {
            return this.replyWithResult(replyTo, request.id, result);
          });
        }
      });
    });
  }

  replyWithInternalError(replyTo, requestId, method, err) {
    return this.publishAsJson(
      '',
      replyTo,
      {
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: -32603,
          message: 'Internal error when handling ' + JSON.stringify(method),
          data:  err.toString()
        }
      }
    );
  }

  replyWithResult(replyTo, requestId, result) {
    return this.publishAsJson(
      '',
      replyTo,
      {
        jsonrpc: "2.0",
        id: requestId,
        result: result
      }
    );
  }

  replyInvalidRequest(msg, details) {
    return this.publishAsJson(
      '',
      msg.properties.replyTo,
      {
        jsonrpc: "2.0",
        id: msg.properties.messageId,
        error: {
          code: -32600,
          message: 'Invalid request: ' + details
        }
      }
    );
  }

  replyParseError(msg, err) {
    return this.publishAsJson(
      '',
      msg.properties.replyTo,
      {
        jsonrpc: "2.0",
        id: msg.properties.messageId,
        error: {
          code: -32700,
          message: 'Invalid JSON data',
          data:  err.toString()
        }
      }
    );
  }
};

// == Exports ===============================================================

module.exports = Worker;
