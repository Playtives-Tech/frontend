'use client';

import { Bell, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { notify } from '@/lib/notify';
import { useAuthStore } from '@/stores/use-auth-store';
import { navigationItems } from './navigation';

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
        'group flex items-center gap-3 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        compact ? 'flex-col gap-1 px-2 py-2 text-[11px]' : 'px-3 py-3 text-sm',
        active
          ? compact
            ? 'text-brand'
            : 'bg-brand text-brand-foreground shadow-sm'
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
  function handleSignOut(): void {
    signOut();
    notify.info('You have signed out', { description: 'Sign in again when you are ready.' });
  }
  return (
    <div className="app-background min-h-dvh">
      <aside className="app-surface fixed inset-y-0 left-0 z-20 hidden w-80 flex-col border-r px-5 py-6 lg:flex">
        <Link href="/" className="flex items-center gap-3 px-2 font-heading text-xl font-semibold">
          Playtives
        </Link>

        <p className="px-2 pt-12 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Explore
        </p>

        <nav className="mt-3 grid gap-1">
          {navigationItems.map((item) => (
            <NavigationLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>

      <header className="app-surface sticky top-0 z-10 flex h-16 items-center justify-between border-b px-5 backdrop-blur lg:ml-72 lg:px-10">
        <div className="flex items-center gap-3 lg:hidden">
          <span className="font-heading font-semibold">Playtives</span>
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

      <main className="pb-24 lg:ml-72 lg:pb-10">{children}</main>

      <nav className="app-surface fixed inset-x-0 bottom-0 z-20 flex h-[4.75rem] items-center justify-around border-t px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur lg:hidden">
        {navigationItems.map((item) => (
          <NavigationLink key={item.href} {...item} compact />
        ))}
      </nav>
    </div>
  );
}
