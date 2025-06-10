'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from '@/lib/validators';
import type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
} from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import PasswordInput from './PasswordInput';
import AuthSocial from './AuthSocial';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

import {
  loginUser,
  registerUser,
  verifyUserOTP,
  forgotPassword,
  resendOTP,
} from '@/app/(auth)/actions';
import { signIn as nextAuthSignIn, useSession } from 'next-auth/react';

type AuthMode = 'login' | 'register' | 'forgotPassword' | 'otp';

// Registration step
type RegisterStep = 1 | 2;

// Enhanced animation variants
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 1,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      mass: 0.8,
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    },
  },
};

// Header variants
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [email, setEmail] = useState('');

  const router = useRouter();
  const { update } = useSession();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Reset form when switching modes
  useEffect(() => {
    setFormError(null);
    if (mode === 'register') {
      setRegisterStep(1);
    }
  }, [mode]);

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    console.log('Login data:', data);

    try {
      const result = await loginUser(data);

      if (!result.status) {
        if (result.requireVerification) {
          setEmail(data.email);
          toast.info(result.message);
          setMode('otp');
        } else {
          setFormError(result.message);
        }
      } else {
        await update();

        toast.success(result.message);
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        }
      }
    } catch (error) {
      console.error(error);
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterNextStep = () => {
    const { name, email } = registerForm.getValues();

    // Validate only the first step fields
    if (!name || name.length < 2) {
      setFormError('Name must be at least 2 characters');
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    setFormError(null);
    setRegisterStep(2);
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = await registerUser(data);

      if (result.status) {
        setEmail(data.email);
        toast.success(result.message);
        setMode('otp');
      } else {
        setFormError(result.message);
      }
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = await forgotPassword(data);

      if (result.status) {
        toast.success(result.message);
        setMode('login');
      } else {
        setFormError(result.message);
      }
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otpValue.length !== 6) {
      setFormError('Please enter all 6 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyUserOTP({ email, otp: otpValue });

      if (result.status) {
        toast.success('Account verified successfully! You can now log in.');
        setMode('login');
        setOtpValue('');
      } else {
        setFormError(result.message);
      }
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    try {
      const result = await resendOTP(email);

      if (result.status) {
        toast.success('A new verification code has been sent to your email.');
      } else {
        setFormError(result.message);
      }
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Google Sign In clicked');
      // Clear all form fields before proceeding with Google sign-in
      loginForm.reset();
      registerForm.reset();
      forgotPasswordForm.reset();
      setFormError(null);
      setOtpValue('');
      setEmail('');
      await nextAuthSignIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const handleSSOSignIn = () => {
    console.log('SSO Sign In clicked');
    // Implement SSO sign-in logic here
  };

  const renderLoginForm = () => (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={loginForm.handleSubmit(handleLogin)}
      className="flex flex-col gap-4"
    >
      <motion.div variants={formItemVariants}>
        <AuthSocial
          onGoogleClick={handleGoogleSignIn}
          onSSOClick={handleSSOSignIn}
        />
      </motion.div>

      <motion.div variants={formItemVariants}>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...loginForm.register('email')}
          className={`bg-black/30 border-gray-800 text-white ${
            loginForm.formState.errors.email
              ? 'border-kindle-error'
              : 'focus:border-kindle-accent'
          }`}
          placeholder="your@email.com"
        />
        {loginForm.formState.errors.email && (
          <p className="text-kindle-error text-xs mt-1">
            {loginForm.formState.errors.email.message}
          </p>
        )}
      </motion.div>

      <motion.div variants={formItemVariants}>
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setMode('forgotPassword')}
            className="text-xs text-kindle-accent hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <PasswordInput
          id="password"
          {...loginForm.register('password')}
          value={loginForm.watch('password')}
          onChange={(e) => loginForm.setValue('password', e.target.value)}
          error={loginForm.formState.errors.password?.message}
        />
        {loginForm.formState.errors.password && (
          <p className="text-kindle-error text-xs mt-1">
            {loginForm.formState.errors.password.message}
          </p>
        )}
      </motion.div>

      {formError && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-kindle-error text-xs"
        >
          {formError}
        </motion.p>
      )}

      <motion.div variants={formItemVariants}>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-kindle-accent hover:bg-opacity-80 text-white font-medium py-2"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
      </motion.div>

      <motion.p
        variants={formItemVariants}
        className="text-center text-sm text-gray-400"
      >
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setMode('register');
          }}
          className="text-kindle-accent hover:underline"
        >
          Sign up
        </button>
      </motion.p>
    </motion.form>
  );

  const renderRegisterStep1 = () => (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-4"
    >
      <motion.div variants={formItemVariants}>
        <AuthSocial
          onGoogleClick={handleGoogleSignIn}
          onSSOClick={handleSSOSignIn}
        />
      </motion.div>

      <motion.div variants={formItemVariants}>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Full Name
        </label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          {...registerForm.register('name')}
          className={`bg-black/30 border-gray-800 text-white ${
            registerForm.formState.errors.name
              ? 'border-kindle-error'
              : 'focus:border-kindle-accent'
          }`}
          placeholder="Your name"
        />
        {registerForm.formState.errors.name && (
          <p className="text-kindle-error text-xs mt-1">
            {registerForm.formState.errors.name.message}
          </p>
        )}
      </motion.div>

      <motion.div variants={formItemVariants}>
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Email
        </label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          {...registerForm.register('email')}
          className={`bg-black/30 border-gray-800 text-white ${
            registerForm.formState.errors.email
              ? 'border-kindle-error'
              : 'focus:border-kindle-accent'
          }`}
          placeholder="your@email.com"
        />
        {registerForm.formState.errors.email && (
          <p className="text-kindle-error text-xs mt-1">
            {registerForm.formState.errors.email.message}
          </p>
        )}
      </motion.div>

      {formError && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-kindle-error text-xs"
        >
          {formError}
        </motion.p>
      )}

      <motion.div variants={formItemVariants}>
        <Button
          type="button"
          onClick={handleRegisterNextStep}
          className="w-full bg-kindle-accent hover:bg-opacity-80 text-white font-medium py-2"
        >
          Continue
        </Button>
      </motion.div>

      <motion.p
        variants={formItemVariants}
        className="text-center text-sm text-gray-400"
      >
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setMode('login');
          }}
          className="text-kindle-accent hover:underline"
        >
          Log in
        </button>
      </motion.p>
    </motion.div>
  );

  const renderRegisterStep2 = () => (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={registerForm.handleSubmit(handleRegister)}
      className="flex flex-col gap-4"
    >
      <motion.div
        variants={formItemVariants}
        className="flex items-center mb-2"
      >
        <button
          type="button"
          onClick={() => setRegisterStep(1)}
          className="text-kindle-accent mr-2 hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
      </motion.div>

      <motion.div variants={formItemVariants}>
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Password
        </label>
        <PasswordInput
          id="register-password"
          {...registerForm.register('password')}
          value={registerForm.watch('password')}
          onChange={(e) => registerForm.setValue('password', e.target.value)}
          error={registerForm.formState.errors.password?.message}
        />
        {registerForm.formState.errors.password && (
          <p className="text-kindle-error text-xs mt-1">
            {registerForm.formState.errors.password.message}
          </p>
        )}
      </motion.div>

      <motion.div variants={formItemVariants}>
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Confirm Password
        </label>
        <PasswordInput
          id="confirm-password"
          {...registerForm.register('confirmPassword')}
          value={registerForm.watch('confirmPassword')}
          onChange={(e) =>
            registerForm.setValue('confirmPassword', e.target.value)
          }
          error={registerForm.formState.errors.confirmPassword?.message}
          placeholder="Confirm password"
        />
        {registerForm.formState.errors.confirmPassword && (
          <p className="text-kindle-error text-xs mt-1">
            {registerForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </motion.div>

      {formError && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-kindle-error text-xs"
        >
          {formError}
        </motion.p>
      )}

      <motion.div variants={formItemVariants}>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-kindle-accent hover:bg-opacity-80 text-white font-medium py-2"
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </Button>
      </motion.div>
    </motion.form>
  );

  const renderForgotPasswordForm = () => (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)}
      className="flex flex-col gap-4"
    >
      <motion.div variants={headerVariants} className="text-center mb-2">
        <h2 className="text-xl font-semibold text-white">
          Reset your password
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Enter your email address and we'll send you a link to reset your
          password
        </p>
      </motion.div>

      <motion.div variants={formItemVariants}>
        <label
          htmlFor="forgot-email"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Email
        </label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          {...forgotPasswordForm.register('email')}
          className={`bg-black/30 border-gray-800 text-white ${
            forgotPasswordForm.formState.errors.email
              ? 'border-kindle-error'
              : 'focus:border-kindle-accent'
          }`}
          placeholder="your@email.com"
        />
        {forgotPasswordForm.formState.errors.email && (
          <p className="text-kindle-error text-xs mt-1">
            {forgotPasswordForm.formState.errors.email.message}
          </p>
        )}
      </motion.div>

      {formError && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-kindle-error text-xs"
        >
          {formError}
        </motion.p>
      )}

      <motion.div variants={formItemVariants}>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-kindle-accent hover:bg-opacity-80 text-white font-medium py-2"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </Button>
      </motion.div>

      <motion.p
        variants={formItemVariants}
        className="text-center text-sm text-gray-400"
      >
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setMode('login');
          }}
          className="text-kindle-accent hover:underline"
        >
          Back to login
        </button>
      </motion.p>
    </motion.form>
  );

  const renderOtpForm = () => (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-6"
    >
      <motion.div variants={headerVariants} className="text-center">
        <h2 className="text-xl font-semibold text-white">Verify your email</h2>
        <p className="text-sm text-gray-400 mt-1">
          We've sent a 6-digit code to{' '}
          <span className="text-kindle-accent">{email}</span>
        </p>
      </motion.div>

      <motion.div
        variants={formItemVariants}
        className="flex flex-col items-center"
      >
        <Label htmlFor="otp" className="text-sm text-gray-300 mb-4">
          Enter verification code
        </Label>

        <InputOTP
          maxLength={6}
          autoComplete="one-time-code"
          value={otpValue}
          onChange={(value) => {
            setOtpValue(value);
            setFormError(null);
          }}
          className="mb-4"
          containerClassName="justify-center gap-2"
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="bg-black/30 border-gray-800 text-white w-12 h-12 text-xl"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </motion.div>

      {formError && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-kindle-error text-xs text-center"
        >
          {formError}
        </motion.p>
      )}

      <motion.div variants={formItemVariants}>
        <Button
          onClick={handleOtpSubmit}
          disabled={otpValue.length < 6}
          className="w-full bg-kindle-accent hover:bg-opacity-80 text-white font-medium py-2"
        >
          Verify Account
        </Button>

        <p className="text-center text-sm text-gray-400 mt-4">
          Didn't receive the code?{' '}
          <button
            type="button"
            className="text-kindle-accent hover:underline"
            onClick={handleResendOtp}
          >
            Resend
          </button>
        </p>

        <p className="text-center text-sm text-gray-400 mt-2">
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setMode('login');
            }}
            className="text-kindle-accent hover:underline"
          >
            Back to login
          </button>
        </p>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-md px-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={`header-${mode}`}
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white">
            {mode === 'login' && 'Welcome!'}
            {mode === 'register' &&
              (registerStep === 1 ? 'Create Account' : 'Set Password')}
            {mode === 'forgotPassword' && 'Forgot Password'}
            {mode === 'otp' && 'Verify Account'}
          </h1>
          {mode === 'login' && (
            <p className="text-gray-400 mt-1">
              Log in to continue to your account.
            </p>
          )}
          {mode === 'register' && registerStep === 1 && (
            <p className="text-gray-400 mt-1">
              Sign up to create your account.
            </p>
          )}
          {mode === 'register' && registerStep === 2 && (
            <p className="text-gray-400 mt-1">
              Create a secure password for your account.
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {mode === 'login' && (
          <motion.div
            key="login"
            className="form-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  type: 'spring',
                  stiffness: 500,
                  damping: 50,
                  delay: 0.1,
                },
                opacity: { duration: 0.15 },
              },
            }}
          >
            {renderLoginForm()}
          </motion.div>
        )}

        {mode === 'register' && registerStep === 1 && (
          <motion.div
            key="register-step1"
            className="form-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  type: 'spring',
                  stiffness: 500,
                  damping: 50,
                  delay: 0.1,
                },
                opacity: { duration: 0.15 },
              },
            }}
          >
            {renderRegisterStep1()}
          </motion.div>
        )}

        {mode === 'register' && registerStep === 2 && (
          <motion.div
            key="register-step2"
            className="form-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  type: 'spring',
                  stiffness: 500,
                  damping: 50,
                  delay: 0.1,
                },
                opacity: { duration: 0.15 },
              },
            }}
          >
            {renderRegisterStep2()}
          </motion.div>
        )}

        {mode === 'forgotPassword' && (
          <motion.div
            key="forgot-password"
            className="form-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  type: 'spring',
                  stiffness: 500,
                  damping: 50,
                  delay: 0.1,
                },
                opacity: { duration: 0.15 },
              },
            }}
          >
            {renderForgotPasswordForm()}
          </motion.div>
        )}

        {mode === 'otp' && (
          <motion.div
            key="otp"
            className="form-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  type: 'spring',
                  stiffness: 500,
                  damping: 50,
                  delay: 0.1,
                },
                opacity: { duration: 0.15 },
              },
            }}
          >
            {renderOtpForm()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthForm;
