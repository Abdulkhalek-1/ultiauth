import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler to forward rejected promises to Express error middleware.
 * Express 5 handles this natively, but this wrapper makes the intent explicit.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
