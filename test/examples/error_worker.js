// == Imports ===============================================================

const Worker = require('../../lib/worker');

// == Exported Classes ======================================================

class ErrorWorker extends Worker {
  error() {
    x();
  }
}

// == Exports ===============================================================

module.exports = ErrorWorker;
