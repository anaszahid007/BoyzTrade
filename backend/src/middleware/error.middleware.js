import ErrorResponse from '../utils/ErrorResponse.js';
import env from '../config/env.js';

export default (err, req, res, next) => {
  if (!err) return next();
  const status = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || 'Internal Server Error'
  };
  if (err.details) payload.details = err.details;
  if (!env.isProd && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
};
