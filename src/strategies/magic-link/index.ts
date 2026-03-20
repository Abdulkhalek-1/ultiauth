// TODO(magic-link): Implement Magic Link (email-based passwordless auth)
// LEARN: Magic links send a unique, time-limited URL to the user's email. Clicking
//   the link authenticates them without a password. Understand: token generation
//   with sufficient entropy, single-use enforcement, expiry windows, email
//   deliverability considerations, and the security model (email account = identity).
// REF: https://postmarkapp.com/blog/magic-links (practical guide)

// Endpoints to implement:
//   POST /auth/magic-link/send    — Generate token, send email with link
//   GET  /auth/magic-link/verify  — Verify token from email link, issue JWT
//
// Required packages: nodemailer (or resend/postmark for production)
//
// Database changes needed:
//   - magic_link_tokens table: id, email, tokenHash, expiresAt, usedAt, createdAt

export {};
