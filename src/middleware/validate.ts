import type { Request, Response, NextFunction } from "express";
import type { z } from "zod/v4";
import { ApiError } from "../utils/api-error.js";

export function validate<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw ApiError.badRequest("Validation failed", result.error.issues);
    }

    req.body = result.data;
    next();
  };
}
