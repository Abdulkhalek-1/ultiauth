import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/api-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { rateLimit } from "../../middleware/rate-limit.js";
import * as service from "./service.js";

export const googleOAuthRouter = Router();

const googleOAuthRateLimit = rateLimit({
  windowMs: 60_000,
  maxRequests: 10,
  keyPrefix: "rl:google-oauth",
});

// Redirect to Google consent screen
googleOAuthRouter.get(
  "/",
  googleOAuthRateLimit,
  asyncHandler(async (req, res) => {
    const { url, state } = service.generateAuthUrl();

    // Store state in session for CSRF verification in callback
    req.session.oauthState = state;

    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.redirect(url);
  }),
);

// Handle OAuth callback — exchange code for tokens, create session
googleOAuthRouter.get(
  "/callback",
  googleOAuthRateLimit,
  asyncHandler(async (req, res) => {
    const code = req.query["code"];
    const state = req.query["state"];

    if (typeof code !== "string" || typeof state !== "string") {
      throw ApiError.badRequest("Missing code or state parameter");
    }

    const user = await service.handleCallback(
      code,
      state,
      req.session.oauthState,
    );

    // Clear the OAuth state
    delete req.session.oauthState;

    // Regenerate session to prevent fixation
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    req.session.userId = user.userId;
    req.session.username = user.username;

    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.status(StatusCodes.OK).json({
      data: { user },
      message: "Logged in via Google — session cookie set",
    });
  }),
);
