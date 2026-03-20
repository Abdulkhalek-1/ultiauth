import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import type { Express } from "express";

/**
 * Integration tests for the full authentication flow.
 *
 * NOTE: These tests require a running Postgres and Redis instance.
 * Run `pnpm docker:up` before executing these tests.
 *
 * To run only integration tests:
 *   pnpm vitest run tests/integration/
 */

// Skip integration tests unless INTEGRATION_TESTS=true
// These require running Postgres + Redis: pnpm docker:up
const describeWithDb =
  process.env["INTEGRATION_TESTS"] === "true" ? describe : describe.skip;

describeWithDb("Auth Flow Integration", () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  it("GET /health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("code", "NOT_FOUND");
  });

  it("full auth flow: register → login → me → refresh → logout", async () => {
    const uniqueSuffix = Date.now();

    // 1. Register
    const registerRes = await request(app)
      .post("/auth/password/register")
      .send({
        username: `testuser_${uniqueSuffix}`,
        email: `test_${uniqueSuffix}@example.com`,
        password: "SecurePass123",
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data).toHaveProperty("user");
    expect(registerRes.body.data).toHaveProperty("tokens");

    const { accessToken, refreshToken } = registerRes.body.data.tokens;

    // 2. Get current user
    const meRes = await request(app)
      .get("/auth/password/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.username).toBe(`testuser_${uniqueSuffix}`);

    // 3. Refresh tokens
    const refreshRes = await request(app)
      .post("/auth/password/refresh")
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data).toHaveProperty("accessToken");
    expect(refreshRes.body.data).toHaveProperty("refreshToken");

    const newRefreshToken = refreshRes.body.data.refreshToken;

    // 4. Old refresh token should be detected as reuse
    const reuseRes = await request(app)
      .post("/auth/password/refresh")
      .send({ refreshToken }); // using OLD token

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body).toHaveProperty("code", "TOKEN_REUSE_DETECTED");

    // 5. Logout with new refresh token (may also be revoked by reuse detection)
    const logoutRes = await request(app)
      .post("/auth/password/logout")
      .set("Authorization", `Bearer ${refreshRes.body.data.accessToken}`)
      .send({ refreshToken: newRefreshToken });

    expect(logoutRes.status).toBe(200);
  });

  it("rejects login with wrong password", async () => {
    const uniqueSuffix = Date.now();

    await request(app).post("/auth/password/register").send({
      username: `wrongpw_${uniqueSuffix}`,
      email: `wrongpw_${uniqueSuffix}@example.com`,
      password: "SecurePass123",
    });

    const res = await request(app).post("/auth/password/login").send({
      login: `wrongpw_${uniqueSuffix}`,
      password: "WrongPassword",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("code", "UNAUTHORIZED");
  });

  it("rejects registration with duplicate username", async () => {
    const uniqueSuffix = Date.now();

    await request(app).post("/auth/password/register").send({
      username: `duplicate_${uniqueSuffix}`,
      email: `dup1_${uniqueSuffix}@example.com`,
      password: "SecurePass123",
    });

    const res = await request(app).post("/auth/password/register").send({
      username: `duplicate_${uniqueSuffix}`,
      email: `dup2_${uniqueSuffix}@example.com`,
      password: "SecurePass123",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("code", "CONFLICT");
  });
});
