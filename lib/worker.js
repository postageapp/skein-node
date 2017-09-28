// == Imports ===============================================================

const Connected = require('./connected');
const json = require('./json');

// == Constants =============================================================

const defaults = {
  exchangeName: ''
};

const jsonrpc = {
  version: '2.0'
};

// == Exported Class ========================================================

class Worker extends Connected {
  constructor(queueName, exchangeName, options) {
    super(options);

    this.exchangeName = exchangeName || defaults.exchangeName;
    this.queueName = queueName || this.context.ident();

    const customExchange = typeof(this.exchangeName) == 'string' && this.exchangeName.length > 0;

    this.init = this.init.then(() => {
      if (customExchange) {
        return this.channel.assertExchange(
          this.exchangeName,
          'topic'
        );
      }
    }).then(exchange => {
      var autoDelete = options && options.config && options.config.autoDelete;

      return this.channel.assertQueue(
        this.queueName,
        {
          autoDelete: typeof(autoDelete) == 'undefined' ? true : autoDelete
        }
      );
    }).then(q => {
      if (customExchange) {
        return this.channel.bindQueue(this.queueName, this.exchangeName, '*');
      }
    }).then(r => {
      return this.channel.consume(this.queueName, msg => {
        var request;
        var replyTo = msg.properties.replyTo;

        try {
          request = json.fromBuffer(msg.content);
        }
        catch (err) {
          this.channel.ack(msg);
          
          return this.replyParseError(msg, err);
        }

        if (request.jsonrpc != '2.0') {
          this.channel.ack(msg);

          return this.replyInvalidRequest(msg, 'Missing or invalid "jsonrpc" property');
        }

        if (!request.method) {
          this.channel.ack(msg);

          return this.replyInvalidRequest(msg, 'Missing or invalid "method" property');
        }

        if (this[request.method]) {
          Promise.resolve().then(() => {
            try {
              return this[request.method].apply(this, request.params);
            }
            catch (err) {
              this.channel.nack(msg);

              return this.replyWithInternalError(replyTo, request.id, request.method, err);
            }
          }).then(result => {
            return this.replyWithResult(replyTo, request.id, result);
          }).then(() => {
            return this.channel.ack(msg);
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
        jsonrpc: jsonrpc.version,
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
        jsonrpc: jsonrpc.version,
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
        jsonrpc: jsonrpc.version,
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
        jsonrpc: jsonrpc.version,
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
