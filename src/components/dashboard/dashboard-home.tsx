'use client';

import {
  IconArrowRight as ArrowRight,
  IconArrowUpRight as ArrowUpRight,
  IconBell as Bell,
  IconCircleCheck as CheckCircle2,
  IconNews as Newspaper,
  IconUsersGroup as UsersRound,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FeaturedOpportunities } from '@/components/dashboard/featured-opportunities';
import { VerificationCard } from '@/components/dashboard/verification-card';
import { HomePortfolioCard } from '@/components/dashboard/home-portfolio-card';
import { getPortfolio } from '@/lib/services/portfolio-service';
import { WealthGoalCard } from '@/components/dashboard/wealth-goal-card';
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
import { FinancialActivityIcon } from '@/components/wallet/financial-activity-icon';
import { IconWallet } from '@tabler/icons-react';
import { formatNaira } from '@/components/ownership/formatters';
import { useEffect, useState } from 'react';
import { blogService, type BlogPost } from '@/lib/services/blog-service';
import { getCurrentUser } from '@/lib/services/registration-service';
import {
  getCollectiveDashboard,
  getCollectivePortfolioPosition,
  type CollectivePortfolioPosition,
} from '@/lib/services/collectives-service';
import { notificationService } from '@/lib/services/notification-service';
import { queryKeys } from '@/lib/query/query-keys';
import {
  getParticipationVerification,
  type ParticipationVerification,
} from '@/lib/services/profile-service';

