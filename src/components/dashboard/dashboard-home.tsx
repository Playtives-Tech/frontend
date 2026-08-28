'use client';

import { ArrowRight, ArrowUpRight, Bell, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { FeaturedOpportunities } from '@/components/dashboard/featured-opportunities';
// KYC is temporarily paused: import { VerificationCard } from '@/components/dashboard/verification-card';
import { PortfolioSummaryCard } from '@/components/dashboard/portfolio-summary-card';
import { getOwnerships, type Ownership } from '@/lib/services/ownership-service';
import {
  getActivityLogs,
  getWallet,
  type ActivityLog,
  type WalletSummary,
} from '@/lib/services/wallet-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { whatsappCommunityUrl } from '@/lib/community';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { useEffect, useMemo, useState } from 'react';

export function DashboardHome(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [greeting, setGreeting] = useState('Good to see you');
  const isGuest = user === null;
  const firstName = user?.name.split(' ')[0];
  // KYC is temporarily paused.
  // const requiresKyc = user?.kycStatus !== 'verified' && !isGuest;
  // const verificationStatus = isGuest ? 'guest' : requiresKyc ? 'unverified' : 'verified';
  useEffect(() => {
    if (isGuest) {
      setOwnerships([]);
      setWallet(null);
      return;
    }

    void getOwnerships()
      .then(setOwnerships)
      .catch(() => setOwnerships([]));
    void getWallet()
      .then(setWallet)
      .catch(() => setWallet(null));
    void getActivityLogs()
      .then((items) => setActivity(items.slice(0, 4)))
      .catch(() => setActivity([]));
  }, [isGuest]);
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);
  const activeOwnerships = useMemo(
    () => ownerships.filter((ownership) => ownership.status === 'ACTIVE'),
    [ownerships],
  );
  const activeContributionMinorUnits = activeOwnerships.reduce(
    (total, ownership) => total + ownership.amountMinorUnits,
    0,
  );
  const coOwnedContributionMinorUnits = activeOwnerships
    .filter((ownership) => ownershipStructure(ownership) === 'CO_OWNERSHIP')
    .reduce((total, ownership) => total + ownership.amountMinorUnits, 0);
  const coFundedContributionMinorUnits = activeOwnerships
    .filter((ownership) => ownershipStructure(ownership) === 'CO_FUNDING')
    .reduce((total, ownership) => total + ownership.amountMinorUnits, 0);
  const fullOwnershipContributionMinorUnits = activeOwnerships
    .filter((ownership) => ownershipStructure(ownership) === 'FULL_OWNERSHIP')
    .reduce((total, ownership) => total + ownership.amountMinorUnits, 0);

  return (
    <div className="w-full px-4 py-4 sm:px-8 lg:py-6">
      <header className="flex items-start justify-between gap-5">
        <div>
          <img
            src="/playtives-logo-mark.png"
            alt="Playtives logo mark"
            className="h-6 w-6 object-contain"
          />
          <h1 className="mt-3 font-sans text-[1rem] font-bold leading-8 tracking-normal text-foreground sm:text-[1.3rem]">
            {isGuest ? 'Welcome to Playtives.' : `${greeting}, ${firstName}.`}
          </h1>
          <p className="text-[.8rem] font-medium text-muted-foreground">
            Keep building your portfolio.
          </p>
        </div>

        <a
          href="/notifications"
          className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border bg-background shadow-sm"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </a>
      </header>

      <div className="mt-5 sm:mt-7">
        <PortfolioSummaryCard
          walletBalanceMinorUnits={wallet?.totalAvailableBalanceMinorUnits ?? null}
          ownershipBalanceMinorUnits={activeContributionMinorUnits}
          coOwnedContributionMinorUnits={coOwnedContributionMinorUnits}
          coFundedContributionMinorUnits={coFundedContributionMinorUnits}
          fullOwnershipContributionMinorUnits={fullOwnershipContributionMinorUnits}
          activeOwnershipCount={activeOwnerships.length}
          isGuest={isGuest}
        />
      </div>

      {/* KYC is temporarily paused.
      <section className="mt-7 gap-4">
        <h2 className="font-sans text-xl font-bold tracking-normal">Continue your journey</h2>
        <div className="mt-4">
          <VerificationCard status={verificationStatus} />
        </div>
      </section> */}

      <FeaturedOpportunities />

      <section className="mt-6 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold tracking-tight">Recent activities</h2>
          <Link
            href="/wallet/activity"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-3 divide-y rounded-xl border bg-background px-4">
          {activity.length > 0 ? (
            activity.map((item) => <MobileActivityRow key={item._id} item={item} />)
          ) : (
            <p className="py-5 text-xs leading-5 text-muted-foreground">
              Your important wallet and ownership updates will appear here.
            </p>
          )}
        </div>
      </section>

      <section className="relative mt-6 overflow-hidden rounded-xl border border-[#22c967]/20 bg-[linear-gradient(120deg,rgb(34_201_103_/_0.09),rgb(255_255_255_/_0.96)_52%)] p-4 dark:border-[#22c967]/15 dark:bg-[linear-gradient(120deg,rgb(34_201_103_/_0.14),rgb(20_32_27_/_0.96)_52%)] sm:mt-7 sm:p-5">
        <div className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-[#22c967]/10 blur-2xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#22c967] text-white">
              <WhatsAppIcon className="size-5" />
            </span>
            <div>
              <h2 className="mt-1 text-sm font-semibold">Join us on WhatsApp</h2>
              <p className="text-xs leading-5 text-muted-foreground">
                Receive helpful ownership updates and connect with the Playtives community.
              </p>
            </div>
          </div>
          <a
            href={whatsappCommunityUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#22c967] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#1cad59]"
          >
            Join community
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}

function ownershipStructure(ownership: Ownership): Ownership['opportunityStructure'] {
  return ownership.opportunityId.opportunityStructure ?? ownership.opportunityStructure;
}

function MobileActivityRow({ item }: Readonly<{ item: ActivityLog }>): React.JSX.Element {
  const amount =
    typeof item.metadata?.amountMinorUnits === 'number'
      ? item.metadata.amountMinorUnits / 100
      : null;
  const presentation = activityPresentation(item.action);
  return (
    <Link href={`/wallet/activity/${item._id}`} className="flex items-center gap-3 py-3.5">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-full ${presentation.iconClass}`}
      >
        <WalletCards className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-xs font-semibold text-foreground">
          {presentation.label}
        </strong>
        <small className="mt-0.5 block text-[11px] text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </small>
      </span>
      {amount !== null ? (
        <strong className={`text-xs font-semibold ${presentation.amountClass}`}>
          {presentation.prefix}
          {formatAmount(amount)}
        </strong>
      ) : null}
    </Link>
  );
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function activityPresentation(action: string): {
  label: string;
  prefix: string;
  iconClass: string;
  amountClass: string;
} {
  const labels: Record<string, string> = {
    ACCOUNT_CREATED: 'Account setup completed',
    PASSWORD_CHANGED: 'Password updated',
    BANK_ACCOUNT_LINKED: 'Bank account linked',
    BANK_ACCOUNT_REMOVED: 'Bank account removed',
    WALLET_CREATED: 'Wallet setup completed',
    DEPOSIT_REQUESTED: 'Cash deposit pending',
    DEPOSIT_APPROVED: 'Cash Deposit',
    WALLET_FUNDED_BY_CARD: 'Cash Deposit',
    WITHDRAWAL_REQUESTED: 'Cash withdrawal pending',
    WITHDRAWAL_COMPLETED: 'Cash Withdrawal',
    WITHDRAWAL_FEE_CHARGED: 'Transaction fee',
    EARNINGS_CREDITED: 'Investment return credited',
    OPPORTUNITY_ACQUIRED: 'Opportunity purchase completed',
  };
  const incoming = ['DEPOSIT_APPROVED', 'WALLET_FUNDED_BY_CARD', 'EARNINGS_CREDITED'].includes(
    action,
  );
  const outgoing = [
    'WITHDRAWAL_COMPLETED',
    'WITHDRAWAL_FEE_CHARGED',
    'OPPORTUNITY_ACQUIRED',
  ].includes(action);
  const label = labels[action] ?? action.replaceAll('_', ' ').toLowerCase();
  return {
    label: `${label.charAt(0).toUpperCase()}${label.slice(1)}`,
    prefix: incoming ? '+ ' : outgoing ? '- ' : '',
    iconClass: incoming
      ? 'bg-emerald-500/10 text-emerald-600'
      : outgoing
        ? 'bg-amber-500/10 text-amber-700'
        : 'bg-brand/10 text-brand',
    amountClass: incoming ? 'text-emerald-600' : outgoing ? 'text-red-600' : 'text-brand',
  };
}
