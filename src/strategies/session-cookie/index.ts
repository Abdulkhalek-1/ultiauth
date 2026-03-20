// TODO(session-cookie): Implement session-based authentication with Redis store
// LEARN: Session auth is the traditional stateful approach — the server stores session
//   data and the client holds a session ID in an httpOnly cookie. Understand how this
//   differs from stateless JWT auth, CSRF protection requirements, and why Redis is
//   used as a session store for horizontal scaling.
// REF: https://datatracker.ietf.org/doc/html/rfc6265 (HTTP Cookies)

// Endpoints to implement:
//   POST /auth/session/login    — Authenticate and create session cookie
//   POST /auth/session/logout   — Destroy session
//   GET  /auth/session/me       — Get current user from session
//
// Required packages: express-session, connect-redis
//
// Database changes needed: none (sessions stored in Redis)

export {};
