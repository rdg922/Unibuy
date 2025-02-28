import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { verificationTokens } from "~/server/db/schema";

/**
 * Generate a random token for email verification
 */
export function generateToken(length = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * Create a verification token for a user
 */
export async function createVerificationToken(
  identifier: string,
  expiresIn: number = 24 * 60 * 60 * 1000, // 24 hours in milliseconds
): Promise<string> {
  const token = generateToken();
  const expires = new Date(Date.now() + expiresIn);

  // Remove any existing tokens for this user
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, identifier));

  // Create a new token
  await db.insert(verificationTokens).values({
    identifier,
    token,
    expires,
  });

  return token;
}

/**
 * Verify a token and return the identifier if valid
 */
export async function verifyToken(token: string): Promise<string | null> {
  const verificationToken = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });

  if (!verificationToken) {
    return null;
  }

  // Check if token has expired
  if (verificationToken.expires < new Date()) {
    // Remove expired token
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, token));
    return null;
  }

  // Delete the token so it can't be used again
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));

  return verificationToken.identifier;
}
