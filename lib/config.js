// == Imports ===============================================================

const fs = require('fs');
const path = require('path');
const merge = require('merge');

// == Constants =============================================================

const configPathDefault = '../config/skein.json';
const envDefault = 'development';

const defaults = {
  host: '127.0.0.1',
  port: 5672,
  username: 'guest',
  password: 'guest',
  driver: 'amqplib',
  vhost: '',
  namespace: null
};

// == Exported Class ========================================================

class Config {
  static exist(atPath) {
    try {
      if (typeof(atPath) == 'undefined') {
        atPath = configPathDefault;
      }

      return fs.statSync(path.resolve(__dirname, atPath)).isFile();
    }
    catch (e) {
      switch (e.code) {
        case 'ENOENT':
          return false;
      }

      throw e;
    }
  }

  constructor(options) {
    merge(this, defaults);

    switch (typeof(options)) {
      case 'object':
        merge(this, options);

        break;
      case 'undefined':
        options = configPathDefault;
      default:
        var data = require(options);

        merge(this, data.defaults, data[this.env()]);

        break;
    }
  }

  env() {
    return process.env.NODE_ENV || envDefault;
  }

  uri() {
    return 'amqp://'
      + this.username
      + ':' + this.password
      + ':' + this.port
      + '@' + this.host
      + '/' + this.vhost;
  }
};

// == Exports ===============================================================

module.exports = Config;
