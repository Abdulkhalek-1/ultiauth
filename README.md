# UltiAuth

A comprehensive authentication learning backend implementing every major auth strategy in TypeScript + Express.js.

## What's Inside

| # | Strategy | Status | Difficulty |
|---|----------|--------|------------|
| 1 | Username/Password + JWT | Implemented | Beginner |
| 2 | JWT Refresh Token Rotation | Planned | Beginner+ |
| 3 | Session-based Auth (Redis) | Implemented | Beginner |
| 4 | OAuth 2.0 (Google) | Planned | Intermediate |
| 5 | OAuth 2.0 (GitHub) | Planned | Intermediate |
| 6 | SAML 2.0 SSO | Planned | Advanced |
| 7 | OpenID Connect | Planned | Intermediate+ |
| 8 | Passkeys / WebAuthn | Planned | Advanced |
| 9 | Magic Link (Passwordless) | Planned | Intermediate |
| 10 | TOTP / MFA | Planned | Intermediate |
| 11 | API Key Auth | Implemented | Beginner |
| 12 | Mutual TLS (mTLS) | Planned | Advanced |
| 13 | RBAC & ABAC | Planned | Intermediate |

## Architecture

```
src/
├── index.ts                    # Server bootstrap
├── app.ts                      # Express app factory
├── config/env.ts               # Zod-validated environment
├── db/                         # Drizzle ORM + Postgres
│   └── schema/                 # Table definitions
├── redis/                      # ioredis client
├── types/                      # Shared TypeScript types
├── utils/                      # Logger, errors, JWT helpers
├── middleware/                  # Auth, validation, rate limiting
├── strategies/                 # One folder per auth method
│   ├── username-password/      # ✅ Implemented
│   ├── api-key/                # ✅ Implemented
│   ├── session-cookie/         # ✅ Implemented
│   ├── oauth2-google/          # 📋 TODO stub
│   ├── oauth2-github/          # 📋 TODO stub
│   ├── saml/                   # 📋 TODO stub
│   ├── oidc/                   # 📋 TODO stub
│   ├── passkey-webauthn/       # 📋 TODO stub
│   ├── magic-link/             # 📋 TODO stub
│   ├── totp-mfa/               # 📋 TODO stub
│   ├── mutual-tls/             # 📋 TODO stub
│   └── rbac-abac/              # 📋 TODO stub
└── routes/                     # Route mounting
```

Each strategy is fully isolated with its own router, service, and schemas.

## Tech Stack

- **Runtime:** Node.js + TypeScript (strict mode)
- **Framework:** Express.js 5
- **Database:** PostgreSQL 17 (via Drizzle ORM)
- **Cache:** Redis 7 (via ioredis)
- **Auth:** jose (JWT), argon2 (password hashing)
- **Validation:** Zod v4
- **Testing:** Vitest + Supertest
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

### Setup

```bash
# Clone the repository
git clone https://github.com/Abdulkhalek-1/ultiauth.git
cd ultiauth

# Install dependencies
pnpm install

# Start Postgres and Redis
pnpm docker:up

# Copy environment variables
cp .env.example .env

# Run database migrations
pnpm db:generate
pnpm db:migrate

# Start the dev server
pnpm dev
```

The server will start at `http://localhost:3000`.

### Verify

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"..."}
```

## API Endpoints (Username/Password)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/password/register` | None | Create account |
| POST | `/auth/password/login` | None | Authenticate |
| POST | `/auth/password/refresh` | None | Rotate tokens |
| POST | `/auth/password/logout` | Bearer | Revoke tokens |
| GET | `/auth/password/me` | Bearer | Get current user |

### Register

```bash
curl -X POST http://localhost:3000/auth/password/register \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "email": "demo@example.com", "password": "SecurePass123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/password/login \
  -H "Content-Type: application/json" \
  -d '{"login": "demo", "password": "SecurePass123"}'
```

## API Endpoints (API Key Auth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/api-key/generate` | Bearer | Generate a new API key |
| GET | `/auth/api-key/list` | Bearer | List all your API keys |
| DELETE | `/auth/api-key/:keyId` | Bearer | Revoke an API key |
| GET | `/auth/api-key/verify` | X-API-Key | Verify an API key works |

### Generate Key

```bash
curl -X POST http://localhost:3000/auth/api-key/generate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-service", "scopes": ["read", "write"]}'
```

### Verify Key

```bash
curl http://localhost:3000/auth/api-key/verify \
  -H "X-API-Key: ultiauth_<prefix>_<key>"
```

## API Endpoints (Session Auth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/session/login` | None | Login (sets session cookie) |
| POST | `/auth/session/logout` | Cookie | Logout (destroys session) |
| GET | `/auth/session/me` | Cookie | Get current user |

### Session Login

```bash
curl -X POST http://localhost:3000/auth/session/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"login": "demo", "password": "SecurePass123"}'
```

### Session Me

```bash
curl http://localhost:3000/auth/session/me -b cookies.txt
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run compiled output |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm docker:up` | Start Postgres + Redis |
| `pnpm docker:down` | Stop Docker services |

## API Testing

A [Bruno](https://www.usebruno.com/) collection is included in `bruno/ultiauth/` for testing all endpoints interactively.

## Roadmap

See [plan.md](plan.md) for the full implementation roadmap with details on each auth strategy.

## License

MIT
