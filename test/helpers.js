// == Imports ===============================================================

const assert = require('chai').assert;

// == Globals ===============================================================

global.assert = assert;

process.env.NODE_ENV = 'test';

// == Support Functions =====================================================

function eventCounter(emitter, type, limit, timeout, message) {
  return new Promise((resolve, reject) => {
    var counter = 0;
    var timer;

    if (!limit) {
      limit = 1;
    }

    if (timeout) {
      timer = setTimeout(() => {
        reject(
          new Error(
            message || `eventCounter timed out: ${counter}/${limit} received`
          )
        );
      }, timeout);
    }

    emitter.on(type, () => {
      ++counter;

      if (counter == limit) {
        if (timer) {
          clearTimeout(timer);  
        }
        resolve();
      }
    });
  });
}

// == Exports ===============================================================

module.exports = {
  assert: assert,
  eventCounter: eventCounter
};
