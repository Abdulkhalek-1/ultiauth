// TODO(oauth2-google): Implement Google OAuth 2.0 (Authorization Code flow)
// LEARN: OAuth 2.0 Authorization Code flow is the standard for server-side apps.
//   The user is redirected to Google, consents, and your server exchanges the auth
//   code for tokens. Understand: authorization vs. authentication, PKCE, scopes,
//   id_token vs. access_token, and why you should NEVER use the Implicit flow.
// REF: https://datatracker.ietf.org/doc/html/rfc6749 (OAuth 2.0)
// REF: https://developers.google.com/identity/protocols/oauth2/web-server

// Endpoints to implement:
//   GET  /auth/oauth/google          — Redirect to Google consent screen
//   GET  /auth/oauth/google/callback — Handle OAuth callback, exchange code for tokens
//
// Required packages: (none — use fetch + jose for token verification)
//
// Database changes needed:
//   - oauth_accounts table: id, userId, provider, providerUserId, email, createdAt

export {};
