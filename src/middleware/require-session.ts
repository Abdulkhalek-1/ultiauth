import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";

export function requireSession(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.session?.userId) {
    throw ApiError.unauthorized("No active session — please log in");
  }
  next();
}
