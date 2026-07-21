import ErrorResponse from '../utils/ErrorResponse.js';

export default function parseFormData(req, _res, next) {
  try {
    if (req.body && req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  } catch {
    next(new ErrorResponse(400, 'Invalid form data'));
  }
}
