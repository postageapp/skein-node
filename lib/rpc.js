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

  var obj = { };

  var connected = obj.__connected = new Connected(new Config(options.config));
  var context = connected.context;
  var queueName = connected.context.ident();
  var routingKey = routingKey || options.routingKey;
  var requests = { };
  var persistent = options.persistent;

  var handler = function(msg) {
    var data = json.fromBuffer(msg.content);

    var request = requests[data.id];

    if (request) {
      if (request.error) {
        request.reject(request.error);
      }
      else {
        request.resolve.apply(request.resolve, data.result);  
      }
    }
  };

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

  return new Proxy(obj,
    {
      get: (_obj, prop) => {
        if (obj[prop]) {
          return obj[prop];
        }

        obj[prop] = function() {
          var messageId = context.requestId();

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
