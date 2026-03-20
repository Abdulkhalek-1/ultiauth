import crypto from "node:crypto";
import { google } from "googleapis";
import { eq, and } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../db/index.js";
import { users, oauthAccounts } from "../../db/schema/index.js";
import { ApiError } from "../../utils/api-error.js";

const SCOPES = ["openid", "profile", "email"];

function createOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_OAUTH_CLIENT_ID,
    env.GOOGLE_OAUTH_CLIENT_SECRET,
    env.GOOGLE_OAUTH_REDIRECT_URL,
  );
}

export function generateAuthUrl(): { url: string; state: string } {
  const state = crypto.randomBytes(32).toString("hex");
  const oauth2Client = createOAuth2Client();

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    include_granted_scopes: true,
    state,
  });

  return { url, state };
}

interface GoogleUser {
  userId: string;
  email: string;
  username: string;
}

export async function handleCallback(
  code: string,
  state: string,
  sessionState: string | undefined,
): Promise<GoogleUser> {
  // CSRF check
  if (!sessionState || state !== sessionState) {
    throw ApiError.badRequest("Invalid OAuth state — possible CSRF attack");
  }

  // Exchange code for tokens
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Fetch user info from Google
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data: profile } = await oauth2.userinfo.get();

  if (!profile.id || !profile.email) {
    throw ApiError.internal("Google did not return user info");
  }

  // Check if this Google account is already linked
  const [existingOAuth] = await db
    .select({
      userId: oauthAccounts.userId,
      email: oauthAccounts.email,
    })
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, "google"),
        eq(oauthAccounts.providerUserId, profile.id),
      ),
    )
    .limit(1);

  if (existingOAuth) {
    // Returning user — look up their info
    const [user] = await db
      .select({ id: users.id, username: users.username, email: users.email })
      .from(users)
      .where(eq(users.id, existingOAuth.userId))
      .limit(1);

    if (!user) {
      throw ApiError.internal("OAuth account linked to missing user");
    }

    return { userId: user.id, email: user.email, username: user.username };
  }

  // New OAuth user — check if a user with this email already exists
  const [existingUser] = await db
    .select({ id: users.id, username: users.username, email: users.email })
    .from(users)
    .where(eq(users.email, profile.email))
    .limit(1);

  if (existingUser) {
    // Link Google account to existing user
    await db.insert(oauthAccounts).values({
      userId: existingUser.id,
      provider: "google",
      providerUserId: profile.id,
      email: profile.email,
    });

    return {
      userId: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
    };
  }

  // Brand new user — create user + oauth account
  const emailPrefix = profile.email.split("@")[0] ?? "user";
  const username = emailPrefix + "_" + crypto.randomBytes(3).toString("hex");

  const [newUser] = await db
    .insert(users)
    .values({
      username,
      email: profile.email,
    })
    .returning({ id: users.id, username: users.username, email: users.email });

  if (!newUser) {
    throw ApiError.internal("Failed to create user");
  }

  await db.insert(oauthAccounts).values({
    userId: newUser.id,
    provider: "google",
    providerUserId: profile.id,
    email: profile.email,
  });

  return { userId: newUser.id, email: newUser.email, username: newUser.username };
}
