'use client';

import {
  ChevronRight,
  CreditCard,
  KeyRound,
  Landmark,
  Check,
  Trash2,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatNaira } from '@/components/ownership/formatters';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import type { CurrentUser } from '@/stores/use-auth-store';
import { useProfileStore } from '@/stores/use-profile-store';
import { getWallet, type WalletSummary } from '@/lib/services/wallet-service';

// ... rest of file unchanged ...

type ProfileDashboardProps = Readonly<{ user: CurrentUser; onSignOut: () => void }>;

export function ProfileDashboard({ user, onSignOut }: ProfileDashboardProps): React.JSX.Element {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const balance = (wallet?.totalAvailableBalanceMinorUnits ?? 0) / 100;
  const verification = useProfileStore((state) => state.verification);
  const resetProfile = useProfileStore((state) => state.resetProfile);
  const [dialog, setDialog] = useState<
    'signout-first' | 'signout-final' | 'delete-first' | 'delete-final' | null
  >(null);
  useEffect(() => {
    void getWallet()
      .then(setWallet)
      .catch(() => undefined);
  }, []);
  const verifiedCount = Object.values(verification).filter(
    (status) => status === 'verified',
  ).length;
  const close = (): void => setDialog(null);
  const confirm = (): void => {
    if (dialog === 'signout-first') return setDialog('signout-final');
    if (dialog === 'delete-first') return setDialog('delete-final');
    if (dialog === 'delete-final') resetProfile();
    onSignOut();
    close();
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">My Profile</h1>
      </header>

      <section className="mt-8 rounded-3xl bg-gradient-to-br from-brand to-emerald-950 p-6 text-brand-foreground sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-brand-foreground/15">
            <UserRound className="size-8" />
          </span>
          <div>
            <span className="rounded-full bg-brand-foreground/15 px-3 py-1 text-xs font-semibold">
              Playtives member
            </span>
            <h2 className="mt-3 font-heading text-3xl font-semibold">{user.name}</h2>
            <p className="mt-1 text-brand-foreground/75">{user.email}</p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-foreground/15 bg-brand-foreground/10 p-4">
            <p className="text-sm text-brand-foreground/70">Verification checks</p>
            <p className="mt-2 text-xl font-semibold">{verifiedCount} of 3 complete</p>
          </div>
          <div className="rounded-xl border border-brand-foreground/15 bg-brand-foreground/10 p-4">
            <p className="text-sm text-brand-foreground/70">Wallet balance</p>
            <p className="mt-2 text-xl font-semibold">{formatNaira(balance)}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-background p-2">
        <ProfileLink
          href="/wallet"
          icon={Landmark}
          title="Wallet"
          description="Fund, withdraw and review activity"
        />

        <ProfileLink
          href="/profile/verification"
          icon={Check}
          title="Identity and verification"
          description={`${verifiedCount} of 3 account checks complete`}
        />
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-semibold">Security</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/profile/change-password"
            className="flex items-center gap-3 rounded-xl border bg-background p-4 transition hover:bg-muted"
          >
            <KeyRound className="size-5 text-brand" />
            <span>
              <strong className="block">Change password</strong>
              <small className="text-muted-foreground">Keep your account protected</small>
            </span>
          </Link>
          <Link
            href="/profile/bank-account"
            className="flex items-center gap-3 rounded-xl border bg-background p-4 transition hover:bg-muted"
          >
            <CreditCard className="size-5 text-brand" />
            <span>
              <strong className="block">Linked bank accounts</strong>
              <small className="text-muted-foreground">Manage withdrawal destinations</small>
            </span>
          </Link>
        </div>
      </section>

      <section className="mt-8 flex flex-wrap gap-3 border-t pt-6">
        <button
          type="button"
          onClick={() => setDialog('signout-first')}
          className="rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          Sign out
        </button>
        <button
          type="button"
          onClick={() => setDialog('delete-first')}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <Trash2 className="size-4" />
          Delete account
        </button>
      </section>

      <ConfirmModal
        open={dialog === 'signout-first'}
        onClose={close}
        onConfirm={confirm}
        title="Sign out of Playtives?"
        description="You will need to sign in again to access your account."
        confirmLabel="Continue"
      />
      <ConfirmModal
        open={dialog === 'signout-final'}
        onClose={close}
        onConfirm={confirm}
        title="Confirm sign out"
        description="This is your final confirmation."
        confirmLabel="Sign out"
      />
      <ConfirmModal
        open={dialog === 'delete-first'}
        onClose={close}
        onConfirm={confirm}
        title="Delete your account?"
        description="This removes this device session. Financial records may be retained where required by law."
        confirmLabel="Continue"
        tone="danger"
      />
      <ConfirmModal
        open={dialog === 'delete-final'}
        onClose={close}
        onConfirm={confirm}
        title="Are you absolutely sure?"
        description="Your profile data on this device will be removed immediately."
        confirmLabel="Delete account"
        tone="danger"
      />
    </div>
  );
}

function ProfileLink({
  href,
  icon: Icon,
  title,
  description,
}: Readonly<{
  href: string;
  icon: typeof Landmark;
  title: string;
  description: string;
}>): React.JSX.Element {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-xl p-4 transition hover:bg-muted">
      <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block">{title}</strong>
        <small className="mt-1 block text-muted-foreground">{description}</small>
      </span>
      <ChevronRight className="size-5 text-muted-foreground" />
    </Link>
  );
}
