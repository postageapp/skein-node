// == Imports ===============================================================

const os = require('os');
const uuid = require('uuid/v4');
const sprintf = require('sprintf');

const processName = require('./support').processName;

// == Exported Class ========================================================

class Context {
  constructor(options) {
    this.hostname = options && options.hostname || os.hostname();
    this.processName = options && options.processName || processName();
    this.processId = options && options.processId || process.pid;
  }

  ident(object) {
    return sprintf(
      '%s#%d+%s@%s',
      this.processName,
      this.processId,
      object.id,
      this.hostname
    );
  }
}

// == Exports ===============================================================

module.exports = Context;
