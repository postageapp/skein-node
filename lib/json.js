// == Exported Functions ====================================================

function toBuffer(data) {
  return Buffer.from(JSON.stringify(data, 'utf8'));
}

function fromBuffer(data) {
  return JSON.parse(data.toString());
}

// == Exports ===============================================================

module.exports = {
  toBuffer: toBuffer,
  fromBuffer: fromBuffer
};
