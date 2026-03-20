import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { redis } from "./redis/index.js";
import { logger } from "./utils/logger.js";

const app = createApp();

async function start(): Promise<void> {
  // Connect to Redis
  await redis.connect();

  app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });
}

start().catch((err: unknown) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
