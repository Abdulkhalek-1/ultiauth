// TODO(api-key): Implement API Key authentication
// LEARN: API keys are the simplest form of machine-to-machine auth. They identify
//   the caller but offer no user context. Understand the trade-offs vs. OAuth client
//   credentials, key rotation strategies, and how to scope keys with permissions.
// REF: https://swagger.io/docs/specification/v3_0/authentication/api-keys/

// Endpoints to implement:
//   POST   /auth/api-key/generate   — Create a new API key (authenticated)
//   DELETE /auth/api-key/:keyId      — Revoke an API key
//   GET    /auth/api-key/list        — List active keys for current user
//
// Database changes needed:
//   - api_keys table: id, userId, keyHash (SHA-256), prefix (first 8 chars for display),
//     name, permissions (jsonb), lastUsedAt, expiresAt, createdAt
//
// Required packages: (none beyond current deps)

export {};
