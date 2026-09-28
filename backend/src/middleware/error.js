const { ApiError } = require('../utils/api');

function notFound(_req, _res, next) {
  next(new ApiError(404, 'Route not found'));
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || 'Internal server error',
  };

  if (err.errors) {
    payload.errors = err.errors;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    payload.stack = err.stack;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(payload);
}

module.exports = { notFound, errorHandler };
