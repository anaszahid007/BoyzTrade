/**
 * Standard API response wrapper
 */
export const success = (res, data = null, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, status, data });

export const error = (res, message = 'Error', status = 500, details = null) =>
  res.status(status).json({ success: false, message, details, status });

export default { success, error };
