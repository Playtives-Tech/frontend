'use client';

import { IconAdjustmentsHorizontal, IconChevronDown as ChevronDown, IconChevronLeft, IconChevronRight, IconSearch as Search } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  getOpportunities,
  isInterestOpportunityOpen,
  isPlaytivesCollective,
  subscribeToOpportunityChanges,
  type Opportunity,
} from '@/lib/opportunities';
import { OpportunityCard } from './opportunity-card';
import { LoadingSpinner } from '@/components/ui/loading-indicator';
import { trackEvent } from '@/lib/product-analytics';

export function OpportunityCatalogue(): React.JSX.Element {
  const pageSize = 6;
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All');
  const [structure, setStructure] = useState('All');
  const [sort, setSort] = useState<'NEWEST' | 'MINIMUM' | 'CLOSING'>('NEWEST');
  const [availability, setAvailability] = useState<'OPEN' | 'CLOSED' | 'COMPLETED' | 'ALL'>('OPEN');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    trackEvent('opportunities_viewed');
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
  useEffect(() => {
    if (!query.trim()) return;
    const timer = window.setTimeout(() => trackEvent('opportunity_search_used', { query_length: query.trim().length }), 600);
    return () => window.clearTimeout(timer);
  }, [query]);
  const opportunitySectors = useMemo(
    () => ['All', ...new Set(opportunities.map((item) => item.category))],
    [opportunities],
  );
  const activeFilterCount = Number(sector !== 'All') + Number(structure !== 'All') + Number(sort !== 'NEWEST');
  const visibleOpportunities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = opportunities.filter(
      (opportunity) =>
        !opportunity.hideInterestFromDashboard &&
        (availability === 'ALL' || (availability === 'COMPLETED'
          ? opportunity.memberStatus === 'COMPLETED'
          : opportunity.interestModeEnabled
          ? availability === 'OPEN' && isInterestOpportunityOpen(opportunity)
          : isPlaytivesCollective(opportunity)
            ? availability === 'OPEN'
              ? isInterestOpportunityOpen(opportunity)
              : !isInterestOpportunityOpen(opportunity)
            : availability === 'OPEN'
              ? opportunity.memberStatus ? opportunity.memberStatus === 'OPEN' : opportunity.acquisitionStatus === 'OPEN'
              : opportunity.memberStatus ? opportunity.memberStatus !== 'OPEN' && opportunity.memberStatus !== 'COMPLETED' : opportunity.acquisitionStatus !== 'OPEN')) &&
        (sector === 'All' || opportunity.category === sector) &&
        (structure === 'All' || opportunity.opportunityStructure === structure) &&
        (!normalizedQuery ||
          `${opportunity.title} ${opportunity.summary} ${opportunity.location}`
            .toLowerCase()
            .includes(normalizedQuery)),
    );
    return filtered.sort((a, b) => sort === 'MINIMUM'
      ? a.minimumUnits * a.pricePerUnitMinorUnits - b.minimumUnits * b.pricePerUnitMinorUnits
      : sort === 'CLOSING'
        ? (a.offerClosesAt ? Date.parse(a.offerClosesAt) : Number.MAX_SAFE_INTEGER) - (b.offerClosesAt ? Date.parse(b.offerClosesAt) : Number.MAX_SAFE_INTEGER)
        : Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }, [availability, sector, structure, sort, opportunities, query]);
  useEffect(() => setPage(1), [availability, sector, structure, sort, query]);
  const pageCount = Math.ceil(visibleOpportunities.length / pageSize);
  const currentPage = Math.min(page, Math.max(1, pageCount));
  const pageOpportunities = visibleOpportunities.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <div className="w-full px-4 py-6 sm:px-8 lg:py-8">
      <header>
        <h1 className="font-sans text-2xl font-semibold leading-8 tracking-tight">
          Discover opportunities
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Explore published opportunities and find one that fits your goals.</p>
      </header>

      <section className="mt-5 rounded-2xl border border-border/80 bg-background p-4 shadow-sm" aria-label="Find opportunities">
        <div className="w-full overflow-x-auto rounded-xl bg-surface p-1.5" role="tablist" aria-label="Opportunity availability">
          <div className="flex w-max gap-1.5 sm:grid sm:w-full sm:grid-cols-4">
          {([
            ['ALL', 'All'],
            ['OPEN', 'Open'],
            ['COMPLETED', 'Completed'],
            ['CLOSED', 'Fully funded & closed'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={availability === value}
              onClick={() => setAvailability(value)}
              className={cn(
                'min-h-9 shrink-0 whitespace-nowrap rounded-lg px-5 py-1.5 text-[11px] font-semibold leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:min-w-0 sm:px-4 sm:text-xs',
                availability === value
                  ? 'bg-brand text-brand-foreground'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 text-muted-foreground focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
            <Search className="size-4 shrink-0" stroke={1.8} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground" placeholder="Search opportunities" aria-label="Search opportunities, sectors or locations" />
          </label>
          <button type="button" aria-expanded={filtersOpen} aria-controls="opportunity-filter-panel" onClick={() => setFiltersOpen(!filtersOpen)} className={cn('inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand', filtersOpen || activeFilterCount > 0 ? 'border-brand/30 bg-brand/5 text-brand' : 'border-border text-foreground hover:border-brand/30')}>
            <IconAdjustmentsHorizontal className="size-4" stroke={1.8} /> Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
          </button>
          {(query.trim() || activeFilterCount > 0) ? (
            <button type="button" onClick={() => { setQuery(''); setSector('All'); setStructure('All'); setSort('NEWEST'); }} className="px-1 text-xs font-medium text-muted-foreground hover:text-brand">Clear</button>
          ) : null}
        </div>
        {filtersOpen ? (
        <div id="opportunity-filter-panel" className="mt-3 grid gap-2 border-t border-border/70 pt-3 sm:grid-cols-3">
          <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="w-11 shrink-0">Sector</span>
            <span className="relative min-w-0 flex-1">
              <select className="w-full appearance-none rounded-lg border border-border bg-background py-2 pl-2 pr-9 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" value={sector} onChange={(event) => { setSector(event.target.value); trackEvent('opportunity_filter_used', { filter: `sector:${event.target.value}` }); }}>
                {opportunitySectors.map((item) => <option key={item} value={item}>{item === 'All' ? 'All sectors' : item}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground" />
            </span>
          </label>
          <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="w-9 shrink-0">Type</span>
            <span className="relative min-w-0 flex-1">
              <select className="w-full appearance-none rounded-lg border border-border bg-background py-2 pl-2 pr-9 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" value={structure} onChange={(event) => { setStructure(event.target.value); trackEvent('opportunity_filter_used', { filter: `type:${event.target.value}` }); }}><option value="All">All types</option><option value="CO_FUNDING">Co-Funding</option><option value="CO_OWNERSHIP">Co-Ownership</option><option value="FULL_OWNERSHIP">Full Ownership</option></select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground" />
            </span>
          </label>
          <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="w-9 shrink-0">Sort</span>
            <span className="relative min-w-0 flex-1">
              <select className="w-full appearance-none rounded-lg border border-border bg-background py-2 pl-2 pr-9 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" value={sort} onChange={(event) => { setSort(event.target.value as typeof sort); trackEvent('opportunity_sort_changed', { sort: event.target.value }); }}><option value="NEWEST">Newest</option><option value="MINIMUM">Lowest minimum</option><option value="CLOSING">Closing soon</option></select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground" />
            </span>
          </label>
        </div>
        ) : null}
      </section>

      <div className="mt-6 flex items-center justify-between gap-3">
          <h2 className="font-sans text-sm font-semibold leading-6 sm:text-base">
            {availability === 'OPEN' ? 'Open opportunities' : availability === 'CLOSED' ? 'Fully funded & closed' : availability === 'COMPLETED' ? 'Completed opportunities' : 'All opportunities'}
          </h2>
        <p className="shrink-0 text-[12px] font-semibold text-muted-foreground">
          {visibleOpportunities.length} {visibleOpportunities.length === 1 ? 'result' : 'results'}
        </p>
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
        <div className="mt-4 grid grid-cols-2 items-stretch gap-2 sm:gap-3 lg:grid-cols-3">
          {pageOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.slug} opportunity={opportunity} variant="catalogue" />
          ))}
        </div>
      ) : (
        <section className="mt-5 rounded-2xl border border-dashed p-10 text-center">
          <h2 className="font-sans text-xl font-semibold">
            {availability === 'OPEN' ? 'No open opportunities' : availability === 'COMPLETED' ? 'No completed opportunities' : availability === 'CLOSED' ? 'No closed opportunities' : 'No opportunities found'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another search or select a different sector or industry.
          </p>
        </section>
      )}
      {!loading && !error && pageCount > 1 ? (
        <nav className="mt-5 flex items-center justify-center gap-2" aria-label="Opportunity pages">
          <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page" className="grid size-8 place-items-center rounded-lg border border-border text-foreground disabled:opacity-40"><IconChevronLeft className="size-4" stroke={1.8} /></button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <button key={number} type="button" onClick={() => setPage(number)} aria-label={`Page ${number}`} aria-current={number === currentPage ? 'page' : undefined} className={cn('grid size-8 place-items-center rounded-lg text-xs font-semibold', number === currentPage ? 'bg-brand text-brand-foreground' : 'border border-border text-foreground hover:border-brand/40')}>{number}</button>
          ))}
          <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount} aria-label="Next page" className="grid size-8 place-items-center rounded-lg border border-border text-foreground disabled:opacity-40"><IconChevronRight className="size-4" stroke={1.8} /></button>
        </nav>
      ) : null}
    </div>
  );
}
