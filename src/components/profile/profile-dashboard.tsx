'use client';

import {
  ChevronRight,
  Copy,
  CreditCard,
  KeyRound,
  Landmark,
  LogOut,
  Mail,
  Moon,
  Trash2,
  Phone,
  UserRound,
  FilePenLine,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatNaira } from '@/components/ownership/formatters';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { BalanceAmount } from '@/components/ui/balance-amount';
import type { CurrentUser } from '@/stores/use-auth-store';
import { useProfileStore } from '@/stores/use-profile-store';
import { getWallet, type WalletSummary } from '@/lib/services/wallet-service';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { supportEmail, whatsappCommunityUrl } from '@/lib/community';
import { notify } from '@/lib/notify';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import {
  getLatestNameChangeRequest,
  requestNameChange,
  type NameChangeRequest,
} from '@/lib/services/profile-service';

// ... rest of file unchanged ...

type ProfileDashboardProps = Readonly<{ user: CurrentUser; onSignOut: () => void }>;

export function ProfileDashboard({ user, onSignOut }: ProfileDashboardProps): React.JSX.Element {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const balance = (wallet?.totalAvailableBalanceMinorUnits ?? 0) / 100;
  const resetProfile = useProfileStore((state) => state.resetProfile);
  const [nameChangeRequest, setNameChangeRequest] = useState<NameChangeRequest | null>(null);
  const [showNameRequestForm, setShowNameRequestForm] = useState(false);
  const [nameChangeReason, setNameChangeReason] = useState('');
  const [isSubmittingNameRequest, setIsSubmittingNameRequest] = useState(false);
  const [dialog, setDialog] = useState<
    'signout-first' | 'signout-final' | 'delete-first' | 'delete-final' | null
  >(null);
  useEffect(() => {
    void getWallet()
      .then(setWallet)
      .catch(() => undefined);
    void getLatestNameChangeRequest()
      .then(setNameChangeRequest)
      .catch(() => undefined);
  }, []);
  const close = (): void => setDialog(null);
  const confirm = (): void => {
    if (dialog === 'signout-first') return setDialog('signout-final');
    if (dialog === 'delete-first') return setDialog('delete-final');
    if (dialog === 'delete-final') resetProfile();
    onSignOut();
    close();
  };
  const copySupportEmail = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      notify.success('Support email copied');
    } catch {
      notify.error('Could not copy the support email');
    }
  };
  const submitNameChangeRequest = async (): Promise<void> => {
    const reason = nameChangeReason.trim();
    if (reason.length < 10) {
      notify.error('Please tell support why you need to update your name');
      return;
    }

    setIsSubmittingNameRequest(true);
    try {
      const request = await requestNameChange(reason);
      setNameChangeRequest(request);
      setShowNameRequestForm(false);
      setNameChangeReason('');
      notify.success('Name change request sent to support');
    } catch {
      notify.error('Could not send your name change request');
    } finally {
      setIsSubmittingNameRequest(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <h1 className="text-[15.5px]l mt-2 font-sans font-semibold tracking-tight">My Account</h1>
      </header>

      <section className="playtives-gold-card mt-6 rounded-2xl p-5 text-white sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-brand-foreground/15">
              <UserRound className="size-6" />
            </span>
            <div>
              <span className="rounded-full bg-brand-foreground/15 px-4 py-2 text-[10px] font-semibold">
                Playtives member
              </span>
              <h2 className="mt-2 font-sans text-xl font-semibold">{user.name}</h2>
              <p className="mt-0.5 text-sm text-brand-foreground/75">{user.email}</p>
              {user.phone ? (
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-brand-foreground/75">
                  <Phone className="size-3.5" />
                  {user.phone}
                </p>
              ) : null}
              {user.gender ? (
                <p className="mt-0.5 text-[12px] capitalize text-brand-foreground/75">
                  {user.gender === 'prefer_not_to_say'
                    ? 'Prefer not to say'
                    : user.gender.replace('_', '-')}
                </p>
              ) : null}
            </div>
          </div>

          {/* <div className="flex divide-x divide-brand-foreground/20 rounded-xl bg-brand-foreground/10 px-1 py-2 sm:shrink-0">
            <div className="px-4">
              <p className="text-xs text-brand-foreground/70">Wallet balance</p>
              <div className="mt-1 text-sm font-semibold"><BalanceAmount value={formatNaira(balance)} toggle /></div>
            </div>
          </div> */}
        </div>
      </section>

      <section className="mt-5 rounded-xl border bg-background p-4">
        <div className="flex flex-wrap items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
            <FilePenLine className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-[15.5px] font-semibold">Full name change</h2>
            {nameChangeRequest?.status === 'LINK_SENT' ? (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Support reviewed your request and sent a secure name-change link to your email.
              </p>
            ) : nameChangeRequest?.status === 'PENDING' ? (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Your request is with support. We will email you if it is approved.
              </p>
            ) : (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                To protect your account, name changes are reviewed by support before you can update them.
              </p>
            )}
          </div>
          {!nameChangeRequest || nameChangeRequest.status === 'COMPLETED' ? (
            <button
              type="button"
              onClick={() => setShowNameRequestForm((visible) => !visible)}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border px-2.5 text-xs font-semibold transition hover:bg-muted"
            >
              Request change
            </button>
          ) : null}
        </div>
        {showNameRequestForm ? (
          <div className="mt-4 border-t pt-4">
            <label className="text-xs font-semibold" htmlFor="name-change-reason">
              Why do you need to update your name?
            </label>
            <textarea
              id="name-change-reason"
              value={nameChangeReason}
              onChange={(event) => setNameChangeReason(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="For example, my registered name was entered incorrectly."
              className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-brand"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNameRequestForm(false)}
                className="h-8 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingNameRequest}
                onClick={() => void submitNameChangeRequest()}
                className="h-8 rounded-lg bg-brand px-3 text-xs font-semibold text-white disabled:opacity-60"
              >
                {isSubmittingNameRequest ? 'Sending request…' : 'Send request'}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-5 divide-y rounded-xl border bg-background px-4">
        <ProfileLink
          href="/wallet"
          icon={Landmark}
          title="Wallet"
          description="Fund, withdraw and review activity"
        />
        {/* KYC is temporarily paused.
        <ProfileLink
          href="/profile/verification"
          icon={Check}
          title="Identity and verification"
          description={`${verifiedCount} of 3 account checks complete`}
        /> */}
      </section>

      <section className="mt-6 rounded-xl border bg-background p-4">
        <h2 className="font-sans text-[15.5px] font-semibold">Security</h2>
        <div className="mt-2 divide-y">
          <Link
            href="/profile/change-password"
            className="flex items-center gap-3 py-3 transition hover:text-brand"
          >
            <KeyRound className="size-4 text-brand" />
            <span className="min-w-0 flex-1">
              <strong className="block text-sm">Change password</strong>
              <small className="text-xs text-muted-foreground">Keep your account protected</small>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Link
            href="/profile/bank-account"
            className="flex items-center gap-3 py-3 transition hover:text-brand"
          >
            <CreditCard className="size-4 text-brand" />
            <span className="min-w-0 flex-1">
              <strong className="block text-sm">Linked bank accounts</strong>
              <small className="text-xs text-muted-foreground">
                Manage withdrawal destinations
              </small>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-background p-4">
        <h2 className="font-sans text-[15.5px] font-semibold">Support and community</h2>
        <div className="mt-2 divide-y">
          <div className="flex items-center gap-3 py-3">
            <Mail className="size-4 shrink-0 text-brand" />
            <span className="min-w-0 flex-1">
              <strong className="block text-sm">Contact us</strong>
              <a
                href={`mailto:${supportEmail}`}
                className="mt-0.5 block truncate text-xs text-muted-foreground hover:text-brand"
              >
                {supportEmail}
              </a>
            </span>
            <button
              type="button"
              onClick={() => void copySupportEmail()}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border px-2.5 text-xs font-semibold transition hover:bg-muted"
            >
              <Copy className="mr-1.5 size-3.5" />
              Copy email
            </button>
          </div>
          <a
            href={whatsappCommunityUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 py-3 transition hover:text-brand"
          >
            <WhatsAppIcon className="size-4 shrink-0 text-[#178b42]" />
            <span className="min-w-0 flex-1">
              <strong className="block text-sm">Join our community on WhatsApp</strong>
              <small className="mt-0.5 block text-xs text-muted-foreground">
                Connect with other Playtives members
              </small>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </a>
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-background p-4">
        <h2 className="font-sans text-[15.5px] font-semibold">Appearance</h2>
        <div className="mt-2 flex items-center gap-3 py-3">
          <Moon className="size-4 text-brand" />
          <span className="min-w-0 flex-1">
            <strong className="block text-sm">Dark mode</strong>
            <small className="mt-0.5 block text-xs text-muted-foreground">
              Choose the theme that feels right for you
            </small>
          </span>
          <ThemeToggle />
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-background p-4">
        <h2 className="font-sans text-[15.5px] font-semibold">Account access</h2>
        <div className="mt-2 divide-y">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-start gap-3">
              <LogOut className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                <strong className="block text-sm">Sign out</strong>
                <small className="mt-0.5 block text-xs text-muted-foreground">
                  End this session on this device
                </small>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setDialog('signout-first')}
              className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition hover:bg-muted"
            >
              Sign out
            </button>
          </div>

          <div className="flex flex-col gap-3 py-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-start gap-3">
              <Trash2 className="mt-0.5 size-4 shrink-0 text-red-600" />
              <span>
                <strong className="block text-sm text-red-600">Delete account</strong>
                <small className="mt-0.5 block text-xs text-muted-foreground">
                  This action cannot be undone
                </small>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setDialog('delete-first')}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/20"
            >
              Delete account
            </button>
          </div>
        </div>
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
    <Link href={href} className="flex items-center gap-3 py-3 transition hover:text-brand">
      <Icon className="size-4 shrink-0 text-brand" />
      <span className="min-w-0 flex-1">
        <strong className="block text-sm">{title}</strong>
        <small className="mt-0.5 block text-xs text-muted-foreground">{description}</small>
      </span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
