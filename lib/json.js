// == Exported Functions ====================================================

function toBuffer(data, enc) {
  return Buffer.from(JSON.stringify(data, enc || 'utf8'));
}

function fromBuffer(data) {
  return JSON.parse(data.toString());
}

// == Exports ===============================================================

module.exports = {
  toBuffer: toBuffer,
  fromBuffer: fromBuffer
};
