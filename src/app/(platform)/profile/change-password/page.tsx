'use client';

import { ArrowRight, KeyRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { notify } from '@/lib/notify';

export default function ChangePasswordPage(): React.JSX.Element {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      notify.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    notify.success('Password updated successfully');

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      <BackButton label="Profile" />

      <header className="mt-7">
        <h1 className="mt-2 font-heading text-3xl font-semibold">Change password</h1>
        <p className="mt-3 text-muted-foreground">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border bg-background p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
            <KeyRound className="size-6" />
          </span>
          <h2 className="font-heading text-xl font-semibold">Update password</h2>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-medium">
            Current password
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            New password
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Confirm new password
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update password'} <ArrowRight className="size-4" />
          </button>
        </form>
      </section>
    </div>
  );
}
