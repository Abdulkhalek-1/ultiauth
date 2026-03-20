import { Router } from "express";
import { healthRouter } from "./health.js";
import { passwordRouter } from "../strategies/username-password/router.js";
import { apiKeyRouter } from "../strategies/api-key/router.js";
import { sessionRouter } from "../strategies/session-cookie/router.js";

export const rootRouter = Router();

// Health check
rootRouter.use("/health", healthRouter);

// Strategy 1: Username/Password + JWT (implemented)
rootRouter.use("/auth/password", passwordRouter);

// Strategy 2: API Key Auth (implemented)
rootRouter.use("/auth/api-key", apiKeyRouter);

// Strategy 3: Session-based Auth (implemented)
rootRouter.use("/auth/session", sessionRouter);

// TODO(jwt-refresh): Mount JWT refresh token rotation router (enhanced standalone)
// rootRouter.use("/auth/token", tokenRouter);

// TODO(oauth2-google): Mount Google OAuth 2.0 router
// rootRouter.use("/auth/oauth/google", googleOAuthRouter);

// TODO(oauth2-github): Mount GitHub OAuth 2.0 router
// rootRouter.use("/auth/oauth/github", githubOAuthRouter);

// TODO(saml): Mount SAML 2.0 SSO router
// rootRouter.use("/auth/saml", samlRouter);

// TODO(oidc): Mount OpenID Connect router
// rootRouter.use("/auth/oidc", oidcRouter);

// TODO(passkey-webauthn): Mount Passkeys / WebAuthn router
// rootRouter.use("/auth/webauthn", webauthnRouter);

// TODO(magic-link): Mount Magic Link router
// rootRouter.use("/auth/magic-link", magicLinkRouter);

// TODO(totp-mfa): Mount TOTP/MFA router
// rootRouter.use("/auth/mfa", mfaRouter);

// TODO(mutual-tls): Mount mTLS router
// rootRouter.use("/auth/mtls", mtlsRouter);

// TODO(rbac-abac): Mount RBAC/ABAC authorization router
// rootRouter.use("/authz", authzRouter);
