// TODO(totp-mfa): Implement TOTP/MFA (Google Authenticator compatible)
// LEARN: TOTP (Time-based One-Time Password) generates a 6-digit code that changes
//   every 30 seconds. It's the most common second factor. Understand: the HMAC-based
//   algorithm, shared secret provisioning via QR code (otpauth:// URI), time window
//   tolerance, backup/recovery codes, and why TOTP is a second factor (something you
//   have) not a primary factor.
// REF: https://datatracker.ietf.org/doc/html/rfc6238 (TOTP)
// REF: https://datatracker.ietf.org/doc/html/rfc4226 (HOTP base)

// Endpoints to implement:
//   POST /auth/mfa/totp/setup     — Generate secret + QR code URI (authenticated)
//   POST /auth/mfa/totp/verify    — Verify TOTP code and enable MFA
//   POST /auth/mfa/totp/validate  — Validate TOTP during login (2nd step)
//   POST /auth/mfa/totp/disable   — Disable TOTP MFA (authenticated)
//
// Required packages: otpauth
//
// Database changes needed:
//   - Add mfaSecret and mfaEnabled columns to users table
//   - recovery_codes table: id, userId, codeHash, usedAt

export {};
