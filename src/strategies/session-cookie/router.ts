import { Router } from "express";
import { ApiError } from "../../utils/api-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { requireSession } from "../../middleware/require-session.js";
import { rateLimit } from "../../middleware/rate-limit.js";
import { sessionLoginSchema } from "./schemas.js";
import * as service from "./service.js";
import type { SessionLoginInput } from "./schemas.js";
import { StatusCodes } from "http-status-codes";

export const sessionRouter = Router();

const sessionRateLimit = rateLimit({
  windowMs: 60_000,
  maxRequests: 10,
  keyPrefix: "rl:session",
});

// Login — create session
sessionRouter.post(
  "/login",
  sessionRateLimit,
  validate(sessionLoginSchema),
  asyncHandler(async (req, res) => {
    const user = await service.login(req.body as SessionLoginInput);

    // Regenerate session to prevent fixation
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    req.session.userId = user.id;
    req.session.username = user.username;

    // Save session before responding
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.status(StatusCodes.OK).json({
      data: { user },
      message: "Logged in — session cookie set",
    });
  })
);

// Logout — destroy session
sessionRouter.post(
  "/logout",
  requireSession,
  asyncHandler(async (req, res) => {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.clearCookie("ultiauth.sid");
    res.status(StatusCodes.OK).json({ message: "Logged out — session destroyed" });
  })
);

// Get current user from session
sessionRouter.get(
  "/me",
  requireSession,
  asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      throw ApiError.unauthorized();
    }
    const user = await service.getMe(req.session.userId);
    res.status(StatusCodes.OK).json({ data: user });
  })
);
