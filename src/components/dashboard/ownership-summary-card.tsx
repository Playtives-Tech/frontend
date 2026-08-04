import { ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';

type OwnershipSummaryCardProps = Readonly<{ href: string; isGuest: boolean }>;

export function OwnershipSummaryCard({
  href,
  isGuest,
}: OwnershipSummaryCardProps): React.JSX.Element {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-brand to-emerald-950 p-6 text-brand-foreground sm:p-7">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-foreground/70">
            Your active ownership
          </p>

          <p className="mt-3 font-heading text-4xl font-semibold tracking-tight">₦0.00</p>
        </div>

        <span className="grid size-11 place-items-center rounded-xl bg-brand-foreground/10">
          <Building2 className="size-5" />
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <p>
          <span className="text-brand-foreground/65">Businesses owned</span>
          <span className="ml-2 font-semibold">0</span>
        </p>

        <p>
          <span className="text-brand-foreground/65">Projected distributions</span>
          <span className="ml-2 font-semibold">₦0.00</span>
        </p>
      </div>

      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-brand-foreground/25 bg-brand-foreground/10 px-3.5 py-2 text-sm font-semibold transition hover:bg-brand-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground/70"
      >
        {isGuest ? 'Create an account to own' : 'View my ownership'}

        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
