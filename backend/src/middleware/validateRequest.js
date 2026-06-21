import { ApiError } from '../utils/ApiError.js';

export function validateRequest(schema, target = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || target,
        message: issue.message,
      }));
      return next(ApiError.badRequest('Invalid request data', details));
    }

    if (target === 'query') {
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, result.data);
    } else {
      req[target] = result.data;
    }
    next();
  };
}
