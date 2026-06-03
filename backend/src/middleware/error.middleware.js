import ApiError from '../utils/ApiError.js';
import envs from '../config/envs.js';

export default (err, req, res, next) => {
  if (!err) return next();
  const status = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || 'Internal Server Error'
  };
  if (err.details) payload.details = err.details;
  if (!envs.isProd && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
};
