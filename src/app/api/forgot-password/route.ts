import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { createPasswordResetToken } from "~/server/auth/token";
import { emailService } from "~/server/email/service";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email } = result.data;

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Don't reveal if a user exists or not
    // Just return success even if the user doesn't exist
    if (!user) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Generate a password reset token
    const resetToken = await createPasswordResetToken(email);

    // Send password reset email
    const baseUrl = new URL(req.url).origin;
    await emailService.sendPasswordResetEmail(email, resetToken, baseUrl);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 },
    );
  }
}
