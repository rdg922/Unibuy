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
    to: string,
    verificationToken: string,
    baseUrl: string,
  ): Promise<void> {
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    return this.sendEmail({
      to,
      subject: "Verify your email address",
      text: `Please verify your email address by clicking the following link: ${verificationUrl}`,
      html: `
        <div>
          <h1>Email Verification</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationUrl}">Verify my email</a></p>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${verificationUrl}</p>
        </div>
      `,
    });
  }
}

// Create a default instance using the console provider for development
export const emailService = new EmailService(new ConsoleEmailProvider());
