import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";
import { validateKey } from "../strategies/api-key/service.js";

export async function authenticateApiKey(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || typeof apiKey !== "string") {
    throw ApiError.unauthorized("Missing X-API-Key header");
  }

  const result = await validateKey(apiKey);
  req.apiKey = result;
  next();
}
