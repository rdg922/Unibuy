import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
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
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email } = result.data;

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      // Just act as if we sent the email
      return NextResponse.json({ success: true });
    }

    // If email is already verified, don't send another email
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 },
      );
    }

    // Generate a new verification token
    const verificationToken = await createVerificationToken(email);

    // Send verification email
    const baseUrl = new URL(req.url).origin.replace(
      "/api/resend-verification",
      "",
    );
    await emailService.sendVerificationEmail(email, verificationToken, baseUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 },
    );
  }
}
