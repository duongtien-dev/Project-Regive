const jwt = require('jsonwebtoken');
const config = require('../config');
const Notification = require('../models/Notification');

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

async function createNotification({ userId, title, message, type = 'system', relatedId = null }) {
  return Notification.create({
    user: userId,
    title,
    message,
    type,
    relatedId,
  });
}

module.exports = { signToken, createNotification };