export function DashboardHome(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [verification, setVerification] = useState<ParticipationVerification | null>(null);
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
  const portfolioQuery = useQuery({ queryKey: ['portfolio'], queryFn: getPortfolio, enabled: !isGuest });
  const unreadNotificationCount = notificationCount.data?.count ?? 0;
  const isPending = user?.memberStatus === 'pending';
  const hasParticipated = collectivePosition !== null || ownerships.some((ownership) => ownership.status === 'ACTIVE' || ownership.status === 'COMPLETED');
  const needsActivation = !isGuest && user?.memberStatus !== 'active' && !hasParticipated;
  const firstName = user?.name.split(' ')[0];
  const communityDestination = isPending ? whatsappLearningCommunityUrl : whatsappTribeCommunityUrl;
  useEffect(() => {
    if (isGuest) {
      setOwnerships([]);
      setWallet(null);
      setCollectivePosition(null);
      return;
    }

    void getOwnerships()
      .then((items) => {
        setOwnerships(items);
      })
      .catch(() => setOwnerships([]));
    void getCollectiveDashboard()
      .then((dashboard) => {
        const position = getCollectivePortfolioPosition(dashboard);
        setCollectivePosition(position);
        if (position) {
          void getCurrentUser().then(updateUser).catch(() => undefined);
        }
      })
      .catch(() => setCollectivePosition(null));
    void getParticipationVerification()
      .then(setVerification)
      .catch(() => setVerification(null));
    void getWallet()
      .then(setWallet)
      .catch(() => setWallet(null));
    void getActivityLogs()
      .then((items) => setActivity(items.slice(0, 4)))
      .catch(() => setActivity([]));
  }, [isGuest]);
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

      {!isGuest ? (
        <WealthGoalCard
          memberId={user.id}
          isActiveMember={user.memberStatus === 'active'}
          productivePortfolioMinorUnits={portfolioQuery.data?.productivePortfolioMinorUnits ?? null}
        />
      ) : null}

      {!isGuest && verification ? (
        <section className="mt-5 flex flex-col gap-4 rounded-2xl border border-brand/20 bg-background p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h2 className="font-semibold">
              {!verification.canJoinOpportunity
                ? "You're almost ready to start building"
                : wallet?.totalAvailableBalanceMinorUnits
                  ? 'Your money is ready to work'
                  : 'You’re ready to start building'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {!verification.canJoinOpportunity
                ? 'Verify your phone, NIN, or BVN to participate. You can explore opportunities now.'
                : wallet?.totalAvailableBalanceMinorUnits
                  ? `${formatNaira(wallet.totalAvailableBalanceMinorUnits / 100)} is available in your wallet.`
                  : 'Explore opportunities or fund your wallet when you are ready.'}
            </p>
          </div>
          <Link
              className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white sm:w-auto"
              href={
                !verification.canJoinOpportunity
                  ? '/profile/verification'
                  : wallet?.totalAvailableBalanceMinorUnits
                    ? '/discover'
                    : '/wallet'
              }
            >
              {!verification.canJoinOpportunity
                ? 'Continue verification'
                : wallet?.totalAvailableBalanceMinorUnits
                  ? 'Explore opportunities'
                  : 'Fund your wallet'}
          </Link>
        </section>
      ) : null}

      {/* <section className="mt-5 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/[0.045] px-4 py-3.5 text-sm sm:mt-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
          <UsersRound className="size-4.5" />
        </span>
        <div>
          <p className="text-[.95rem] font-semibold text-foreground">
            {needsActivation ? 'Your Playtives participation account' : 'For active community members'}
          </p>
          <p className="mt-0.5 text-[.8rem] leading-5 text-muted-foreground sm:text-[.8rem]">
            {needsActivation
              ? 'Explore opportunities, complete identity verification, fund your wallet, and make your first participation when you are ready.'
              : 'This platform is solely for active community members of Playtives Coowners Tribe (Playtives Cooperative Multipurpose Society Limited).'}
          </p>
        </div>
      </section> */}

      <div className="mt-5 sm:mt-7">
        {needsActivation ? (
          <section className="rounded-2xl border border-brand/20 bg-background p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <IconWallet className="size-6 shrink-0 text-brand" stroke={1.8} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">{verification?.canFundWallet ? 'Ready for your first opportunity' : 'Verify to start participating'}</h2>
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    {2 +
                      Number(Boolean(verification?.canJoinOpportunity)) +
                      Number(Boolean(wallet?.totalAvailableBalanceMinorUnits)) +
                      Number(hasParticipated)}{' '}
                    / 5 complete
                  </span>
                </div>
                <div
                  className="mt-3 flex gap-1.5"
                  role="progressbar"
                  aria-label="Playtives setup"
                  aria-valuenow={
                    2 +
                    Number(Boolean(verification?.canJoinOpportunity)) +
                    Number(Boolean(wallet?.totalAvailableBalanceMinorUnits)) +
                    Number(hasParticipated)
                  }
                  aria-valuemin={0}
                  aria-valuemax={5}
                >
                  {[
                    true,
                    true,
                    Boolean(verification?.canJoinOpportunity),
                    Boolean(wallet?.totalAvailableBalanceMinorUnits),
                    hasParticipated,
                  ].map((done, index) => (
                    <span
                      key={index}
                      className={`h-1.5 flex-1 rounded-full ${done ? 'bg-brand' : 'bg-brand/10'}`}
                    />
                  ))}
                </div>
                <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  {[
                    ['Account', true],
                    ['Email', true],
                    ['Verify', Boolean(verification?.canJoinOpportunity)],
                    ['Fund', Boolean(wallet?.totalAvailableBalanceMinorUnits)],
                    ['Participate', hasParticipated],
                  ].map(([label, done]) => (
                    <li
                      key={String(label)}
                      className={`inline-flex items-center gap-1.5 ${done ? 'text-brand' : ''}`}
                    >
                      {done ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <span className="size-3.5 rounded-full border" />
                      )}
                      {label}
                    </li>
                  ))}
                </ol>
                {wallet ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl bg-brand/[0.045] px-4 py-3">
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Available to participate
                      </p>
                      <div className="mt-1 font-sans text-lg font-semibold tracking-tight text-foreground">
                        <BalanceAmount
                          value={
                            wallet
                              ? formatNaira(wallet.totalAvailableBalanceMinorUnits / 100)
                              : 'Loading…'
                          }
                          toggle={wallet !== null}
                        />
                      </div>
                    </div>
                    <div className="rounded-xl bg-surface px-4 py-3">
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Deposit pending approval
                      </p>
                      <div className="mt-1 font-sans text-lg font-semibold tracking-tight text-foreground">
                        <BalanceAmount
                          value={
                            wallet
                              ? formatNaira(wallet.deposit.pendingBalanceMinorUnits / 100)
                              : 'Loading…'
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={
                      !verification?.canFundWallet
                        ? '/profile/verification'
                        : wallet && wallet.totalAvailableBalanceMinorUnits > 0
                        ? '/discover'
                        : '/wallet/deposit'
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white"
                  >
                    {!verification?.canFundWallet
                      ? 'Complete one verification'
                      : wallet && wallet.totalAvailableBalanceMinorUnits > 0
                      ? 'Co-own or co-fund'
                      : 'Fund wallet'}{' '}
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href={
                      wallet && wallet.totalAvailableBalanceMinorUnits > 0
                        ? '/wealth-collectives'
                        : '/discover'
                    }
                    className="inline-flex h-10 items-center rounded-lg border px-4 text-xs font-semibold"
                  >
                    {wallet && wallet.totalAvailableBalanceMinorUnits > 0
                      ? 'View Wealth Collective'
                      : 'Browse opportunities'}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <HomePortfolioCard portfolio={portfolioQuery.data ?? null} />
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
            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-brand/5 text-brand">
              {post.coverImageUrl ? (
                <img src={post.coverImageUrl} alt="" className="size-full object-cover" />
              ) : (
                <Newspaper className="size-6" stroke={1.6} aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand">
                {post.category}
              </p>
              <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5">{post.title}</h3>
              {post.excerpt ? (
                <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground">{post.excerpt}</p>
              ) : null}
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

function MobileActivityRow({ item }: Readonly<{ item: ActivityLog }>): React.JSX.Element {
  const amount =
    typeof item.metadata?.amountMinorUnits === 'number'
      ? item.metadata.amountMinorUnits / 100
      : null;
  const presentation = activityPresentation(item.action);
  const balanceAfter =
    typeof item.metadata?.balanceAfterMinorUnits === 'number'
      ? item.metadata.balanceAfterMinorUnits / 100
      : null;
  return (
    <Link href={`/wallet/activity/${item._id}`} className="flex items-center gap-3 py-3.5">
      <FinancialActivityIcon action={item.action} className={`size-5 shrink-0 ${presentation.iconClass}`} />
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
      <span className="shrink-0 text-right">
        {amount !== null ? (
          <strong className={`block text-xs font-semibold ${presentation.amountClass}`}>
            {presentation.prefix}
            {formatAmount(amount)}
          </strong>
        ) : null}
        {balanceAfter !== null ? (
          <small className="block text-[11px] text-muted-foreground">
            {formatAmount(balanceAfter)}
          </small>
        ) : null}
      </span>
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
      ? 'text-emerald-600'
      : outgoing
        ? 'text-foreground'
        : 'text-muted-foreground',
    amountClass: incoming ? 'text-emerald-600' : outgoing ? 'text-red-600' : 'text-brand',
  };
}
