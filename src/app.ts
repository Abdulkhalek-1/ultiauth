import express from "express";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import RedisStore from "connect-redis";
import { redis } from "./redis/index.js";
import { env } from "./config/env.js";
import { rootRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";

export function createApp(): express.Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — allow credentials for session cookies
  app.use(cors({ credentials: true, origin: true }));

  // Body parsing
  app.use(express.json({ limit: "1mb" }));

  // Session middleware (Redis-backed)
  app.use(
    session({
      store: new RedisStore({ client: redis, prefix: "sess:" }),
      secret: env.SESSION_SECRET,
      name: "ultiauth.sid",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: env.SESSION_MAX_AGE_HOURS * 3_600_000,
      },
    })
  );

  // Routes
  app.use(rootRouter);

  // 404 handler
  app.use(notFound);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
