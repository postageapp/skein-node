// == Imports ===============================================================

// == Constants =============================================================

// == Exported Functions ====================================================

function connect(options) {
  var driver = require(options.driver);

  return driver.connect(
  );
}

// == Exports ===============================================================

module.exports = {
  connect: connect
};
