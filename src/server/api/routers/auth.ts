import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { hashPassword, verifyPassword } from "~/server/auth/password";
import {
  createVerificationToken,
  verifyToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "~/server/auth/token";
import { emailService } from "~/server/email/service";
import { signIn } from "~/server/auth";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { name, email, password } = input;

        // Check if user already exists
        const existingUser = await ctx.db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User already exists",
          });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create the user without email verification
        await ctx.db.insert(users).values({
          name,
          email,
          password: hashedPassword,
          emailVerified: null, // explicitly set to null
        });

        // Generate a verification token
        const verificationToken = await createVerificationToken(email);

        // Send verification email
        const baseUrl = ctx.headers?.origin || "http://localhost:3000";
        await emailService.sendVerificationEmail(
          email,
          verificationToken,
          baseUrl,
        );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register user",
        });
      }
    }),

  verifyEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { email, token } = input;

        // Verify the token
        const isValid = await verifyToken(email, token);

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification token",
          });
        }

        // Update user's email verification status
        const now = new Date();
        await ctx.db
          .update(users)
          .set({ emailVerified: now })
          .where(eq(users.email, email));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Email verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify email",
        });
      }
    }),

  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { email } = input;

        // Check if user exists
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.email, email),
        });

        // Don't reveal if a user exists or not
        // Just return success even if the user doesn't exist
        if (!user) {
          return { success: true };
        }

        // Generate a password reset token
        const resetToken = await createPasswordResetToken(email);

        // Send password reset email
        const baseUrl = ctx.headers?.origin || "http://localhost:3000";
        await emailService.sendPasswordResetEmail(email, resetToken, baseUrl);

        return { success: true };
      } catch (error) {
        console.error("Password reset request error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process password reset request",
        });
      }
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        token: z.string(),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { email, token, password } = input;

        // Verify the token
        const isValid = await verifyPasswordResetToken(email, token);
        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired reset token",
          });
        }

        // Find the user
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Hash the new password
        const hashedPassword = await hashPassword(password);

        // Update the user's password
        await ctx.db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.email, email));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Password reset error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset password",
        });
      }
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { email, password } = input;

        // First check if user exists
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Check if email is verified
        if (!user.emailVerified) {
          // Generate a new verification token
          const verificationToken = await createVerificationToken(email);

          // Send a new verification email
          const baseUrl = ctx.headers?.origin || "http://localhost:3000";
          await emailService.sendVerificationEmail(
            email,
            verificationToken,
            baseUrl,
          );

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "EMAIL_NOT_VERIFIED",
          });
        }

        // Verify password manually
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Return success response with user info (excluding sensitive data)
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Login error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to login",
        });
      }
    }),

  resendVerification: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { email } = input;

        // Check if user exists
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.email, email),
        });

        // Don't reveal if user exists or not
        if (!user || user.emailVerified) {
          return { success: true };
        }

        // Generate a new verification token
        const verificationToken = await createVerificationToken(email);

        // Send verification email
        const baseUrl = ctx.headers?.origin || "http://localhost:3000";
        await emailService.sendVerificationEmail(
          email,
          verificationToken,
          baseUrl,
        );

        return { success: true };
      } catch (error) {
        console.error("Resend verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resend verification email",
        });
      }
    }),
});
