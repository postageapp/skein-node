// == Imports ===============================================================

const util = require('util');

const Promise = require('bluebird').Promise;
const Config = require('./config');

// == Exported Class ========================================================

class Handler {
  constructor(options) {
    // ...
  }

  handle(json) {
    let payload = JSON.parse(json);

    let method = this[payload.method];

    if (typeof(method) != 'function') {
      return Promise.resolve(JSON.stringify({
        id: payload.id,
        error: {
          code: -32601,
          message: 'Undefined endpoint ' + util.inspect(payload.method)
        },
        result: null
      }));
    }

    return Promise.resolve(
      this[payload.method].apply(this, payload.params)
    ).then((result) => {
      return JSON.stringify({
        id: payload.id,
        error: null,
        result: result
      });
    });
  }
}

// == Exports ===============================================================

module.exports = Handler;
