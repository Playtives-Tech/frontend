'use client';

import { ArrowUpRight, Bell } from 'lucide-react';
import { FeaturedOpportunities } from '@/components/dashboard/featured-opportunities';
import { OwnershipSummaryCard } from '@/components/dashboard/ownership-summary-card';
// KYC is temporarily paused: import { VerificationCard } from '@/components/dashboard/verification-card';
import { WalletSummaryCard } from '@/components/dashboard/wallet-summary-card';
import { getOwnerships, type Ownership } from '@/lib/services/ownership-service';
import { getWallet, type WalletSummary } from '@/lib/services/wallet-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { whatsappCommunityUrl } from '@/lib/community';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { useEffect, useMemo, useState } from 'react';

export function DashboardHome(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [greeting, setGreeting] = useState('Good to see you');
  const isGuest = user === null;
  const firstName = user?.name.split(' ')[0];
  // KYC is temporarily paused.
  // const requiresKyc = user?.kycStatus !== 'verified' && !isGuest;
  // const verificationStatus = isGuest ? 'guest' : requiresKyc ? 'unverified' : 'verified';
  const ownershipDestination = isGuest ? '/profile' : '/ownership';
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

  return (
    <div className="w-full px-4 py-4 sm:px-8 lg:py-6">
      <header className="flex items-start justify-between gap-5">
        <div>
          <img src="/playtives-logo-mark.png" alt="Playtives logo mark" className="w-6 h-6 object-contain" />
          <h1 className="mt-3 font-sans text-[1rem] font-bold leading-8 tracking-normal text-foreground sm:text-[1.3rem]">
            {isGuest ? 'Welcome to Playtives.' : `${greeting}, ${firstName}.`}
          </h1>
          <p className="text-[.8rem] font-medium text-muted-foreground">Continue your ownership journey.</p>
        </div>

        <a
          href="/notifications"
          className="mt-8 grid size-10 shrink-0 place-items-center rounded-full border bg-background shadow-sm"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </a>
      </header>

      <div className="scrollbar-none -mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 scroll-px-4 sm:-mx-8 sm:px-8 sm:scroll-px-8">
        <div className="w-[calc(100%_-_3.5rem)] min-w-[18rem] shrink-0 snap-start">
          <WalletSummaryCard
            balanceMinorUnits={wallet?.totalAvailableBalanceMinorUnits ?? null}
            depositedFundsMinorUnits={wallet?.deposit.availableBalanceMinorUnits ?? null}
            investmentReturnsMinorUnits={wallet?.earnings.availableBalanceMinorUnits ?? null}
          />
        </div>
        <div className="w-[calc(100%_-_3.5rem)] min-w-[18rem] shrink-0 snap-start">
          <OwnershipSummaryCard
            href={ownershipDestination}
            isGuest={isGuest}
            activeContributionMinorUnits={activeContributionMinorUnits}
            activeDealsCount={activeOwnerships.length}
          />
        </div>
      </div>

      {/* KYC is temporarily paused.
      <section className="mt-7 gap-4">
        <h2 className="font-sans text-xl font-bold tracking-normal">Continue your journey</h2>
        <div className="mt-4">
          <VerificationCard status={verificationStatus} />
        </div>
      </section> */}

      <FeaturedOpportunities />

      <section className="relative mt-7 overflow-hidden rounded-xl border border-[#25D366]/20 bg-[linear-gradient(120deg,rgb(37_211_102_/_0.10),rgb(255_255_255_/_0.96)_52%)] p-4 dark:border-[#25D366]/15 dark:bg-[linear-gradient(120deg,rgb(37_211_102_/_0.16),rgb(20_32_27_/_0.96)_52%)] sm:p-5">
        <div className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-[#25D366]/10 blur-2xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
              <WhatsAppIcon className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#178b42]">Playtives community</p>
              <h2 className="mt-1 text-sm font-semibold">Join us on WhatsApp</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Receive helpful ownership updates and connect with the Playtives community.
              </p>
            </div>
          </div>
          <a
            href={whatsappCommunityUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#20bd5a]"
          >
            Join community
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
