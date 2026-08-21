'use client';

import { ArrowRight, KeyRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { ButtonLoadingContent } from '@/components/ui/loading-indicator';
import { notify } from '@/lib/notify';
import { ApiError } from '@/lib/api';
import { changePassword } from '@/lib/services/profile-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage(): React.JSX.Element {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
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

    if (
      newPassword.length < 8 ||
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      notify.error(
        'Password must be at least 8 characters and include upper and lowercase letters and a number',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await changePassword(currentPassword, newPassword);
      signOut();
      notify.success(response.message);
      router.replace('/sign-in');
    } catch (error: unknown) {
      notify.error(error instanceof ApiError ? error.message : 'Could not update your password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 sm:px-8 lg:px-10">
      <BackButton label="Profile" />

      <header className="mt-6">
        <h1 className="mt-2 font-sans text-2xl font-semibold">Change password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </header>

      <section className="mt-6 rounded-xl border bg-background p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand">
            <KeyRound className="size-5" />
          </span>
          <h2 className="font-sans text-lg font-semibold">Update password</h2>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Current password
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
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
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
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
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            <ButtonLoadingContent
              loading={isSubmitting}
              loadingLabel="Updating password"
              icon={<ArrowRight className="size-4" />}
            >
              Update password
            </ButtonLoadingContent>
          </button>
        </form>
      </section>
    </div>
  );
}
