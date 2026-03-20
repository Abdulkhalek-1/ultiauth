import * as jose from "jose";
import crypto from "node:crypto";
import { env } from "../config/env.js";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export interface AccessTokenPayload {
  sub: string;
  username: string;
  jti: string;
}

export async function signAccessToken(payload: {
  sub: string;
  username: string;
}): Promise<string> {
  const jti = crypto.randomUUID();

  return new jose.SignJWT({ username: payload.username, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRY)
    .setIssuer("ultiauth")
    .setAudience("ultiauth-api")
    .sign(secret);
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  const { payload } = await jose.jwtVerify(token, secret, {
    issuer: "ultiauth",
    audience: "ultiauth-api",
  });

  if (!payload.sub) {
    throw new Error("Token missing sub claim");
  }

  return {
    sub: payload.sub,
    username: payload["username"] as string,
    jti: payload["jti"] as string,
  };
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
