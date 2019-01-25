// == Imports ===============================================================

const Connected = require('./connected');
const json = require('./json');

// == Constants =============================================================

const defaults = {
  exchangeName: '',
  exchangeType: 'topic'
};

const jsonrpc = {
  version: '2.0'
};

// == Exported Class ========================================================

class Worker extends Connected {
  constructor(queueName, exchangeName, options) {
    super(options);

    this.exchangeName = exchangeName || defaults.exchangeName;
    this.exchangeType = options && options.exchangeType || defaults.exchangeType;
    this.queueName = queueName || this.context.ident();
    this.autoDelete = options && options.autoDelete;

    let init = this.init;

    this.init = (async () => {
      await init;

      await this.assertExchange(this.exchangeName, this.exchangeType);

      await this.assertQueue(this.queueName, { autoDelete: this.autoDelete });

      await this.bindQueue(this.queueName, this.exchangeName, '*');

      await this.channel.consume(this.queueName, msg => {
        this.consumeMessage(msg);
      });
    })();
  }

  ack(msg) {
    return this.channel.ack(msg);
  }

  nack(msg) {
    return this.channel.nack(msg);
  }

  async consumeMessage(msg) {
    let request;
    let replyTo = msg.properties && msg.properties.replyTo;

    try {
      request = json.fromBuffer(msg.content);
    }
    catch (err) {
      this.ack(msg);
      
      return this.replyParseError(msg, err);
    }

    // FIX: Handle array-style request batches.

    if (request.jsonrpc != '2.0') {
      this.ack(msg);

      return this.replyInvalidRequest(msg, 'Missing or invalid "jsonrpc" property');
    }

    if (typeof(request.method) != 'string') {
      this.ack(msg);

      return this.replyInvalidRequest(msg, 'Missing or invalid "method" property');
    }

    switch (typeof(this[request.method])) {
      case 'function':
        let result;

        try {
          result = await this[request.method].apply(this, request.params);
        }
        catch (err) {
          this.emit('err', err, request, msg);

          this.nack(msg);

          return this.replyWithInternalError(replyTo, request.id, request.method, err);
        }

        await this.replyWithResult(replyTo, request.id, result);

        this.ack(msg);

        break;
      default:
        this.ack(msg);

        return this.replyMethodNotFound(replyTo, request);
    }
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
    if (!(result instanceof Array)) {
      result = [ result ];
    }

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
    if (!msg.properties || !msg.properties.replyTo) {
      // Can't reply, so just trash it.
      return;
    }

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

  replyMethodNotFound(replyTo, request) {
    return this.publishAsJson(
      '',
      replyTo,
      {
        jsonrpc: jsonrpc.version,
        id: request.id,
        error: {
          code: -32601,
          message: 'Method not found: ' + request.method
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
