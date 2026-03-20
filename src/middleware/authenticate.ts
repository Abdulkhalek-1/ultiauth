import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokens.js";
import { ApiError } from "../utils/api-error.js";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Missing or invalid Authorization header");
  }

  const token = header.slice(7);

  try {
    const payload = await verifyAccessToken(token);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }
}
