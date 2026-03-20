// TODO(saml): Implement SAML 2.0 Single Sign-On
// LEARN: SAML is an XML-based protocol for enterprise SSO. Your app (Service Provider)
//   redirects to an Identity Provider (IdP) which authenticates the user and returns
//   a signed XML assertion. Understand: SP-initiated vs IdP-initiated flows, XML
//   signature verification, assertion encryption, metadata exchange, and why SAML
//   is still dominant in enterprise despite being older than OAuth/OIDC.
// REF: https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf

// Endpoints to implement:
//   GET  /auth/saml/login     — Redirect to IdP with SAML AuthnRequest
//   POST /auth/saml/acs       — Assertion Consumer Service (handle IdP response)
//   GET  /auth/saml/metadata  — SP metadata XML for IdP configuration
//
// Required packages: @node-saml/node-saml
//
// Database changes needed:
//   - saml_sessions table or reuse oauth_accounts with provider='saml'

export {};
