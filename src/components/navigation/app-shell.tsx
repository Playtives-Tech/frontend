'use client';

import { Bell, LogIn, LogOut, MoreHorizontal, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { notify } from '@/lib/notify';
import { useAuthStore } from '@/stores/use-auth-store';
import { navigationItems } from './navigation';
import { expireSession, getAccessToken, isAccessTokenExpired } from '@/lib/session';
import { getActivityLogs, type ActivityLog } from '@/lib/services/wallet-service';

type AppShellProps = Readonly<{ children: ReactNode }>;

function NavigationLink({
  href,
  label,
  icon: Icon,
  compact = false,
}: (typeof navigationItems)[number] & { compact?: boolean }): React.JSX.Element {
  const pathname = usePathname();
  const active = href === '/' ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        compact ? 'flex-col gap-1 px-2 py-2 text-[11px]' : 'h-11 px-3 text-sm',
        active
          ? compact
            ? 'text-brand'
            : 'bg-brand/10 text-brand'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={compact ? 'size-6' : 'size-6 shrink-0'} strokeWidth={active ? 2.5 : 2} />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: AppShellProps): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  useEffect(() => {
    if (!user) return;
    const validateSession = (): void => {
      const token = getAccessToken();
      if (!token || isAccessTokenExpired(token)) expireSession();
    };
    validateSession();
    const timer = window.setInterval(validateSession, 30_000);
    return () => window.clearInterval(timer);
  }, [user]);
  function handleSignOut(): void {
    signOut();
    notify.info('You have signed out', { description: 'Sign in again when you are ready.' });
  }
  return (
    <div className="app-background min-h-dvh">
      <aside className="app-surface fixed inset-y-0 left-0 z-20 hidden w-[25vw] flex-col border-r px-5 py-6 lg:flex">
        <Link href="/" className="flex items-center gap-3 px-2 text-xl font-bold text-brand">
          Playtives
        </Link>

        <p className="px-2 pt-10 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Explore
        </p>

        <nav className="mt-3 grid gap-1">
          {navigationItems.map((item) => (
            <NavigationLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>

      <header className="app-surface sticky top-0 z-10 flex h-14 items-center justify-between border-b px-5 backdrop-blur lg:ml-[25vw] lg:mr-[30vw] lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <span className="font-bold text-brand">Playtives</span>
        </div>

        <p className="hidden text-sm font-medium text-muted-foreground lg:block"></p>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link
            href="/notifications"
            className="relative grid size-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-brand" />
          </Link>

          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-brand/35 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:flex"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          ) : (
            <Link
              href="/profile"
              className="hidden items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-brand/35 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:flex"
            >
              <LogIn className="size-4" />
              Join Playtives
            </Link>
          )}
        </div>
      </header>

      <main className="pb-24 lg:ml-[25vw] lg:mr-[30vw] lg:pb-8">{children}</main>

      <RecentActivityRail signedIn={Boolean(user)} />

      <nav className="app-surface fixed inset-x-0 bottom-0 z-20 flex h-[4.75rem] items-center justify-around border-t px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur lg:hidden">
        {navigationItems.map((item) => (
          <NavigationLink key={item.href} {...item} compact />
        ))}
      </nav>
    </div>
  );
}

function RecentActivityRail({ signedIn }: { signedIn: boolean }): React.JSX.Element {
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (!signedIn) {
      setActivity([]);
      return;
    }

    const load = () =>
      getActivityLogs()
        .then((logs) => setActivity(logs.slice(0, 6)))
        .catch(() => setActivity([]));

    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, [signedIn]);

  return (
    <aside className="app-surface fixed inset-y-0 right-0 z-20 hidden w-[30vw] border-l px-6 py-6 lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight">Recent Activities</h2>
          <Link
            href="/wallet/activity"
            className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground"
            aria-label="View all activity"
          >
            <MoreHorizontal className="size-5" />
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
    typeof item.metadata?.amountMinorUnits === 'number' ? item.metadata.amountMinorUnits / 100 : null;

  return (
    <Link href="/wallet/activity" className="flex items-center gap-3 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
        <WalletCards className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm capitalize">
          {item.action.replaceAll('_', ' ').toLowerCase()}
        </strong>
        <small className="mt-0.5 block text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </small>
      </span>
      {amount !== null ? (
        <strong className="text-xs text-brand">
          {new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
          }).format(amount)}
        </strong>
      ) : null}
    </Link>
  );
}
