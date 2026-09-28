const crypto = require('crypto');

function shortCode(prefix) {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

function sandboxToken() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = { shortCode, sandboxToken };
