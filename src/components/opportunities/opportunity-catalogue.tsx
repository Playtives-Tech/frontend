'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  opportunities,
  opportunityCategories,
  type OpportunityCategory,
} from '@/lib/opportunities';
import { OpportunityCard } from './opportunity-card';

export function OpportunityCatalogue(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<OpportunityCategory>('All');
  const visibleOpportunities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return opportunities.filter(
      (opportunity) =>
        (category === 'All' || opportunity.category === category) &&
        (!normalizedQuery ||
          `${opportunity.title} ${opportunity.description} ${opportunity.location}`
            .toLowerCase()
            .includes(normalizedQuery)),
    );
  }, [category, query]);
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header className="max-w-2xl">
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Discover opportunities
        </h1>

        <p className="mt-3 text-muted-foreground">
          Explore opportunities selected for their potential and clear ownership story.
        </p>
      </header>

      <div className="mt-8 rounded-2xl border bg-background p-3 sm:p-4">
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

      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-semibold">Available now</h2>
        <p className="text-sm text-muted-foreground">{visibleOpportunities.length} opportunities</p>
      </div>

      {visibleOpportunities.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
