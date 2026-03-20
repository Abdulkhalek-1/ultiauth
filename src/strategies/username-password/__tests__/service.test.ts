import { describe, it, expect, vi, beforeEach } from "vitest";
import * as argon2 from "argon2";
import { hashToken } from "../../../utils/tokens.js";

// Mock dependencies
vi.mock("../../../db/index.js", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

vi.mock("../../../config/env.js", () => ({
  env: {
    JWT_SECRET: "a-very-long-secret-that-is-at-least-32-chars-for-testing",
    JWT_ACCESS_EXPIRY: "15m",
    JWT_REFRESH_EXPIRY: "7d",
  },
}));

vi.mock("../../../redis/index.js", () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
  },
}));

describe("Username/Password Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("password hashing", () => {
    it("should hash a password with argon2id", async () => {
      const password = "SecurePass123";
      const hash = await argon2.hash(password, { type: argon2.argon2id });

      expect(hash).toBeDefined();
      expect(hash).toContain("$argon2id$");
    });

    it("should verify correct password", async () => {
      const password = "SecurePass123";
      const hash = await argon2.hash(password, { type: argon2.argon2id });

      const isValid = await argon2.verify(hash, password);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const hash = await argon2.hash("SecurePass123", {
        type: argon2.argon2id,
      });

      const isValid = await argon2.verify(hash, "WrongPassword");
      expect(isValid).toBe(false);
    });
  });

  describe("token hashing", () => {
    it("should produce consistent SHA-256 hashes", () => {
      const token = "abc123";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it("should produce different hashes for different tokens", () => {
      const hash1 = hashToken("token1");
      const hash2 = hashToken("token2");

      expect(hash1).not.toBe(hash2);
    });
  });
});

describe("JWT tokens", () => {
  it("should sign and verify an access token", async () => {
    // Dynamic import to ensure mocked env is used
    const { signAccessToken, verifyAccessToken } = await import(
      "../../../utils/tokens.js"
    );

    const token = await signAccessToken({
      sub: "user-123",
      username: "testuser",
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe("user-123");
    expect(payload.username).toBe("testuser");
    expect(payload.jti).toBeDefined();
  });
});
