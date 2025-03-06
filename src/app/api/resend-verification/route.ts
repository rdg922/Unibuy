import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { createVerificationToken } from "~/server/auth/token";
import { emailService } from "~/server/email/service";

const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = resendVerificationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const { email } = result.data;

    // Check if user exists and needs verification
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // If user doesn't exist, return success but log for security
    if (!user) {
      console.log(`Verification requested for non-existent user: ${email}`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // If user is already verified, return success with a specific message
    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Email is already verified. You can sign in.",
        },
        { status: 200 },
      );
    }

    // Generate a new verification token
    const verificationToken = await createVerificationToken(email);

    // Get the base URL (without the path)
    const baseUrl = new URL(req.url);
    baseUrl.pathname = "";

    // Send verification email
    await emailService.sendVerificationEmail(
      email,
      verificationToken,
      baseUrl.toString(),
    );

    console.log(`Verification email sent to ${email}`);

    return NextResponse.json(
      {
        success: true,
        message: "Verification email sent successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 },
    );
  }
}
