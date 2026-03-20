import { Router } from "express";
import { ApiError } from "../../utils/api-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { rateLimit } from "../../middleware/rate-limit.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "./schemas.js";
import * as service from "./service.js";
import type { RegisterInput, LoginInput, RefreshInput, LogoutInput } from "./schemas.js";
import { StatusCodes } from "http-status-codes";

export const passwordRouter = Router();

// Rate limit auth endpoints: 10 requests per minute
const authRateLimit = rateLimit({
  windowMs: 60_000,
  maxRequests: 10,
  keyPrefix: "rl:auth",
});

passwordRouter.post(
  "/register",
  authRateLimit,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await service.register(req.body as RegisterInput);
    res.status(StatusCodes.CREATED).json({ data: result });
  })
);

passwordRouter.post(
  "/login",
  authRateLimit,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await service.login(req.body as LoginInput);
    res.status(StatusCodes.OK).json({ data: result });
  })
);

passwordRouter.post(
  "/refresh",
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as RefreshInput;
    const tokens = await service.refresh(refreshToken);
    res.status(StatusCodes.OK).json({ data: tokens });
  })
);

passwordRouter.post(
  "/logout",
  authenticate,
  validate(logoutSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as LogoutInput;
    await service.logout(refreshToken);
    res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
  })
);

passwordRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const user = await service.getMe(req.user.id);
    res.status(StatusCodes.OK).json({ data: user });
  })
);
