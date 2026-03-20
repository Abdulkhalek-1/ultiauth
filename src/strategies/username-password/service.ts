import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users, refreshTokens } from "../../db/schema/index.js";
import { ApiError } from "../../utils/api-error.js";
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
} from "../../utils/tokens.js";
import { env } from "../../config/env.js";
import type { AuthResponse, TokenPair } from "../../types/index.js";
import type { RegisterInput, LoginInput } from "./schemas.js";

function parseExpiry(expiry: string): Date {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);

  const value = match[1];
  const unit = match[2];
  if (!value || !unit) throw new Error(`Invalid expiry format: ${expiry}`);

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  const ms = multipliers[unit];
  if (!ms) throw new Error(`Invalid expiry unit: ${unit}`);

  return new Date(Date.now() + parseInt(value, 10) * ms);
}

async function createTokenPair(
  userId: string,
  username: string
): Promise<TokenPair> {
  const accessToken = await signAccessToken({ sub: userId, username });
  const refreshToken = generateRefreshToken();
  const familyId = uuidv4();

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hashToken(refreshToken),
    familyId,
    expiresAt: parseExpiry(env.JWT_REFRESH_EXPIRY),
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  // Check uniqueness
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, input.username))
    .limit(1);

  if (existingUser) {
    throw ApiError.conflict("Username already taken");
  }

  const [existingEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existingEmail) {
    throw ApiError.conflict("Email already registered");
  }

  // Hash password with argon2id (default variant)
  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
  });

  // Insert user
  const [newUser] = await db
    .insert(users)
    .values({
      username: input.username,
      email: input.email,
      passwordHash,
    })
    .returning({ id: users.id, username: users.username, email: users.email });

  if (!newUser) {
    throw ApiError.internal("Failed to create user");
  }

  const tokens = await createTokenPair(newUser.id, newUser.username);

  return {
    user: { id: newUser.id, username: newUser.username, email: newUser.email },
    tokens,
  };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  // Find user by username or email
  const [user] = await db
    .select()
    .from(users)
    .where(
      input.login.includes("@")
        ? eq(users.email, input.login)
        : eq(users.username, input.login)
    )
    .limit(1);

  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  if (!user.isActive) {
    throw ApiError.unauthorized("Account is deactivated");
  }

  // Verify password (OAuth-only users have no password)
  if (!user.passwordHash) {
    throw ApiError.unauthorized("This account uses OAuth login");
  }
  const isValid = await argon2.verify(user.passwordHash, input.password);
  if (!isValid) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const tokens = await createTokenPair(user.id, user.username);

  return {
    user: { id: user.id, username: user.username, email: user.email },
    tokens,
  };
}

export async function refresh(refreshTokenValue: string): Promise<TokenPair> {
  const tokenHash = hashToken(refreshTokenValue);

  // Find the token
  const [storedToken] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (!storedToken) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  // Check expiry
  if (storedToken.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token expired");
  }

  // Reuse detection: if token is already revoked, someone stole it
  if (storedToken.isRevoked) {
    // Revoke entire family — nuclear option
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.familyId, storedToken.familyId));

    throw ApiError.tokenReuse();
  }

  // Revoke the current token
  await db
    .update(refreshTokens)
    .set({ isRevoked: true })
    .where(eq(refreshTokens.id, storedToken.id));

  // Look up user
  const [user] = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(eq(users.id, storedToken.userId))
    .limit(1);

  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  // Issue new token pair in same family
  const accessToken = await signAccessToken({
    sub: user.id,
    username: user.username,
  });
  const newRefreshToken = generateRefreshToken();

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    familyId: storedToken.familyId,
    expiresAt: parseExpiry(env.JWT_REFRESH_EXPIRY),
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshTokenValue: string): Promise<void> {
  const tokenHash = hashToken(refreshTokenValue);

  // Find token to get familyId
  const [storedToken] = await db
    .select({ familyId: refreshTokens.familyId })
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (!storedToken) {
    // Token not found — already logged out or invalid, no-op
    return;
  }

  // Revoke entire family
  await db
    .update(refreshTokens)
    .set({ isRevoked: true })
    .where(
      and(
        eq(refreshTokens.familyId, storedToken.familyId),
        eq(refreshTokens.isRevoked, false)
      )
    );
}

export async function getMe(
  userId: string
): Promise<{ id: string; username: string; email: string; createdAt: Date }> {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw ApiError.notFound("User");
  }

  return user;
}
