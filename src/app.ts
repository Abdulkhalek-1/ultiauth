import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rootRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";

export function createApp(): express.Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(cors());

  // Body parsing
  app.use(express.json({ limit: "1mb" }));

  // Routes
  app.use(rootRouter);

  // 404 handler
  app.use(notFound);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
