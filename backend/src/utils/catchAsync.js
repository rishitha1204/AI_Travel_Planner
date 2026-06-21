// Wraps an async controller/middleware function so any thrown error (or
// rejected promise) is forwarded to Express's error-handling middleware via
// next(), instead of every controller needing its own try/catch block.
export function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}