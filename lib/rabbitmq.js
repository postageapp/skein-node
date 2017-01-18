// == Imports ===============================================================

// == Constants =============================================================

// == Exported Functions ====================================================

function connect(options) {
  var driver = require(options.driver);

  return driver.connect(options.uri());
}

// == Exports ===============================================================

module.exports = {
  connect: connect
};
