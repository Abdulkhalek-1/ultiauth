import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/api-error.js";
import { logger } from "../utils/logger.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Zod v4 validation errors
  if (
    err instanceof Error &&
    "issues" in err &&
    Array.isArray((err as Record<string, unknown>)["issues"])
  ) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: (err as Record<string, unknown>)["issues"],
    });
    return;
  }

  logger.error({ err }, "Unhandled error");

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    code: "INTERNAL_ERROR",
    message: "Internal server error",
  });
}
