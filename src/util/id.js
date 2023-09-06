const KSUID = require('ksuid');

function generateUniqueId() {
  return KSUID.randomSync().string;
}

module.exports = generateUniqueId;