'use server';

import { nanoid } from 'nanoid';
import argon2 from 'argon2';
import { signIn } from '@/auth/auth';
import db from '@/lib/db';
import { otp, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  createOTP,
  sendVerificationEmail,
  verifyOTP,
  markEmailVerified,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import {
  LoginFormData,
  RegisterFormData,
  OtpVerificationData,
  ForgotPasswordFormData,
} from '@/lib/types/auth';
import { send } from 'process';

// Handle user login
export async function loginUser(data: LoginFormData) {
  try {
    const { email, password } = data;

    // Find user by email
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!existingUser) {
      return {
        status: false,
        message: 'User not found',
      };
    }

    // Verify password
    const isPasswordValid = await argon2.verify(
      existingUser.password,
      password,
    );

    if (!isPasswordValid) {
      console.log('Password verification failed');
      return {
        status: false,
        message: 'Invalid password',
      };
    }

    // Check if email is verified
    if (!existingUser.emailVerified) {
      const otpCode = await createOTP(existingUser.id, email, 'verification');
      await sendVerificationEmail(email, existingUser.name, otpCode);

      return {
        status: false,
        message:
          'Email not verified. A new verification code has been sent to your email.',
        requireVerification: true,
        email,
      };
    }

    // Sign in user WITHOUT redirecting on server
    const result = await signIn('credentials', {
      email: existingUser.email,
      name: existingUser.name,
      id: existingUser.id,
      redirect: false,
    });

    if (result?.error) {
      console.error('Sign in error:', result.error);
      return {
        status: false,
        message: 'Login failed: ' + result.error,
      };
    }

    return {
      status: true,
      message: 'Login successful',
      redirectUrl: result?.url || '/',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      status: false,
      message: 'An error occurred while logging in',
    };
  }
}

// Register a new user
export async function registerUser(data: RegisterFormData) {
  try {
    const { name, email, password } = data;

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (existingUser) {
      return {
        status: false,
        message: 'Email already registered',
      };
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    // Create new user with email unverified
    const userId = nanoid();
    await db.insert(user).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
    });

    // Generate and send OTP
    const otpCode = await createOTP(userId, email, 'verification');

    const emailSent = await sendVerificationEmail(email, name, otpCode);

    if (!emailSent) {
      return {
        status: false,
        message: 'Failed to send verification email',
      };
    }

    return {
      status: true,
      message: 'Registration successful. Please verify your email.',
      email,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      status: false,
      message: 'An error occurred during registration',
    };
  }
}

// Verify OTP code
export async function verifyUserOTP(data: OtpVerificationData) {
  try {
    const { email, otp: otpCode } = data;

    // Verify OTP
    const isValid = await verifyOTP(email, otpCode, 'verification');

    if (!isValid) {
      return {
        status: false,
        message: 'Invalid or expired verification code',
      };
    }

    // Find user by email
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!existingUser) {
      return {
        status: false,
        message: 'User not found',
      };
    }

    // Mark email as verified
    await markEmailVerified(existingUser.id);

    return {
      status: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return {
      status: false,
      message: 'An error occurred during verification',
    };
  }
}

// Handle forgot password
export async function forgotPassword(data: ForgotPasswordFormData) {
  try {
    const { email } = data;

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!existingUser) {
      // Return success even if user doesn't exist (security best practice)
      return {
        status: true,
        message:
          'If an account with this email exists, a password reset link has been sent',
      };
    }

    // Generate and send OTP for password reset
    const otpCode = await createOTP(existingUser.id, email, 'password-reset');
    await sendPasswordResetEmail(email, existingUser.name, otpCode);

    return {
      status: true,
      message:
        'If an account with this email exists, a password reset link has been sent',
      email,
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      status: false,
      message: 'An error occurred',
    };
  }
}

// Reset password with OTP
export async function resetPassword(
  email: string,
  otpCode: string,
  newPassword: string,
) {
  try {
    // Verify OTP
    const isValid = await verifyOTP(email, otpCode, 'password-reset');

    if (!isValid) {
      return {
        status: false,
        message: 'Invalid or expired verification code',
      };
    }

    // Find user by email
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!existingUser) {
      return {
        status: false,
        message: 'User not found',
      };
    }

    // Hash and update password
    const hashedPassword = await argon2.hash(newPassword);
    await db
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.id, existingUser.id));

    return {
      status: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      status: false,
      message: 'An error occurred while resetting password',
    };
  }
}

// Resend OTP for email verification
export async function resendOTP(email: string) {
  try {
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!existingUser) {
      return {
        status: false,
        message: 'User not found',
      };
    }

    // If email is already verified, no need to resend OTP
    if (existingUser.emailVerified) {
      return {
        status: false,
        message: 'Email already verified. No OTP needed.',
      };
    }

    // Generate new OTP for verification
    const otpCode = await createOTP(existingUser.id, email, 'verification');
    await sendVerificationEmail(email, existingUser.name, otpCode);

    return {
      status: true,
      message: 'A new verification code has been sent to your email.',
    };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return {
      status: false,
      message: 'An error occurred while resending the OTP',
    };
  }
}
