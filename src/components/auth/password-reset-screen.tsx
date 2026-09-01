'use client';

import { CheckCircle2, Eye, EyeOff, KeyRound, Mail } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { ButtonLoadingContent } from '@/components/ui/loading-indicator';
import { ApiError } from '@/lib/api';
import { requestPasswordReset, resetPassword } from '@/lib/services/registration-service';

export function ForgotPasswordScreen(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof ApiError ? requestError.message : 'We could not send a reset link.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PasswordFrame icon={<Mail className="size-7" />} title="Reset your password">
      {submitted ? (
        <>
          <p className="mb-5 text-sm text-muted-foreground">
            Check your email for a secure link to reset your password. The link expires in 30
            minutes.
          </p>
          <Link href="/sign-in" className={primaryButtonClass}>
            Return to sign in
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="mt-7 grid gap-4 text-left">
          <p>Enter your account email and we’ll send a secure password-reset link.</p>
          <label className="grid gap-2 text-sm font-semibold">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="h-12 rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          {error ? <p className="text-destructive text-sm font-medium">{error}</p> : null}
          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            <ButtonLoadingContent loading={isSubmitting} loadingLabel="">
              Send reset link
            </ButtonLoadingContent>
          </button>
          <Link
            href="/sign-in"
            className="text-center text-sm font-semibold text-brand hover:underline"
          >
            Back to sign in
          </Link>
        </form>
      )}
    </PasswordFrame>
  );
}

export function ResetPasswordScreen({
  token,
}: Readonly<{ token: string | null }>): React.JSX.Element {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [complete, setComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : 'This password reset link is incomplete.',
  );

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!token) return;
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setComplete(true);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'We could not reset your password.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PasswordFrame
      icon={complete ? <CheckCircle2 className="size-7" /> : <KeyRound className="size-7" />}
      title={complete ? 'Password updated' : 'Choose a new password'}
    >
      {complete ? (
        <>
          <p className="mb-5 text-sm text-muted-foreground">
            Your password has been reset. For security, sign in again on all devices.
          </p>
          <Link href="/sign-in" className={primaryButtonClass}>
            Continue to sign in
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="mt-3 grid gap-4 text-left">
          <p>
            Use at least 8 characters, including an uppercase letter, lowercase letter, and number.
          </p>
          <label className="grid gap-2 text-sm font-semibold">
            New password
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              visible={isNewPasswordVisible}
              onToggleVisibility={() => setIsNewPasswordVisible((visible) => !visible)}
              label="new password"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Confirm new password
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={isConfirmPasswordVisible}
              onToggleVisibility={() => setIsConfirmPasswordVisible((visible) => !visible)}
              label="confirm new password"
            />
          </label>
          {error ? <p className="text-destructive text-sm font-medium">{error}</p> : null}
          <button type="submit" disabled={!token || isSubmitting} className={primaryButtonClass}>
            <ButtonLoadingContent loading={isSubmitting} loadingLabel="">
              Update password
            </ButtonLoadingContent>
          </button>
          <Link
            href="/forgot-password"
            className="text-center text-sm font-semibold text-brand hover:underline"
          >
            Request a new link
          </Link>
        </form>
      )}
    </PasswordFrame>
  );
}

const primaryButtonClass =
  'inline-flex h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-60';

function PasswordInput({
  value,
  onChange,
  visible,
  onToggleVisibility,
  label,
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  label: string;
}>): React.JSX.Element {
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="new-password"
        minLength={8}
        required
        className="h-12 w-full rounded-xl border bg-background px-4 pr-11 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function PasswordFrame({
  icon,
  title,
  children,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <main className="grid min-h-dvh place-items-center bg-muted/20 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border bg-background p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
          {icon}
        </span>
        <h1 className="mt-5 font-sans text-[24px] font-semibold">{title}</h1>
        <div className="mt-3 text-muted-foreground">{children}</div>
      </section>
    </main>
  );
}
