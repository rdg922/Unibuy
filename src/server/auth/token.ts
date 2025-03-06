import { randomBytes } from "crypto";
import { eq, and, gt } from "drizzle-orm";
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
  email: string,
  expiresInHours = 24,
): Promise<string> {
  // Generate a random token
  const token = generateToken();
  const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  // Check if a token already exists for this identifier
  const existingToken = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.identifier, email),
  });

  if (existingToken) {
    // Update existing token
    await db
      .update(verificationTokens)
      .set({ token, expires })
      .where(eq(verificationTokens.identifier, email));
  } else {
    // Create new token
    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    });
  }

  return token;
}

/**
 * Verify a token and return the identifier if valid
 */
export async function verifyToken(
  email: string,
  token: string,
): Promise<boolean> {
  const verificationToken = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.identifier, email),
      eq(verificationTokens.token, token),
      gt(verificationTokens.expires, new Date()),
    ),
  });

  if (!verificationToken) return false;

  // Delete the used token
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.token, token),
      ),
    );

  return true;
}

/**
 * Create a password reset token for a user
 */
export async function createPasswordResetToken(
  email: string,
  expiresInHours = 1,
): Promise<string> {
  // Generate a random token
  const token = generateToken();
  const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  // Use "pwd-reset:" prefix to differentiate from email verification tokens
  const identifier = `pwd-reset:${email}`;

  // Check if a token already exists for this identifier
  const existingToken = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.identifier, identifier),
  });

  if (existingToken) {
    // Update existing token
    await db
      .update(verificationTokens)
      .set({ token, expires })
      .where(eq(verificationTokens.identifier, identifier));
  } else {
    // Create new token
    await db.insert(verificationTokens).values({
      identifier,
      token,
      expires,
    });
  }

  return token;
}

/**
 * Verify a password reset token and return the identifier if valid
 */
export async function verifyPasswordResetToken(
  email: string,
  token: string,
): Promise<boolean> {
  const identifier = `pwd-reset:${email}`;

  const resetToken = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.identifier, identifier),
      eq(verificationTokens.token, token),
      gt(verificationTokens.expires, new Date()),
    ),
  });

  if (!resetToken) return false;

  // Delete the used token
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, identifier),
        eq(verificationTokens.token, token),
      ),
    );

  return true;
}
