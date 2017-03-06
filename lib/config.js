// == Imports ===============================================================

const fs = require('fs');
const path = require('path');
const merge = require('merge');

// == Constants =============================================================

const configPathDefault = '../config/skein.json';
const envDefault = 'development';

const defaults = {
  host: 'localhost',
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
        if (Config.exist()) {
          options = configPathDefault;
        }

        // Fallthrough to reading options in
      default:
        if (options) {
          var data = require(options);

          merge(this, data.defaults, data[this.env()]);
        }

        break;
    }
  }

  env() {
    return process.env.NODE_ENV || envDefault;
  }

  uri() {
    var uri = 'amqp://';

    if (this.username && this.username != defaults.username)
    {
      uri += encodeURIComponent(this.username);

      if (this.password && this.password != defaults.password) {
        uri += ':' + encodeURIComponent(this.password);
      }

      uri += '@';
    }

    uri += this.host;

    if (this.port && this.port != defaults.port) {
      uri += ':' + this.port;
    }

    uri += '/' + this.vhost.replace(/^\//, '');

    return uri;
  }
};

// == Exports ===============================================================

module.exports = Config;
