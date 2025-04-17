import { env } from "~/env";

export type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

// Interface for email providers
export interface EmailProvider {
  send(options: EmailOptions): Promise<void>;
}

// Development provider that logs emails to console
export class ConsoleEmailProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<void> {
    console.log("==== EMAIL SENT ====");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("Text:", options.text);
    console.log("HTML:", options.html);
    console.log("====================");
    return Promise.resolve();
  }
}

// SendGrid provider (to be implemented later)
export class SendGridEmailProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(options: EmailOptions): Promise<void> {
    // This will be implemented when we integrate with SendGrid
    // For now, fall back to console logging
    console.log(
      "[SendGrid] Would send email with API key:",
      this.apiKey.substring(0, 3) + "...",
    );
    return new ConsoleEmailProvider().send(options);
  }
}

// Main email service that uses a provider
export class EmailService {
  private provider: EmailProvider;

  constructor(provider: EmailProvider) {
    this.provider = provider;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    return this.provider.send(options);
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    baseUrl: string,
  ): Promise<void> {
    // Updated URL to match our verify-email route
    const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    if (env.NODE_ENV === "development") {
      console.log("====== EMAIL VERIFICATION LINK =======");
      console.log(`To: ${email}`);
      console.log(`Subject: Verify your email for UniBuy`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log("======================================");
      return;
    }

    // In production, this would send an actual email
    // For now, we'll just log it even in production
    console.log(
      `Verification email would be sent to ${email} with URL ${verificationUrl}`,
    );
  }

  /**
   * Sends (or logs) a password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    token: string,
    baseUrl: string,
  ): Promise<void> {
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    if (env.NODE_ENV === "development") {
      console.log("====== PASSWORD RESET LINK =======");
      console.log(`To: ${email}`);
      console.log(`Subject: Reset your password for UniBuy`);
      console.log(`Password Reset URL: ${resetUrl}`);
      console.log("=================================");
      return;
    }

    // In production, this would send an actual email
    // For now, we'll just log it even in production
    console.log(
      `Password reset email would be sent to ${email} with URL ${resetUrl}`,
    );
  }

  async sendSoldNotificationEmail(
    email: string,
    baseUrl: string,
    buyer: string,
    //item: string
  ): Promise<void> {

    
    if (env.NODE_ENV === "development") {
      console.log("====== ITEM SOLD NOTIFICATION ======");
      console.log(`To: ${email}`);
      console.log(`Subject: UniBuy: Someone wants your item!`);
      console.log(`${buyer} is interested in one of your items!. This URL contains a link to your profile.`)
      
    }

    console.log(
        `Sent notification email would be sent to ${email} mentioning an item.`
    );
  }
}

// Create a default instance using the console provider for development
export const emailService = new EmailService(new ConsoleEmailProvider());
