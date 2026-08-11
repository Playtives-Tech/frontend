'use client';

import { ArrowRight, CheckCircle2, Mail, UserRound } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { AccountModeToggle, type AccountMode } from '@/components/auth/account-mode-toggle';
import { ProfileDashboard } from '@/components/profile/profile-dashboard';
import { notify } from '@/lib/notify';
import { ApiError } from '@/lib/api';
import { login, register, resendVerification } from '@/lib/services/registration-service';
import { useAuthStore } from '@/stores/use-auth-store';

export default function ProfilePage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);
  const [mode, setMode] = useState<AccountMode>('sign-up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mode') === 'sign-in') setMode('sign-in');
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (mode === 'sign-up') {
      if (password !== confirmPassword) {
        notify.error('Passwords do not match');
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await register({ name: name.trim(), email: email.trim(), password });
        setPendingEmail(response.user.email);
        notify.success('Account created', { description: 'Check your email to verify it.' });
      } catch (error: unknown) {
        notify.error(error instanceof ApiError ? error.message : 'Could not create your account');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login(email.trim(), password);
      signIn({ name: response.user.name, email: response.user.email }, response.accessToken);
      notify.success(`Welcome back, ${response.user.name.split(' ')[0]}`, {
        description: 'Your profile is ready.',
      });
    } catch (error: unknown) {
      notify.error(error instanceof ApiError ? error.message : 'Could not sign in');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (user)
    return (
      <ProfileDashboard
        user={user}
        onSignOut={() => {
          signOut();
          notify.info('You have signed out.');
        }}
      />
    );

  if (pendingEmail)
    return (
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl items-center px-5 py-10 sm:px-8 lg:px-10">
        <div className="w-full rounded-3xl border bg-background p-6 text-center shadow-sm sm:p-8">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Mail className="size-7" />
          </span>

          <h1 className="mt-5 font-heading text-3xl font-semibold">Check your email</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            We sent a verification link to{' '}
            <strong className="text-foreground">{pendingEmail}</strong>. Open it to finish creating
            your account.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isResending}
              onClick={() => {
                setIsResending(true);
                void resendVerification(pendingEmail)
                  .then(() => notify.success('A new verification link has been sent'))
                  .catch((error: unknown) =>
                    notify.error(
                      error instanceof ApiError ? error.message : 'Could not resend the link',
                    ),
                  )
                  .finally(() => setIsResending(false));
              }}
              className="h-12 rounded-xl bg-brand px-5 font-semibold text-brand-foreground disabled:opacity-60"
            >
              {isResending ? 'Sending…' : 'Resend verification email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingEmail(null);
                setMode('sign-in');
              }}
              className="h-12 rounded-xl border bg-background px-5 font-semibold"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </section>
    );

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl items-center px-5 py-10 sm:px-8 lg:px-10">
      <div className="w-full rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
          <UserRound className="size-6" />
        </span>

        <AccountModeToggle
          mode={mode}
          onChange={(nextMode) => {
            setMode(nextMode);
            setPassword('');
            setConfirmPassword('');
          }}
        />

        <h1 className="mt-4 font-heading text-3xl font-semibold">
          {mode === 'sign-up' ? 'Create an account to start owning.' : 'Welcome back to Playtives.'}
        </h1>

        <p className="mt-3 max-w-xl text-muted-foreground">
          {mode === 'sign-up'
            ? 'Save opportunities, fund your wallet, and follow every ownership update from one secure profile.'
            : 'Sign in to continue your ownership journey.'}
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-5">
          {mode === 'sign-up' && (
            <label className="grid gap-2 text-sm font-medium">
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="Your name"
              />
            </label>
          )}

          <label className="grid gap-2 text-sm font-medium">
            Email address
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="you@example.com"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Password
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="8+ characters, uppercase and number"
            />
          </label>

          {mode === 'sign-up' && (
            <label className="grid gap-2 text-sm font-medium">
              Confirm password
              <input
                required
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="Enter your password again"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110"
          >
            {isSubmitting
              ? 'Creating account…'
              : mode === 'sign-up'
                ? 'Create my account'
                : 'Sign in'}{' '}
            {isSubmitting ? (
              <CheckCircle2 className="size-4 animate-pulse" />
            ) : (
              <ArrowRight className="size-4" />
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
