import { Router } from "express";
import { ApiError } from "../../utils/api-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authenticateApiKey } from "../../middleware/authenticate-api-key.js";
import { rateLimit } from "../../middleware/rate-limit.js";
import { generateKeySchema } from "./schemas.js";
import * as service from "./service.js";
import type { GenerateKeyInput } from "./schemas.js";
import { StatusCodes } from "http-status-codes";

export const apiKeyRouter = Router();

const apiKeyRateLimit = rateLimit({
  windowMs: 60_000,
  maxRequests: 10,
  keyPrefix: "rl:api-key",
});

// Generate a new API key (requires JWT auth)
apiKeyRouter.post(
  "/generate",
  authenticate,
  apiKeyRateLimit,
  validate(generateKeySchema),
  asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await service.generate(req.user.id, req.body as GenerateKeyInput);
    res.status(StatusCodes.CREATED).json({
      data: result,
      message: "Store this key securely — it won't be shown again",
    });
  })
);

// List all API keys for the authenticated user
apiKeyRouter.get(
  "/list",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const keys = await service.list(req.user.id);
    res.status(StatusCodes.OK).json({ data: keys });
  })
);

// Revoke an API key
apiKeyRouter.delete(
  "/:keyId",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const keyId = req.params["keyId"] as string;
    await service.revoke(req.user.id, keyId);
    res.status(StatusCodes.OK).json({ message: "API key revoked" });
  })
);

// Test endpoint: verify an API key works (authenticated via X-API-Key header)
apiKeyRouter.get(
  "/verify",
  authenticateApiKey,
  asyncHandler(async (req, res) => {
    if (!req.apiKey) throw ApiError.unauthorized();
    res.status(StatusCodes.OK).json({
      data: {
        userId: req.apiKey.userId,
        scopes: req.apiKey.scopes,
      },
      message: "API key is valid",
    });
  })
);
