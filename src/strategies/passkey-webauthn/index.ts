// TODO(passkey-webauthn): Implement Passkeys / WebAuthn (FIDO2)
// LEARN: WebAuthn replaces passwords with public-key cryptography. The user's device
//   (authenticator) holds a private key; your server stores the public key. During
//   authentication, the device signs a challenge — no secrets are transmitted. Passkeys
//   are the consumer-friendly evolution of WebAuthn with cloud sync. Understand:
//   registration ceremony, authentication ceremony, attestation vs. assertion,
//   resident keys, and the RP ID scope model.
// REF: https://www.w3.org/TR/webauthn-3/
// REF: https://fidoalliance.org/fido2/

// Endpoints to implement:
//   POST /auth/webauthn/register/options  — Generate registration options
//   POST /auth/webauthn/register/verify   — Verify registration response
//   POST /auth/webauthn/login/options      — Generate authentication options
//   POST /auth/webauthn/login/verify       — Verify authentication response
//
// Required packages: @simplewebauthn/server
//
// Database changes needed:
//   - webauthn_credentials table: id, userId, credentialId, publicKey, counter,
//     transports, deviceType, backedUp, createdAt

export {};
