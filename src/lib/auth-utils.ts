// lib/auth-utils.ts
import argon2 from 'argon2';
import { Resend } from 'resend';
import db from '@/lib/db';
import { otp, user } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/components/Emails/Welcome';
import { OtpEmail } from '@/components/Emails/OTP';
import { getEmailResendApiKey } from './config';

// Initialize Resend with your API key
const resend = new Resend(getEmailResendApiKey());

// Generate a random 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create a new OTP in the database
export async function createOTP(
  userId: string,
  email: string,
  purpose: string,
): Promise<string> {
  const code = generateOTP();
  const expiresIn = 15 * 60 * 1000; // 15 minutes in milliseconds
  const expiresAt = new Date(Date.now() + expiresIn).toISOString();

  // Find existing unused OTPs for this user and purpose
  const existingOTPs = await db
    .select()
    .from(otp)
    .where(
      and(
        eq(otp.userId, userId),
        eq(otp.email, email),
        eq(otp.purpose, purpose),
        eq(otp.used, false),
      ),
    );

  if (existingOTPs.length > 0) {
    // Update existing OTP with new code and expiration
    await db
      .update(otp)
      .set({
        code,
        expires: expiresAt,
      })
      .where(eq(otp.id, existingOTPs[0].id));
  } else {
    // Create new OTP record
    await db.insert(otp).values({
      id: nanoid(),
      userId,
      email,
      code,
      purpose,
      expires: expiresAt,
      used: false,
    });
  }

  return code;
}

// Verify OTP
export async function verifyOTP(
  email: string,
  code: string,
  purpose: string,
): Promise<boolean> {
  const now = new Date().toISOString();

  const [foundOTP] = await db
    .select()
    .from(otp)
    .where(
      and(
        eq(otp.email, email),
        eq(otp.code, code),
        eq(otp.purpose, purpose),
        eq(otp.used, false),
      ),
    );

  if (!foundOTP || new Date(foundOTP.expires) < new Date()) {
    return false;
  }

  // Mark OTP as used
  await db.update(otp).set({ used: true }).where(eq(otp.id, foundOTP.id));

  return true;
}

// Mark a user's email as verified
export async function markEmailVerified(userId: string): Promise<void> {
  await db.update(user).set({ emailVerified: true }).where(eq(user.id, userId));
}

// Send welcome email after registration
export async function sendWelcomeEmail(
  email: string,
  name: string,
): Promise<boolean> {
  try {
    console.log('Sending welcome email to:', email);
    await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: email,
      subject: 'Welcome to Perplexica!',
      html: await render(WelcomeEmail({ name })),
    });
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  name: string,
  otpCode: string,
): Promise<boolean> {
  try {
    console.log('Sending verification email to:', email);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verify your email address - Perplexica',
      html: await render(
        OtpEmail({
          name,
          otpCode,
          type: 'verification',
        }),
      ),
    });
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  otpCode: string,
): Promise<boolean> {
  try {
    console.log('Sending password reset email to:', email);
    const htmlContent = await render(
      OtpEmail({
        name,
        otpCode,
        type: 'password_reset',
      }),
    );
    await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: email,
      subject: 'Reset your password - Perplexica',
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}
