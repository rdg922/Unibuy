import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { verifyToken } from "~/server/auth/token";

const verifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = verifyEmailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, token } = result.data;

    // Verify the token
    const isValid = await verifyToken(email, token);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 },
      );
    }

    // Update user's email verification status
    const now = new Date();
    await db
      .update(users)
      .set({ emailVerified: now })
      .where(eq(users.email, email));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 },
    );
  }
}
