import IORedis from "ioredis";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const redis = new IORedis.default(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err: Error) => {
  logger.error({ err }, "Redis connection error");
});

redis.on("connect", () => {
  logger.info("Redis connected");
});
