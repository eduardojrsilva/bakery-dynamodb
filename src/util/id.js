const { v4 } = require('uuid');

function generateUniqueId() {
  const id = v4();

  return id;
}

module.exports = generateUniqueId;