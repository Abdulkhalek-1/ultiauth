import type { Request, Response, NextFunction } from "express";
import { redis } from "../redis/index.js";
import { ApiError } from "../utils/api-error.js";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix = "rl" } = options;
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip ?? "unknown";
    const key = `${keyPrefix}:${ip}`;

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (current > maxRequests) {
      throw ApiError.rateLimited();
    }

    next();
  };
}
