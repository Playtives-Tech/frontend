'use client';

import { ArrowRight } from 'lucide-react';
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
  useEffect(() => {
    const load = () =>
      getOpportunities()
        .then(setOpportunities)
        .catch(() => setOpportunities([]));
    void load();
    const unsubscribe = subscribeToOpportunityChanges(() => void load());
    const poll = window.setInterval(() => void load(), 15_000);
    return () => {
      unsubscribe();
      window.clearInterval(poll);
    };
  }, []);
  return (
    <section className="mt-8 overflow-hidden">
      <div className="flex items-center justify-between gap-5">
        <div>
          <h2 className="font-sans text-lg font-bold tracking-normal">
            Discover opportunities
          </h2>
        </div>

        <Link
          href="/discover"
          className="hidden items-center gap-1.5 text-xs font-semibold text-brand hover:underline sm:inline-flex"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="scrollbar-none -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-3 scroll-px-4 sm:-mx-8 sm:px-8 sm:scroll-px-8">
        {opportunities.slice(0, 8).map((opportunity) => (
          <div key={opportunity.slug} className="snap-start">
            <OpportunityCard opportunity={opportunity} variant="compact" />
          </div>
        ))}
      </div>

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
