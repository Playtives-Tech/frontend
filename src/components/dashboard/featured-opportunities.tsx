import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { opportunities } from '@/lib/opportunities';

export function FeaturedOpportunities(): React.JSX.Element {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between gap-5">
        <div>
          <h2 className="mt-2 font-heading text-2xl font-semibold">Featured opportunities</h2>
        </div>

        <Link
          href="/discover"
          className="hidden items-center gap-2 text-sm font-semibold text-brand hover:underline sm:inline-flex"
        >
          Explore all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {opportunities.slice(0, 3).map((opportunity) => (
          <OpportunityCard key={opportunity.slug} opportunity={opportunity} />
        ))}
      </div>

      <Link
        href="/discover"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline sm:hidden"
      >
        Explore all
        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
