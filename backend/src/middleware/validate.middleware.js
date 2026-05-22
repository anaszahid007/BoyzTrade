/**
 * Validate request body using a zod schema
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next({ statusCode: 400, message: 'Validation error', details: result.error.format() });
  req.body = result.data;
  return next();
};
