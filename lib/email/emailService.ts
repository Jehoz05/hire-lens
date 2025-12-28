import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
}: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Specific email functions
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0077b5;">Verify Your Email</h1>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0077b5; color: white; text-decoration: none; border-radius: 4px;">
        Verify Email
      </a>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Recruitment Platform',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0077b5;">Reset Your Password</h1>
      <p>Please click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0077b5; color: white; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Recruitment Platform',
    html,
  });
}

export async function sendApplicationConfirmation(email: string, jobTitle: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0077b5;">Application Submitted</h1>
      <p>Your application for <strong>${jobTitle}</strong> has been successfully submitted.</p>
      <p>We'll review your application and contact you if there's a match.</p>
      <p>You can track your application status from your dashboard.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Application Submitted: ${jobTitle}`,
    html,
  });
}

export async function sendShortlistedEmail(email: string, jobTitle: string, company: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #00a866;">Congratulations! You've been shortlisted</h1>
      <p>Great news! Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been shortlisted.</p>
      <p>The recruiter will contact you soon for the next steps.</p>
      <p>Best of luck!</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Congratulations! Shortlisted for ${jobTitle}`,
    html,
  });
}