// == Imports ===============================================================

const { Writable } = require('stream');

// == Exported Class ========================================================

class WritableArray extends Writable {
  constructor() {
    super({ objectMode: true });

    this.array = [ ];
  }

  _write(o, enc, cb) {
    this.array.push(o);

    cb();
  }

  get length() {
    return this.array.length;
  }

  pop() {
    return this.array.pop();
  }

  shift() {
    return this.array.shift();
  }
}

// == Exports ===============================================================

module.exports = WritableArray;
