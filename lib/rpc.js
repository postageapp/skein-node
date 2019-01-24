// == Imports ===============================================================

const merge = require('merge');

const Config = require('./config');
const Connected = require('./connected');
const json = require('./json');

// ==  Constants ============================================================

const defaults = {
  routingKey: '',
  persistent: true
};

// == Support Functions =====================================================

// == Exported Class ========================================================

function RPC(exchangeName, routingKey, options) {
  if (!options.routingKey) {
    options.routingKey = defaults.routingKey;
  }

  if (typeof(options.persistent) == 'undefined') {
    options.persistent = true;
  }

  let obj = { };

  let connected = obj.__connected = new Connected(new Config(options.config));
  let context = connected.context;
  let queueName = options.queueName || connected.context.ident();
  let requests = { };
  let persistent = options.persistent;

  routingKey = routingKey || options.routingKey;

  let handler = async msg => {
    let data = json.fromBuffer(msg.content);

    let request = requests[data.id];

    if (request) {
      if (request.error) {
        request.reject(request.error);
      }
      else {
        request.resolve.apply(request.resolve, data.result);  
      }
    }
  };

  // Sets up a Promise that waits for the connection to be fully established
  obj.init = connected.init.then(() => {
    return connected.assertExchange(
      exchangeName,
      'topic'
    );
  }).then(_exchange => {
    return connected.assertQueue(queueName, {
      exclusive: true,
      autoDelete: true
    });
  }).then(() => {
    return connected.channel.consume(queueName, handler);
  });

  // Create a Proxy that converts incoming method calls into the corresponding
  // JSON-RPC messages.
  return new Proxy(obj,
    {
      get: (_obj, prop) => {
        if (obj[prop]) {
          return obj[prop];
        }

        obj[prop] = function() {
          let messageId = context.requestId();

          connected.publishAsJson(
            exchangeName,
            routingKey,
            {
              jsonrpc: "2.0",
              id: messageId,
              method: prop,
              params: Array.prototype.slice.call(arguments)
            },
            {
              messageId: messageId,
              routingKey: routingKey,
              replyTo: queueName,
              persistent: persistent
            }
          );

          return new Promise((resolve, reject) => {
            requests[messageId] = { resolve, reject };
          });
        };

        return obj[prop];
      }
    }
  )
}

// == Exports ===============================================================

module.exports = RPC;
