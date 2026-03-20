// TODO(oauth2-github): Implement GitHub OAuth 2.0 (Authorization Code flow)
// LEARN: GitHub OAuth follows the same Authorization Code flow as Google but with
//   differences in scope naming, token format, and user info endpoints. Implementing
//   two OAuth providers teaches you how to abstract the flow into a reusable pattern.
// REF: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps

// Endpoints to implement:
//   GET  /auth/oauth/github          — Redirect to GitHub authorization
//   GET  /auth/oauth/github/callback — Handle callback, exchange code for tokens
//
// Required packages: (none — use fetch for HTTP calls)
//
// Database changes needed:
//   - Reuse oauth_accounts table from Google OAuth strategy

export {};
