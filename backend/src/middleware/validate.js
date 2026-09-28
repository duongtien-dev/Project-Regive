const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/api');

function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', result.array()));
  }
  return next();
}

module.exports = { validate };
