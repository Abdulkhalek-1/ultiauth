// TODO(oidc): Implement OpenID Connect (OIDC)
// LEARN: OIDC is an identity layer on top of OAuth 2.0. While OAuth handles
//   authorization ("can this app access my data?"), OIDC handles authentication
//   ("who is this user?"). Understand: the id_token, discovery document
//   (.well-known/openid-configuration), userinfo endpoint, claims, nonce
//   validation, and how OIDC relates to OAuth 2.0.
// REF: https://openid.net/specs/openid-connect-core-1_0.html

// Endpoints to implement:
//   GET  /auth/oidc/login              — Start OIDC flow with discovery
//   GET  /auth/oidc/callback           — Handle provider callback
//   GET  /auth/oidc/.well-known/openid-configuration — If acting as provider
//
// Required packages: openid-client
//
// Database changes needed:
//   - Reuse oauth_accounts table with provider='oidc'

export {};
