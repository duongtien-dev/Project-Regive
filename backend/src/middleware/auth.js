const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { ApiError } = require('../utils/api');

async function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid or inactive user'));
    }
    req.user = user;
    return next();
  } catch (_err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden'));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
