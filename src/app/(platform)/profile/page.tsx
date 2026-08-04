'use client';

import { ArrowRight, UserRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { AccountModeToggle, type AccountMode } from '@/components/auth/account-mode-toggle';
import { ProfileDashboard } from '@/components/profile/profile-dashboard';
import { notify } from '@/lib/notify';
import { useAuthStore } from '@/stores/use-auth-store';

export default function ProfilePage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);
  const [mode, setMode] = useState<AccountMode>('sign-up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const displayName = name.trim() || email.split('@')[0] || 'Investor';
    signIn({ name: displayName, email });

    notify.success(
      mode === 'sign-in' ? `Welcome back, ${displayName}` : `Welcome to Playtives, ${displayName}`,
      {
        description: mode === 'sign-in' ? 'Your profile is ready.' : 'Your account is ready.',
      },
    );
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

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl items-center px-5 py-10 sm:px-8 lg:px-10">
      <div className="w-full rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
          <UserRound className="size-6" />
        </span>

        <AccountModeToggle mode={mode} onChange={setMode} />

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
              className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="At least 8 characters"
            />
          </label>

          <button
            type="submit"
            className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110"
          >
            {mode === 'sign-up' ? 'Create my account' : 'Sign in'} <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
