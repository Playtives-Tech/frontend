import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  WalletCards,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Opportunity } from '@/lib/opportunities';
import type { OwnedOpportunity } from '@/lib/ownership';
import { formatNaira } from './formatters';

type OwnershipPositionDetailProps = Readonly<{
  ownership: OwnedOpportunity;
  opportunity: Opportunity;
}>;

function DetailMetric({
  label,
  value,
}: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <div className="rounded-xl bg-surface p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

export function OwnershipPositionDetail({
  ownership,
  opportunity,
}: OwnershipPositionDetailProps): React.JSX.Element {
  const completed = ownership.status === 'completed';
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
      <Link
        href="/ownership"
        className="inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm font-semibold shadow-sm transition hover:border-brand/35 hover:bg-muted"
      >
        <ArrowLeft className="size-4" />
        Back to My Ownership
      </Link>
      <section className="mt-6 overflow-hidden rounded-3xl border bg-background">
        <div className="relative aspect-[16/7] min-h-56 bg-muted">
          <Image
            src={opportunity.imageUrl}
            unoptimized
            alt={opportunity.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        </div>
        <div className="relative -mt-9 rounded-t-3xl bg-background p-6 sm:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
            {completed ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}
            {completed ? 'Completed ownership' : 'Active ownership'}
          </span>
          <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {opportunity.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {ownership.cycle} · {ownership.positions}{' '}
            {ownership.positions === 1 ? 'position' : 'positions'}
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailMetric label="Your contribution" value={formatNaira(ownership.contribution)} />
            <DetailMetric label="Target ROI" value={ownership.roi} />
            <DetailMetric
              label={completed ? 'Completion' : 'Expected completion'}
              value={ownership.expectedCompletion}
            />
            <DetailMetric label="Return schedule" value={opportunity.returnSchedule} />
          </div>
          {!completed && (
            <>
              <div className="mt-7 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cycle progress</span>
                <span className="font-semibold text-brand">{ownership.progress}% complete</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${ownership.progress}%` }}
                />
              </div>
              <section className="mt-10">
                <h2 className="font-heading text-xl font-semibold">Position information</h2>
                <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
                  Your ownership position is active. Operator updates, reviewed evidence, and
                  distribution records will appear here as the cycle progresses.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <DetailMetric label="Operator" value={opportunity.operator} />
                  <DetailMetric label="Ownership model" value={opportunity.ownershipModel} />
                </div>
              </section>
            </>
          )}
          {completed && (
            <section className="mt-10 rounded-2xl bg-surface p-5 sm:p-6">
              <h2 className="font-heading text-xl font-semibold">Funds are in your wallet</h2>
              <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
                The completed cycle return of {formatNaira(ownership.distribution)} has been
                credited to your wallet. You can view your balance or explore a new opportunity to
                reinvest.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/wallet"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-semibold transition hover:border-brand/35 hover:bg-muted"
                >
                  <WalletCards className="size-4" />
                  View wallet
                </Link>
                <Link
                  href="/discover"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:brightness-110"
                >
                  <RefreshCw className="size-4" />
                  Explore opportunities
                </Link>
              </div>
            </section>
          )}
          <section className="mt-10 border-t pt-7">
            <h2 className="font-heading text-xl font-semibold">Position timeline</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4 text-brand" />
                Position created
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-brand" />
                Agreement recorded
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="size-4 text-brand"> </Clock3>
                {completed ? 'Cycle completed' : 'Cycle in progress'}
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
