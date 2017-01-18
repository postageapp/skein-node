// == Imports ===============================================================

class Config = require('./lib/config');
class Client = require('./lib/client');
class Handler = require('./lib/handler');

// == Exports ===============================================================

module.exports = {
  Client: Client,
  Handler: Handler,
  Config: Config
};
