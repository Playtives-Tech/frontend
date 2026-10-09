'use client';

import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Clock3,
  LockKeyhole,
  Newspaper,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FeaturedOpportunities } from '@/components/dashboard/featured-opportunities';
import { VerificationCard } from '@/components/dashboard/verification-card';
import { PortfolioSummaryCard } from '@/components/dashboard/portfolio-summary-card';
import { getOwnerships, type Ownership } from '@/lib/services/ownership-service';
import {
  getActivityLogs,
  getWallet,
  type ActivityLog,
  type WalletSummary,
} from '@/lib/services/wallet-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { whatsappLearningCommunityUrl, whatsappTribeCommunityUrl } from '@/lib/community';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { BalanceAmount } from '@/components/ui/balance-amount';
import { formatNaira } from '@/components/ownership/formatters';
import { useEffect, useMemo, useState } from 'react';
import { blogService, type BlogPost } from '@/lib/services/blog-service';
import { getCurrentUser } from '@/lib/services/registration-service';
import {
  getCollectiveDashboard,
  getCollectivePortfolioPosition,
  type CollectivePortfolioPosition,
} from '@/lib/services/collectives-service';
import { notificationService } from '@/lib/services/notification-service';
import { queryKeys } from '@/lib/query/query-keys';

export function DashboardHome(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [collectivePosition, setCollectivePosition] = useState<CollectivePortfolioPosition | null>(
    null,
  );
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [greeting, setGreeting] = useState('Good to see you');
  const isGuest = user === null;
  const notificationCount = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationService.unreadCount,
    enabled: !isGuest,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const unreadNotificationCount = notificationCount.data?.count ?? 0;
  const isPending = user?.memberStatus === 'pending';
  const participationApproved = user?.participationAccessApproved === true;
  const participationExpiry = useMemo(
    () => parseParticipationExpiry(user?.participationAccessExpiresAt),
    [user?.participationAccessExpiresAt],
  );
  const firstName = user?.name.split(' ')[0];
  const communityDestination = isPending ? whatsappLearningCommunityUrl : whatsappTribeCommunityUrl;
  useEffect(() => {
    if (isGuest) {
      setOwnerships([]);
      setWallet(null);
      setCollectivePosition(null);
      return;
    }

    if (isPending) setOwnerships([]);
    else
      void getOwnerships()
        .then(setOwnerships)
        .catch(() => setOwnerships([]));
    if (isPending) setCollectivePosition(null);
    else
      void getCollectiveDashboard()
        .then((dashboard) => setCollectivePosition(getCollectivePortfolioPosition(dashboard)))
        .catch(() => setCollectivePosition(null));
    void getWallet()
      .then(setWallet)
      .catch(() => setWallet(null));
    void getActivityLogs()
      .then((items) => setActivity(items.slice(0, 4)))
      .catch(() => setActivity([]));
  }, [isGuest, isPending]);
  useEffect(() => {
    if (isGuest || !isPending) return;
    let cancelled = false;
    const refreshUser = (): void => {
      void getCurrentUser()
        .then((currentUser) => {
          if (!cancelled) updateUser(currentUser);
        })
        .catch(() => undefined);
    };
    refreshUser();
    const timer = window.setInterval(refreshUser, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isGuest, isPending, updateUser]);
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
  const currentCollectiveMinorUnits =
    collectivePosition?.status === 'COMPLETED'
      ? 0
      : (collectivePosition?.displayValueMinorUnits ?? 0);
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
          <h1 className="mt-3 font-sans text-[1.1rem] font-bold leading-8 tracking-normal text-foreground sm:text-[1.3rem]">
            {isGuest ? 'Welcome to Playtives.' : `${greeting}, ${firstName}.`}
          </h1>
          <p className="text-[.8rem] font-medium text-muted-foreground">
            Keep building your portfolio.
          </p>
        </div>

        <Link
          href="/notifications"
          className="relative mt-1 grid size-10 shrink-0 place-items-center rounded-full border bg-background shadow-sm"
          aria-label={
            unreadNotificationCount > 0
              ? `${unreadNotificationCount} unread notification${unreadNotificationCount === 1 ? '' : 's'}`
              : 'Notifications'
          }
          prefetch={false}
        >
          <Bell className="size-5" />
          {unreadNotificationCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-background bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          ) : null}
        </Link>
      </header>

      <section className="mt-5 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/[0.045] px-4 py-3.5 text-sm sm:mt-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
          <UsersRound className="size-4.5" />
        </span>
        <div>
          <p className="text-[.95rem] font-semibold text-foreground">
            {isPending ? 'Your Playtives participation account' : 'For active community members'}
          </p>
          <p className="mt-0.5 text-[.8rem] leading-5 text-muted-foreground sm:text-[.8rem]">
            {isPending
              ? 'Browse opportunities and complete your KYC while Playtives prepares your participation access. Your portfolio and inner Co-Owners Tribe access unlock after your first confirmed opportunity.'
              : 'This platform is solely for active community members of Playtives Coowners Tribe (Playtives Cooperative Multipurpose Society Limited).'}
          </p>
        </div>
      </section>

      <div className="mt-5 sm:mt-7">
        {isPending ? (
          <section className="rounded-2xl border border-brand/20 bg-background p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <LockKeyhole className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                  Pending member access
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {participationApproved
                    ? 'You are approved to continue'
                    : 'Request approval before you participate'}
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {participationApproved
                    ? 'You can now fund your wallet and continue with an open opportunity. Your account becomes active after participation is confirmed.'
                    : 'You can browse and complete KYC now. Wallet funding and opportunity participation remain locked until an administrator approves your request.'}
                </p>
                {participationApproved ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-3.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-700">
                        <Clock3 className="size-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          Complete your participation within 48 hours
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {participationExpiry
                            ? `Your approved access expires on ${formatParticipationExpiry(participationExpiry)}. Confirm a co-ownership or co-funding opportunity before then, or your account will return to community membership.`
                            : 'Confirm a co-ownership or co-funding opportunity before your approval window closes, or your account will return to community membership.'}
                        </p>
                        {participationExpiry ? (
                          <p className="mt-2 inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                            {participationTimeRemaining(participationExpiry)} remaining
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid gap-2 rounded-xl border border-brand/10 bg-brand/[0.035] p-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-background px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Available wallet balance
                        </p>
                        <div className="mt-1 font-sans text-xl font-semibold tracking-tight text-foreground">
                          <BalanceAmount
                            value={
                              wallet
                                ? formatNaira(wallet.totalAvailableBalanceMinorUnits / 100)
                                : 'Loading…'
                            }
                            toggle={wallet !== null}
                          />
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                          Funds ready for your first co-ownership or co-funding opportunity.
                        </p>
                      </div>
                      <div className="rounded-lg bg-background px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Deposits awaiting approval
                        </p>
                        <div className="mt-1 font-sans text-xl font-semibold tracking-tight text-foreground">
                          <BalanceAmount
                            value={
                              wallet
                                ? formatNaira(wallet.deposit.pendingBalanceMinorUnits / 100)
                                : 'Loading…'
                            }
                          />
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                          Approved deposits automatically move into your available balance.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={participationApproved ? '/wallet/deposit' : '/access-request'}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white"
                  >
                    {participationApproved ? 'Fund wallet' : 'Request access'}{' '}
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/discover"
                    className="inline-flex h-10 items-center rounded-lg border px-4 text-xs font-semibold"
                  >
                    Browse opportunities
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <PortfolioSummaryCard
            walletBalanceMinorUnits={wallet?.totalAvailableBalanceMinorUnits ?? null}
            ownershipBalanceMinorUnits={activeContributionMinorUnits + currentCollectiveMinorUnits}
            coOwnedContributionMinorUnits={coOwnedContributionMinorUnits}
            coFundedContributionMinorUnits={coFundedContributionMinorUnits}
            fullOwnershipContributionMinorUnits={fullOwnershipContributionMinorUnits}
            activeOwnershipCount={
              activeOwnerships.length + (currentCollectiveMinorUnits > 0 ? 1 : 0)
            }
            collectiveContributionMinorUnits={currentCollectiveMinorUnits}
            isGuest={isGuest}
          />
        )}
      </div>

      {!isGuest ? (
        <section className="mt-6 sm:mt-7">
          <VerificationCard />
        </section>
      ) : null}

      <FeaturedOpportunities />

      <MobileBlogPreview />

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
              <h2 className="mt-1 text-sm font-semibold">
                {isPending ? 'Join the Playtives community' : 'Join the Playtives Co-Owners Tribe'}
              </h2>
              <p className="w-[70%] text-xs leading-5 text-muted-foreground">
                {isPending
                  ? 'Learn with the wider Playtives community while you prepare for your first opportunity.'
                  : 'Connect with active co-owners and receive ownership updates.'}
              </p>
            </div>
          </div>
          <a
            href={communityDestination}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#22c967] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#1cad59]"
          >
            {isPending ? 'Join community' : 'Join inner tribe'}
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}

function MobileBlogPreview(): React.JSX.Element | null {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    void blogService
      .list(1)
      .then((data) => setPosts(data.items.slice(0, 2)))
      .catch(() => setPosts([]));
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="mt-7 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Newspaper className="size-4 text-brand" />
          <h2 className="text-base font-semibold tracking-tight">Latest insights</h2>
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="mt-3 grid gap-3">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug}`}
            className="flex gap-3 rounded-xl border bg-background p-3 transition hover:border-brand/35"
          >
            <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {post.coverImageUrl ? (
                <img src={post.coverImageUrl} alt="" className="size-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand">
                {post.category}
              </p>
              <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5">{post.title}</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                ·{' '}
                {new Date(post.publishedAt).toLocaleTimeString('en-NG', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
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

function parseParticipationExpiry(value: string | null | undefined): Date | null {
  if (!value) return null;
  const expiry = new Date(value);
  return Number.isNaN(expiry.getTime()) ? null : expiry;
}

function formatParticipationExpiry(value: Date): string {
  return `${new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(value)} WAT`;
}

function participationTimeRemaining(expiry: Date): string {
  const remainingMinutes = Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / 60_000));
  if (remainingMinutes === 0) return 'less than 1m';
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
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
    BVN_VERIFIED: 'BVN verified',
    NIN_VERIFIED: 'NIN verified',
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
