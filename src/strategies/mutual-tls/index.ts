// TODO(mutual-tls): Implement Mutual TLS (mTLS) client certificate authentication
// LEARN: Standard TLS authenticates only the server. mTLS adds client authentication
//   via X.509 certificates — both sides prove identity. This is common in zero-trust
//   architectures, service mesh (Istio/Linkerd), and high-security APIs. Understand:
//   certificate chains, CA trust stores, certificate verification, CN/SAN extraction,
//   and the difference between mTLS at the application vs. reverse proxy level.
// REF: https://datatracker.ietf.org/doc/html/rfc8446 (TLS 1.3)

// Endpoints to implement:
//   GET  /auth/mtls/verify   — Verify client certificate and return identity
//   POST /auth/mtls/register — Register a client certificate fingerprint
//
// Required packages: (none — uses Node.js native TLS)
//
// Notes: Requires a separate HTTPS server or reverse proxy configuration.
//   Consider generating test CA + client certs with a setup script.
//
// Database changes needed:
//   - client_certificates table: id, userId, fingerprint, subject, issuer, expiresAt

export {};
