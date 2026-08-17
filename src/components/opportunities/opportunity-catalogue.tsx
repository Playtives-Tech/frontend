'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  getOpportunities,
  subscribeToOpportunityChanges,
  type Opportunity,
} from '@/lib/opportunities';
import { OpportunityCard } from './opportunity-card';

export function OpportunityCatalogue(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const load = () =>
      getOpportunities()
        .then(setOpportunities)
        .catch((value: unknown) =>
          setError(value instanceof Error ? value.message : 'Unable to load opportunities'),
        )
        .finally(() => setLoading(false));
    void load();
    const unsubscribe = subscribeToOpportunityChanges(() => void load());
    const poll = window.setInterval(() => void load(), 15_000);
    return () => {
      unsubscribe();
      window.clearInterval(poll);
    };
  }, []);
  const opportunityCategories = useMemo(
    () => ['All', ...new Set(opportunities.map((item) => item.category))],
    [opportunities],
  );
  const visibleOpportunities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return opportunities.filter(
      (opportunity) =>
        (category === 'All' || opportunity.category === category) &&
        (!normalizedQuery ||
          `${opportunity.title} ${opportunity.summary} ${opportunity.location}`
            .toLowerCase()
            .includes(normalizedQuery)),
    );
  }, [category, opportunities, query]);
  return (
    <div className="w-full px-4 py-6 sm:px-8 lg:py-8">
      <header className="max-w-2xl">
        <h1 className="mt-2 font-heading text-[28px] font-semibold leading-[34px] tracking-tight sm:text-[32px] sm:leading-10">
          Discover opportunities
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          Browse the currently published opportunities and their latest availability.
        </p>
      </header>

      <div className="mt-6 rounded-2xl border border-border/70 bg-background p-3 shadow-sm sm:p-4">
        <label className="flex h-12 items-center gap-3 rounded-xl bg-surface px-4 text-muted-foreground focus-within:ring-2 focus-within:ring-brand/30">
          <Search className="size-5" />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Search opportunities"
            aria-label="Search opportunities"
          />
        </label>

        <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-1">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border text-muted-foreground">
            <SlidersHorizontal className="size-4" />
          </span>

          {opportunityCategories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                category === item
                  ? 'bg-brand text-brand-foreground'
                  : 'bg-surface text-muted-foreground hover:text-foreground',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <h2 className="font-heading text-[22px] font-semibold leading-7 sm:text-2xl sm:leading-[30px]">
          Available now
        </h2>
        <p className="text-sm text-muted-foreground">{visibleOpportunities.length} opportunities</p>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading opportunities…</p>
      ) : error ? (
        <p className="text-destructive mt-8 text-sm">{error}</p>
      ) : visibleOpportunities.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.slug} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <section className="mt-5 rounded-2xl border border-dashed p-10 text-center">
          <h2 className="font-heading text-xl font-semibold">No matching opportunities</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another search or select a different category.
          </p>
        </section>
      )}
    </div>
  );
}
