import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { apiKeys } from "../../db/schema/index.js";
import { ApiError } from "../../utils/api-error.js";
import { hashToken } from "../../utils/tokens.js";
import type { GenerateKeyInput } from "./schemas.js";

const KEY_PREFIX_LENGTH = 8;

function generateRawKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

function formatKey(prefix: string, raw: string): string {
  return `ultiauth_${prefix}_${raw}`;
}

function parseKey(apiKey: string): { prefix: string; raw: string } | null {
  const parts = apiKey.split("_");
  if (parts.length !== 3 || parts[0] !== "ultiauth") return null;
  const prefix = parts[1];
  const raw = parts[2];
  if (!prefix || !raw) return null;
  return { prefix, raw };
}

export async function generate(
  userId: string,
  input: GenerateKeyInput
): Promise<{ key: string; keyId: string; prefix: string }> {
  const raw = generateRawKey();
  const prefix = raw.slice(0, KEY_PREFIX_LENGTH);
  const fullKey = formatKey(prefix, raw);
  const keyHash = hashToken(fullKey);

  const expiresAt = input.expiresInDays
    ? new Date(Date.now() + input.expiresInDays * 86_400_000)
    : null;

  const [inserted] = await db
    .insert(apiKeys)
    .values({
      userId,
      keyHash,
      keyPrefix: prefix,
      name: input.name,
      scopes: input.scopes ?? [],
      expiresAt,
    })
    .returning({ id: apiKeys.id });

  if (!inserted) {
    throw ApiError.internal("Failed to create API key");
  }

  return { key: fullKey, keyId: inserted.id, prefix };
}

export async function list(userId: string) {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      isRevoked: apiKeys.isRevoked,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));
}

export async function revoke(userId: string, keyId: string): Promise<void> {
  const [key] = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .limit(1);

  if (!key) {
    throw ApiError.notFound("API key");
  }

  await db
    .update(apiKeys)
    .set({ isRevoked: true })
    .where(eq(apiKeys.id, keyId));
}

export async function validateKey(
  apiKey: string
): Promise<{ userId: string; scopes: string[] }> {
  const parsed = parseKey(apiKey);
  if (!parsed) {
    throw ApiError.unauthorized("Invalid API key format");
  }

  const keyHash = hashToken(apiKey);

  const [storedKey] = await db
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId,
      scopes: apiKeys.scopes,
      isRevoked: apiKeys.isRevoked,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (!storedKey) {
    throw ApiError.unauthorized("Invalid API key");
  }

  if (storedKey.isRevoked) {
    throw ApiError.unauthorized("API key has been revoked");
  }

  if (storedKey.expiresAt && storedKey.expiresAt < new Date()) {
    throw ApiError.unauthorized("API key has expired");
  }

  // Update last used timestamp (fire-and-forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, storedKey.id))
    .then(() => {});

  return { userId: storedKey.userId, scopes: storedKey.scopes ?? [] };
}
