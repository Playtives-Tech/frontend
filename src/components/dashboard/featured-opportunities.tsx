'use client';

import { ArrowRight, Compass } from 'lucide-react';
import Link from 'next/link';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { useEffect, useState } from 'react';
import {
  getOpportunities,
  subscribeToOpportunityChanges,
  type Opportunity,
} from '@/lib/opportunities';

export function FeaturedOpportunities(): React.JSX.Element {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const load = () =>
      getOpportunities()
        .then(setOpportunities)
        .catch(() => setOpportunities([]))
        .finally(() => setIsLoading(false));
    void load();
    const unsubscribe = subscribeToOpportunityChanges(() => void load());
    const poll = window.setInterval(() => void load(), 15_000);
    return () => {
      unsubscribe();
      window.clearInterval(poll);
    };
  }, []);
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-5">
        <div>
          <h2 className="font-sans text-lg font-bold tracking-normal">Discover opportunities</h2>
        </div>

        <Link
          href="/discover"
          className="hidden items-center gap-1.5 text-xs font-semibold text-brand hover:underline sm:inline-flex"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {opportunities.length > 0 ? (
        <div className="scrollbar-none -mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-3 sm:-mx-8 sm:scroll-px-8 sm:px-8">
          {opportunities.slice(0, 8).map((opportunity) => (
            <div key={opportunity.slug} className="snap-start">
              <OpportunityCard opportunity={opportunity} variant="compact" />
            </div>
          ))}
        </div>
      ) : !isLoading ? (
        <div className="mt-3 flex min-h-36 items-center gap-4 rounded-xl border border-dashed border-brand/25 bg-brand/[0.035] px-5 py-5 sm:min-h-40 sm:px-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
            <Compass className="size-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Fresh opportunities are on the way</h3>
            <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
              There are no opportunities available to join right now. We only publish opportunities once they are ready for members.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 h-36 animate-pulse rounded-xl border bg-muted/30" aria-label="Loading opportunities" />
      )}

      <Link
        href="/discover"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline sm:hidden"
      >
        View all
        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
