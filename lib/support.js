// == Imports ===============================================================

// == Exported Functions ====================================================

function processName() {
  return process.argv[1].split(/\//).reverse()[0].replace(/\.js$/, '');
}

// == Exports ===============================================================

module.exports = {
  processName: processName
};
