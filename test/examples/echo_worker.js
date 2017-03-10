// == Imports ===============================================================

const Worker = require('../../lib/worker');

// == Exported Classes ======================================================

class EchoWorker extends Worker {
  echo() {
    return Array.prototype.slice.call(arguments);
  }
}

// == Exports ===============================================================

module.exports = EchoWorker;
