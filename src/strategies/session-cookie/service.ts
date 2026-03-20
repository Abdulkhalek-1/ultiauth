import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/index.js";
import { ApiError } from "../../utils/api-error.js";
import type { SessionLoginInput } from "./schemas.js";

export async function login(
  input: SessionLoginInput
): Promise<{ id: string; username: string; email: string }> {
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

  if (!user.passwordHash) {
    throw ApiError.unauthorized("This account uses OAuth login");
  }
  const isValid = await argon2.verify(user.passwordHash, input.password);
  if (!isValid) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  return { id: user.id, username: user.username, email: user.email };
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
