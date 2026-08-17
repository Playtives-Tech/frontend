'use client';

import { BadgeCheck, Bell, WalletCards } from 'lucide-react';
import { ActionCard } from '@/components/dashboard/action-card';
import { FeaturedOpportunities } from '@/components/dashboard/featured-opportunities';
import { OwnershipSummaryCard } from '@/components/dashboard/ownership-summary-card';
import { VerificationCard } from '@/components/dashboard/verification-card';
import { getOwnerships, type Ownership } from '@/lib/services/ownership-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { useEffect, useMemo, useState } from 'react';

export function DashboardHome(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [greeting, setGreeting] = useState('Good to see you');
  const isGuest = user === null;
  const firstName = user?.name.split(' ')[0];
  const requiresKyc = user?.kycStatus !== 'verified' && !isGuest;
  const verificationStatus = isGuest ? 'guest' : requiresKyc ? 'unverified' : 'verified';
  const walletDestination = isGuest ? '/profile' : '/wallet';
  const ownershipDestination = isGuest ? '/profile' : '/ownership';
  useEffect(() => {
    if (isGuest) {
      setOwnerships([]);
      return;
    }

    void getOwnerships()
      .then(setOwnerships)
      .catch(() => setOwnerships([]));
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
    <div className="w-full px-4 py-6 sm:px-8 lg:py-8">
      <header className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-brand">Playtives</p>
          <h1 className="mt-5 font-sans text-[24px] font-bold leading-8 tracking-normal text-foreground sm:text-[28px]">
            {isGuest ? 'Welcome to Playtives.' : `${greeting}, ${firstName}.`}
          </h1>

          <p className="mt-1 text-base text-muted-foreground">Continue your ownership journey.</p>
        </div>

        <a
          href="/notifications"
          className="mt-8 grid size-12 shrink-0 place-items-center rounded-full border bg-background shadow-sm"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </a>
      </header>

      <div className="mt-7">
        <OwnershipSummaryCard
          href={ownershipDestination}
          isGuest={isGuest}
          activeContributionMinorUnits={activeContributionMinorUnits}
          activeDealsCount={activeOwnerships.length}
        />
      </div>

      <section className="mt-7">
        <h2 className="font-sans text-xl font-bold tracking-normal">Continue your journey</h2>

        <div className="mt-4 space-y-3">
          <VerificationCard status={verificationStatus} />
          <ActionCard
            href={ownershipDestination}
            icon={BadgeCheck}
            title="My ownership"
            description="Track your units, distributions, and operator updates."
          />
          <ActionCard
            href={walletDestination}
            icon={WalletCards}
            title="Wallet"
            description="Fund your account and follow every transaction."
          />
        </div>
      </section>

      <FeaturedOpportunities />
    </div>
  );
}
