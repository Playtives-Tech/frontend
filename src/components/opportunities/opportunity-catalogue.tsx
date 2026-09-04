'use client';

import { LayoutGrid, LockKeyhole, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  getOpportunities,
  subscribeToOpportunityChanges,
  type Opportunity,
} from '@/lib/opportunities';
import { OpportunityCard } from './opportunity-card';
import { LoadingSpinner } from '@/components/ui/loading-indicator';

export function OpportunityCatalogue(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All');
  const [availability, setAvailability] = useState<'OPEN' | 'CLOSED'>('OPEN');
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
  const opportunitySectors = useMemo(
    () => ['All', ...new Set(opportunities.map((item) => item.category))],
    [opportunities],
  );
  const visibleOpportunities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = opportunities.filter(
      (opportunity) =>
        !opportunity.interestModeEnabled &&
        (availability === 'OPEN'
          ? opportunity.acquisitionStatus === 'OPEN'
          : opportunity.acquisitionStatus !== 'OPEN') &&
        (sector === 'All' || opportunity.category === sector) &&
        (!normalizedQuery ||
          `${opportunity.title} ${opportunity.summary} ${opportunity.location}`
            .toLowerCase()
            .includes(normalizedQuery)),
    );
    return filtered;
  }, [availability, sector, opportunities, query]);
  const interestOpportunities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return opportunities.filter(
      (opportunity) =>
        opportunity.interestModeEnabled &&
        (sector === 'All' || opportunity.category === sector) &&
        (!normalizedQuery ||
          `${opportunity.title} ${opportunity.summary} ${opportunity.location}`
            .toLowerCase()
            .includes(normalizedQuery)),
    );
  }, [opportunities, query, sector]);
  return (
    <div className="w-full px-4 py-6 sm:px-8 lg:py-8">
      <header className="max-w-2xl">
        <h1 className="mt-2 font-sans text-2xl font-semibold leading-8 tracking-tight sm:text-[23px] sm:leading-9">
          Discover opportunities
        </h1>
      </header>

      <div className="mt-3">
        <label className="flex h-14 items-center gap-3 rounded-xl bg-surface px-4 text-muted-foreground focus-within:ring-2 focus-within:ring-brand/30">
          <Search className="size-5" />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Search what you would like to own or co-own"
            aria-label="Search what you would like to own or co-own"
          />
        </label>

        <div className="scrollbar-none mt-4 flex items-center gap-3 overflow-x-auto pb-1">
          {opportunitySectors.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSector(item)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                sector === item
                  ? 'bg-brand text-brand-foreground'
                  : 'bg-surface text-muted-foreground hover:text-foreground',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {!loading && availability === 'OPEN' && interestOpportunities.length > 0 ? (
        <section className="mt-9 rounded-2xl border border-amber-500/25 bg-amber-500/[.045] p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-amber-700">
                <h2 className="font-sans text-[14px] font-semibold sm:text-[18px]">Coming Soon</h2>
              </div>
              <p className="text-[12px] leading-6 text-muted-foreground">
                Join the pre-launch interest list for upcoming opportunities. No payment is required
                yet.
              </p>
            </div>
            <p className="text-[12px] font-semibold text-muted-foreground">
              {interestOpportunities.length} available
            </p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {interestOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.slug} opportunity={opportunity} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h2 className="font-sans text-[15px] font-semibold leading-7 sm:text-[19px]">
            {availability === 'OPEN' ? 'Open opportunities' : 'Closed opportunities'}
          </h2>
          <p className="text-[12px] leading-6 text-muted-foreground">
            {availability === 'OPEN'
              ? 'Explore opportunities that are available for you to own.'
              : 'These opportunities are closed to new owners or already in progress.'}
          </p>
        </div>
        <p className="shrink-0 text-[12px] font-semibold text-muted-foreground">
          {visibleOpportunities.length} opportunities
        </p>
      </div>

      <div
        className="mt-5 grid w-full grid-cols-2 rounded-xl border border-border bg-surface p-1"
        role="tablist"
        aria-label="Opportunity availability"
      >
        <button
          type="button"
          onClick={() => setAvailability('OPEN')}
          role="tab"
          aria-selected={availability === 'OPEN'}
          className={cn(
            'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:flex-none',
            availability === 'OPEN'
              ? 'bg-background text-brand shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <LayoutGrid className="size-4" aria-hidden="true" />
          <span className="font-semibold">All opportunities</span>
        </button>
        <button
          type="button"
          onClick={() => setAvailability('CLOSED')}
          role="tab"
          aria-selected={availability === 'CLOSED'}
          className={cn(
            'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:flex-none',
            availability === 'CLOSED'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <LockKeyhole className="size-4" aria-hidden="true" />
          <span className="font-semibold">Closed opportunities</span>
        </button>
      </div>

      {loading ? (
        <section
          className="mt-5 grid min-h-56 place-items-center rounded-2xl border border-dashed border-brand/20 bg-brand/[0.025] px-5 py-10 text-center"
          aria-live="polite"
        >
          <div className="flex flex-col items-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
              <LoadingSpinner className="size-5" label="Loading opportunities" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground">Loading opportunities</p>
            <p className="mt-1 text-xs text-muted-foreground">Finding opportunities you can own.</p>
          </div>
        </section>
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
          <h2 className="font-sans text-xl font-semibold">
            {availability === 'OPEN' ? 'No opportunities' : 'No closed opportunities'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another search or select a different sector or industry.
          </p>
        </section>
      )}
    </div>
  );
}
