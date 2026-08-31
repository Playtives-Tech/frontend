'use client';

import { ArrowRight, LogOut, WalletCards } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/use-auth-store';
import { navigationItems, sidebarNavigationItems, type NavigationItem } from './navigation';
import { getAccessToken, isAccessTokenExpired } from '@/lib/session';
import { getActivityLogs, type ActivityLog } from '@/lib/services/wallet-service';
import { PageLoadingState } from '@/components/ui/loading-indicator';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { whatsappCommunityUrl } from '@/lib/community';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';

type AppShellProps = Readonly<{ children: ReactNode }>;

function NavigationLink({
  href,
  label,
  icon: Icon,
  compact = false,
  inverse = false,
}: NavigationItem & {
  compact?: boolean;
  inverse?: boolean;
}): React.JSX.Element {
  const pathname = usePathname();
  const active = href === '/' ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-[.5rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        compact ? 'flex-col gap-1 px-2 py-2 text-[10px]' : 'h-12 px-3.5 text-[.85rem]',
        inverse
          ? active
            ? 'border border-l-[2px] border-white/15 border-l-amber-500 bg-[linear-gradient(105deg,rgb(225_170_44_/_0.16),rgb(255_255_255_/_0.14))] px-[0.625rem] text-white shadow-sm'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
          : active
            ? compact
              ? 'text-brand'
              : 'bg-brand/10 text-brand'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={compact ? 'size-5' : 'size-5 shrink-0'} strokeWidth={active ? 2.5 : 2} />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: AppShellProps): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const signOut = useAuthStore((state) => state.signOut);
  const [signOutDialog, setSignOutDialog] = useState<'first' | 'final' | null>(null);
  const isNameChangeRoute = pathname === '/profile/name-change';
  const isPublicRoute =
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname === '/verify-email' ||
    isNameChangeRoute;

  useEffect(() => {
    const validateSession = (): void => {
      const token = getAccessToken();
      const hasValidSession = Boolean(user && token && !isAccessTokenExpired(token));

      if (!hasValidSession && user) signOut();
      if (!hasValidSession && !isPublicRoute) router.replace('/sign-in');
      if (hasValidSession && isPublicRoute && !isNameChangeRoute) router.replace('/');
    };

    if (!hasHydrated) return;
    validateSession();
    const timer = window.setInterval(validateSession, 30_000);
    return () => window.clearInterval(timer);
  }, [hasHydrated, isPublicRoute, router, signOut, user]);

  if (!hasHydrated)
    return (
      <div className="app-background min-h-dvh">
        <PageLoadingState label="Loading Playtives" />
      </div>
    );

  const token = getAccessToken();
  const hasValidSession = Boolean(user && token && !isAccessTokenExpired(token));

  const completeSignOut = (): void => {
    signOut();
    router.replace('/sign-in');
  };

  const confirmSignOut = (): void => {
    if (signOutDialog === 'first') {
      setSignOutDialog('final');
      return;
    }
    completeSignOut();
    setSignOutDialog(null);
  };

  if (isPublicRoute) {
    if (hasValidSession && !isNameChangeRoute)
      return <PageLoadingState label="Opening your dashboard" />;
    return <>{children}</>;
  }

  if (!hasValidSession)
    return (
      <div className="app-background min-h-dvh">
        <PageLoadingState label="Opening sign in" />
      </div>
    );

  return (
    <div className="app-background min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-emerald-950/30 bg-[radial-gradient(circle_at_8%_9%,rgb(220_170_42_/_0.28),transparent_24%),linear-gradient(160deg,#1a5634_0%,#07523b_42%,#003e2d_100%)] px-5 py-7 text-white lg:flex lg:w-[calc(15rem+5vw)]">
        <Link href="/" className="">
          <span className="font-wordmark text-4xl font-semibold leading-none">playtives</span>
        </Link>
        <span className="mt-2 text-[.85rem] font-medium leading-5 tracking-normal text-white/65">
          Own together. Build forever.
        </span>

        <nav className="mt-12 grid gap-2">
          {sidebarNavigationItems.map((item) => (
            <NavigationLink key={item.href} {...item} inverse />
          ))}
        </nav>

        <div className="mt-auto border-t border-white/15 pt-5">
          <button
            type="button"
            onClick={() => setSignOutDialog('first')}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <LogOut className="size-5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="w-full pb-24 pt-3 sm:pt-8 lg:ml-[calc(15rem+5vw)] lg:mr-[calc(20rem+10vw)] lg:w-auto lg:pb-8 lg:pt-0">
        {children}
      </main>

      <RecentActivityRail userKey={user?.email ?? null} />

      <a
        href={whatsappCommunityUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Join the Playtives WhatsApp community"
        title="Join our WhatsApp community"
        className="fixed bottom-24 right-4 z-30 grid size-11 place-items-center rounded-full bg-[#22c967] text-white shadow-sm transition-colors hover:bg-[#1cad59] lg:bottom-6 lg:right-6"
      >
        <WhatsAppIcon className="size-5" />
      </a>

      <nav className="app-surface fixed inset-x-0 bottom-0 z-20 flex h-[4.75rem] items-center justify-around border-t px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur lg:hidden">
        {navigationItems.map((item) => (
          <NavigationLink key={item.href} {...item} compact />
        ))}
      </nav>

      <ConfirmModal
        open={signOutDialog === 'first'}
        onClose={() => setSignOutDialog(null)}
        onConfirm={confirmSignOut}
        title="Sign out of Playtives?"
        description="You will need to sign in again to access your account."
        confirmLabel="Continue"
      />
      <ConfirmModal
        open={signOutDialog === 'final'}
        onClose={() => setSignOutDialog(null)}
        onConfirm={confirmSignOut}
        title="Confirm sign out"
        description="This is your final confirmation."
        confirmLabel="Sign out"
      />
    </div>
  );
}

function RecentActivityRail({ userKey }: { userKey: string | null }): React.JSX.Element {
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    let cancelled = false;
    setActivity([]);

    if (!userKey) {
      return;
    }

    const load = () =>
      getActivityLogs()
        .then((logs) => {
          if (!cancelled) setActivity(logs.slice(0, 6));
        })
        .catch(() => {
          if (!cancelled) setActivity([]);
        });

    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [userKey]);

  const signedIn = Boolean(userKey);

  return (
    <aside className="app-surface fixed inset-y-0 right-0 z-20 hidden w-80 border-l px-6 py-6 font-sans lg:block lg:w-[calc(20rem+10vw)]">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight">Recent Activities</h2>
          <Link
            href="/wallet/activity"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            aria-label="View all activity"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {!signedIn ? (
          <div className="mt-6 rounded-2xl border border-dashed bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
            Sign in to see wallet credits, unit purchases, and ownership updates here.
          </div>
        ) : activity.length > 0 ? (
          <div className="mt-5 divide-y">
            {activity.map((item) => (
              <ActivityRow key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">No recent activity yet.</p>
        )}
      </div>
    </aside>
  );
}

function ActivityRow({ item }: { item: ActivityLog }): React.JSX.Element {
  const amount =
    typeof item.metadata?.amountMinorUnits === 'number'
      ? item.metadata.amountMinorUnits / 100
      : null;
  const presentation = activityPresentation(item.action);

  return (
    <Link href={`/wallet/activity/${item._id}`} className="flex items-center gap-3 py-4">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-full ${presentation.iconClass}`}
      >
        <WalletCards className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate font-sans text-[.8rem] font-semibold tracking-tight">
          {presentation.label}
        </strong>
        <small className="block text-[.7rem] text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </small>
      </span>
      {amount !== null ? (
        <strong className={`text-xs ${presentation.amountClass}`}>
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
    ACCOUNT_CREATED: 'account setup completed',
    USER_LOGIN: 'User login completed',
    ADMIN_LOGIN: 'admin login completed',
    PASSWORD_CHANGED: 'password update completed',
    BANK_ACCOUNT_LINKED: 'bank account linked',
    BANK_ACCOUNT_REMOVED: 'bank account removed',
    WALLET_CREATED: 'wallet setup completed',
    DEPOSIT_REQUESTED: 'Cash deposit pending',
    DEPOSIT_APPROVED: 'Cash Deposit',
    WALLET_FUNDED_BY_CARD: 'Cash Deposit',
    WITHDRAWAL_REQUESTED: 'Cash withdrawal pending',
    WITHDRAWAL_COMPLETED: 'Cash Withdrawal',
    WITHDRAWAL_FEE_CHARGED: 'Transaction fee',
    EARNINGS_CREDITED: 'Investment return credited',
    PHONE_OTP_SENT: 'verification code sent',
    PHONE_VERIFIED: 'phone verification completed',
    OPPORTUNITY_ACQUIRED: 'opportunity purchase completed',
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
