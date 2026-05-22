/**
 * Wrap async route handlers and forward errors
 * @param {Function} fn
 */
export default (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
