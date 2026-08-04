'use client';

import { BadgeCheck, WalletCards } from 'lucide-react';
import { ActionCard } from '@/components/dashboard/action-card';
import { FeaturedOpportunities } from '@/components/dashboard/featured-opportunities';
import { OwnershipSummaryCard } from '@/components/dashboard/ownership-summary-card';
import { VerificationCard } from '@/components/dashboard/verification-card';
import { useAuthStore } from '@/stores/use-auth-store';

export function DashboardHome(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name.split(' ')[0] ?? 'Investor';
  const isGuest = user === null;
  const requiresKyc = user?.kycStatus !== 'verified' && !isGuest;
  const verificationStatus = isGuest ? 'guest' : requiresKyc ? 'unverified' : 'verified';
  const walletDestination = isGuest ? '/profile' : '/wallet';
  const ownershipDestination = isGuest ? '/profile' : '/ownership';

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Good to see you, {firstName}.
        </h1>

        <p className="mt-2 text-muted-foreground">
          Your ownership, wallet, and next opportunity at a glance.
        </p>
      </header>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <OwnershipSummaryCard href={ownershipDestination} isGuest={isGuest} />

        <ActionCard
          href={ownershipDestination}
          icon={BadgeCheck}
          title="My ownership"
          description="Track positions, distributions, and updates."
        />
      </div>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <VerificationCard status={verificationStatus} />

        <ActionCard
          href={walletDestination}
          icon={WalletCards}
          title="Wallet"
          description="Fund your account and follow every transaction."
        />
      </section>

      <FeaturedOpportunities />
    </div>
  );
}
