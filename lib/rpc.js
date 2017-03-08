// == Imports ===============================================================

const Config = require('./config');
const Connected = require('./connected');

// == Support Functions =====================================================

// == Exported Class ========================================================

function RPC(exchangeName, options) {
  var obj = { };

  var connected = obj.__connected = new Connected(new Config(options));
  var context = connected.context;
  var channel;
  var exchange;
  var queueName = connected.context.ident();
  var routingKey = options && options.routingKey || undefined;
  var requests = { };

  var handler = function(msg) {
    console.log(msg);

    var data = JSON.parse(msg.content);

    console.log(data);
  };

  obj.init = connected.init.then(() => {
    channel = connected.channel;

    return channel.assertExchange(exchangeName);
  }).then(_exchange => {
    exchange = _exchange;

    return channel.assertQueue(queueName, {
      exclusive: true,
      autoDelete: true
    });
  }).then(() => {
    return channel.consume(queueName, handler);
  });

  return new Proxy(obj,
    {
      get: (_obj, prop) => {
        if (obj[prop]) {
          return obj[prop];
        }

        obj[prop] = function() {
          var messageId = context.requestId();

          var request = Buffer.from(
            JSON.stringify({
              id: messageId,
              method: prop,
              params: Array.prototype.slice.call(arguments)
            }),
            'utf8'
          );

          channel.publish(exchangeName, routingKey, request, {
            contentType: 'application/json',
            messageId: messageId,
            replyTo: queueName
          });

          return new Promise((resolve, reject) => {
            requests[messageId] = [ resolve, reject ];
          });
        };

        return obj[prop];
      }
    }
  )
}

// == Exports ===============================================================

module.exports = RPC;
