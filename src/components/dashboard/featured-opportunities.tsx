'use client';

import { IconArrowRight as ArrowRight, IconChevronLeft, IconChevronRight, IconCompass as Compass } from '@tabler/icons-react';
import Link from 'next/link';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { useEffect, useRef, useState } from 'react';
import {
  getOpportunities,
  subscribeToOpportunityChanges,
  type Opportunity,
} from '@/lib/opportunities';

export function FeaturedOpportunities(): React.JSX.Element {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
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
  const featuredOpportunities = [...opportunities].sort((left, right) => {
    if (left.acquisitionStatus === right.acquisitionStatus) return 0;
    return left.acquisitionStatus === 'OPEN' ? -1 : 1;
  });
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = (): void => {
      setCanScrollLeft(rail.scrollLeft > 2);
      setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [featuredOpportunities.length]);

  function scrollCards(direction: -1 | 1): void {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(180, rail.clientWidth * 0.75), behavior: 'smooth' });
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-5">
        <div>
          <h2 className="font-sans text-lg font-bold tracking-normal">Discover opportunities</h2>
        </div>

        <div className="flex items-center gap-2">
          {canScrollLeft ? (
            <button type="button" onClick={() => scrollCards(-1)} aria-label="Scroll opportunities left" className="grid size-8 place-items-center rounded-full border border-brand/20 text-brand transition hover:bg-brand/5">
              <IconChevronLeft className="size-4" stroke={1.8} />
            </button>
          ) : null}
          {canScrollRight ? (
            <button type="button" onClick={() => scrollCards(1)} aria-label="Scroll opportunities right" className="grid size-8 place-items-center rounded-full border border-brand/20 text-brand transition hover:bg-brand/5">
              <IconChevronRight className="size-4" stroke={1.8} />
            </button>
          ) : null}
          <Link
            href="/discover"
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {featuredOpportunities.length > 0 ? (
        <div ref={railRef} onScroll={() => {
          const rail = railRef.current;
          if (!rail) return;
          setCanScrollLeft(rail.scrollLeft > 2);
          setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2);
        }} className="scrollbar-none -mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-3 sm:-mx-8 sm:scroll-px-8 sm:px-8">
          {featuredOpportunities.slice(0, 8).map((opportunity) => (
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
            <h3 className="text-sm font-semibold text-foreground">
              Fresh opportunities are on the way
            </h3>
            <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
              There are no opportunities available to join right now. We only publish opportunities
              once they are ready for members.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="mt-3 h-36 animate-pulse rounded-xl border bg-muted/30"
          aria-label="Loading opportunities"
        />
      )}
    </section>
  );
}
