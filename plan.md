# UltiAuth — Implementation Roadmap

Every major authentication method, implemented and explained in a single TypeScript codebase.

## Strategy Progress

### 1. Username/Password + JWT
- [x] **Status:** Implemented
- **Difficulty:** Beginner
- **Description:** Classic email/password registration with Argon2id hashing and JWT access tokens. Includes refresh token rotation with reuse detection.
- **Endpoints:** `POST /auth/password/register`, `/login`, `/refresh`, `/logout`, `GET /me`
- **Packages:** `argon2`, `jose`
- **DB Tables:** `users`, `refresh_tokens`

---

### 2. JWT Refresh Token Rotation
- [ ] **Status:** Planned (enhanced standalone)
- **Difficulty:** Beginner–Intermediate
- **Description:** Deep-dive into refresh token rotation as a standalone concept. Covers token families, reuse detection, sliding expiry, and Redis-based access token blacklisting.
- **Note:** Basic rotation is already implemented in Strategy 1. This enhances it with blacklist support and monitoring.
- **Packages:** (uses existing deps)
- **DB Changes:** Add index on `refresh_tokens.family_id`

---

### 3. Session-based Auth (express-session + Redis)
- [ ] **Status:** Planned
- **Difficulty:** Beginner
- **Description:** Traditional stateful sessions with httpOnly cookies and Redis session store. Demonstrates the stateful vs. stateless auth trade-off and CSRF protection.
- **Endpoints:** `POST /auth/session/login`, `/logout`, `GET /me`
- **Packages:** `express-session`, `connect-redis`
- **DB Changes:** None (sessions in Redis)

---

### 4. OAuth 2.0 — Google Provider
- [ ] **Status:** Planned
- **Difficulty:** Intermediate
- **Description:** Authorization Code flow with PKCE. Redirects user to Google consent screen, exchanges auth code for tokens, verifies id_token, and links OAuth account to local user.
- **Endpoints:** `GET /auth/oauth/google`, `/auth/oauth/google/callback`
- **Packages:** None (fetch + jose)
- **DB Changes:** New `oauth_accounts` table

---

### 5. OAuth 2.0 — GitHub Provider
- [ ] **Status:** Planned
- **Difficulty:** Intermediate
- **Description:** Same Authorization Code flow adapted for GitHub's API. Demonstrates how to abstract multiple OAuth providers into a reusable pattern.
- **Endpoints:** `GET /auth/oauth/github`, `/auth/oauth/github/callback`
- **Packages:** None
- **DB Changes:** Reuses `oauth_accounts` table

---

### 6. SSO with SAML 2.0
- [ ] **Status:** Planned
- **Difficulty:** Advanced
- **Description:** Enterprise SSO with XML-based assertions. SP-initiated flow with IdP redirect, assertion verification, and metadata exchange.
- **Endpoints:** `GET /auth/saml/login`, `POST /auth/saml/acs`, `GET /auth/saml/metadata`
- **Packages:** `@node-saml/node-saml`
- **DB Changes:** Reuses `oauth_accounts` with provider='saml'

---

### 7. OpenID Connect (OIDC)
- [ ] **Status:** Planned
- **Difficulty:** Intermediate–Advanced
- **Description:** Identity layer on top of OAuth 2.0. Uses discovery documents, id_token verification, userinfo endpoint, and claims validation.
- **Endpoints:** `GET /auth/oidc/login`, `/auth/oidc/callback`
- **Packages:** `openid-client`
- **DB Changes:** Reuses `oauth_accounts` with provider='oidc'

---

### 8. Passkeys / WebAuthn (FIDO2)
- [ ] **Status:** Planned
- **Difficulty:** Advanced
- **Description:** Password-free authentication using public-key cryptography. Registration and authentication ceremonies with resident keys and cloud sync support.
- **Endpoints:** `POST /auth/webauthn/register/options`, `/register/verify`, `/login/options`, `/login/verify`
- **Packages:** `@simplewebauthn/server`
- **DB Changes:** New `webauthn_credentials` table

---

### 9. Magic Link (Email-based Passwordless)
- [ ] **Status:** Planned
- **Difficulty:** Intermediate
- **Description:** Passwordless auth via one-time email links. Covers token generation, single-use enforcement, and email delivery.
- **Endpoints:** `POST /auth/magic-link/send`, `GET /auth/magic-link/verify`
- **Packages:** `nodemailer` (or `resend`)
- **DB Changes:** New `magic_link_tokens` table

---

### 10. TOTP/MFA (Google Authenticator)
- [ ] **Status:** Planned
- **Difficulty:** Intermediate
- **Description:** Time-based one-time passwords as a second factor. QR code provisioning, TOTP verification, and backup recovery codes.
- **Endpoints:** `POST /auth/mfa/totp/setup`, `/verify`, `/validate`, `/disable`
- **Packages:** `otpauth`
- **DB Changes:** Add `mfaSecret`, `mfaEnabled` to users; new `recovery_codes` table

---

### 11. API Key Auth
- [ ] **Status:** Planned
- **Difficulty:** Beginner
- **Description:** Simple key-based authentication for machine-to-machine communication. Covers key generation, hashing, prefix display, scoped permissions, and rotation.
- **Endpoints:** `POST /auth/api-key/generate`, `DELETE /:keyId`, `GET /list`
- **Packages:** None
- **DB Changes:** New `api_keys` table

---

### 12. Mutual TLS (mTLS)
- [ ] **Status:** Planned
- **Difficulty:** Advanced
- **Description:** Two-way TLS authentication using X.509 client certificates. Covers certificate generation, verification, and integration with Node.js TLS.
- **Endpoints:** `GET /auth/mtls/verify`, `POST /auth/mtls/register`
- **Packages:** None (Node.js native TLS)
- **DB Changes:** New `client_certificates` table

---

### 13. RBAC & ABAC (Authorization Layers)
- [ ] **Status:** Planned
- **Difficulty:** Intermediate
- **Description:** Role-based and attribute-based access control as middleware. Covers role assignment, permission checking, and policy evaluation.
- **Endpoints:** `GET /authz/roles`, `POST /authz/roles`, `PUT /authz/users/:id/roles`, `GET /authz/check`
- **Packages:** None (built from scratch)
- **DB Changes:** New `roles` and `user_roles` tables

---

## Recommended Implementation Order

1. ~~Username/Password + JWT~~ (done)
2. API Key Auth (simplest next step)
3. Session-based Auth (introduces stateful auth)
4. TOTP/MFA (builds on password auth)
5. Magic Link (introduces email flow)
6. OAuth 2.0 Google (introduces external providers)
7. OAuth 2.0 GitHub (reuses OAuth pattern)
8. OpenID Connect (extends OAuth with identity)
9. RBAC & ABAC (authorization layer)
10. Passkeys / WebAuthn (modern passwordless)
11. SAML 2.0 (enterprise SSO)
12. Mutual TLS (infrastructure-level auth)
