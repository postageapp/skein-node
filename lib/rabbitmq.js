// == Imports ===============================================================

// == Exported Functions ====================================================

function connect(config) {
  let driver = require(config.driver);

  return driver.connect(config.uri());
}

// == Exports ===============================================================

module.exports = {
  connect: connect
};
