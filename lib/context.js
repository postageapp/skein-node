// == Imports ===============================================================

const os = require('os');
const uuid = require('uuid/v4');
const sprintf = require('sprintf');

const processName = require('./support').processName;

// == Exported Class ========================================================

let sequence = 0;

class Context {
  static sequence() {
    return sequence++;
  }

  constructor(options) {
    this.hostname = options && options.hostname || os.hostname();
    this.processName = options && options.processName || processName();
    this.processId = options && options.processId || process.pid;
    this.sequence = Context.sequence();
  }

  ident() {
    return sprintf(
      '%s#%d+%s@%s',
      this.processName,
      this.processId,
      this.sequence,
      this.hostname
    );
  }

  requestId() {
    return uuid();
  }
}

// == Exports ===============================================================

module.exports = Context;
