'use client';

import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getOwnerships, type Ownership } from '@/lib/services/ownership-service';
import { cn } from '@/lib/utils';
import { formatNaira } from './formatters';

type OwnershipTab = 'active' | 'completed' | 'cancelled';
const tabs = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

function OwnershipCard({ ownership }: Readonly<{ ownership: Ownership }>): React.JSX.Element {
  const opportunity = ownership.opportunityId;
  return (
    <Link
      href={`/ownership/${ownership._id}`}
      className="group grid gap-5 rounded-2xl border bg-background p-4 transition hover:border-brand/30 hover:shadow-lg sm:grid-cols-[6rem_1fr_auto_auto] sm:items-center sm:p-5"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {opportunity.imageUrl && (
          <Image
            src={opportunity.imageUrl}
            unoptimized
            alt={opportunity.imageAlt || opportunity.title}
            fill
            sizes="160px"
            className="object-cover"
          />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-brand">
          {ownership.status.toLowerCase()} ownership
        </p>
        <h2 className="mt-1 font-heading text-xl font-semibold">{opportunity.title}</h2>
        <p className="mt-1 text-muted-foreground">
          {ownership.units} {ownership.units === 1 ? 'unit' : 'units'}
        </p>
        <div className="mt-4 flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            Created {new Date(ownership.createdAt).toLocaleDateString('en-NG')}
          </span>
          <span className="font-semibold text-brand">{ownership.progressPercent}% complete</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${ownership.progressPercent}%` }}
          />
        </div>
      </div>
      <div className="sm:text-right">
        <p className="text-sm text-muted-foreground">Your contribution</p>
        <p className="mt-1 text-lg font-semibold text-brand">
          {formatNaira(ownership.amountMinorUnits / 100)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Target ROI {ownership.projectedReturnRatePercent}%
        </p>
      </div>
      <ChevronRight className="hidden size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-brand sm:block" />
    </Link>
  );
}

export function OwnershipDashboard(): React.JSX.Element {
  const [tab, setTab] = useState<OwnershipTab>('active');
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    void getOwnerships()
      .then(setOwnerships)
      .catch((value: unknown) =>
        setError(value instanceof Error ? value.message : 'Could not load ownerships'),
      );
  }, []);
  const active = useMemo(() => ownerships.filter((item) => item.status === 'ACTIVE'), [ownerships]);
  const visible = ownerships.filter((item) => item.status === tab.toUpperCase());
  const activeTotal = active.reduce((total, item) => total + item.amountMinorUnits, 0);
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          My ownership
        </h1>
        <p className="mt-2 text-muted-foreground">Follow every unit and completed cycle.</p>
      </header>
      <section className="mt-8 rounded-3xl bg-gradient-to-br from-brand to-emerald-950 p-6 text-brand-foreground sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-foreground/70">
          Total active ownership
        </p>
        <p className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
          {formatNaira(activeTotal / 100)}
        </p>
        <p className="mt-2 text-brand-foreground/75">
          Across {active.length} active {active.length === 1 ? 'ownership' : 'ownerships'}
        </p>
      </section>
      <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition',
              tab === value ? 'bg-brand text-brand-foreground' : 'bg-surface text-muted-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <section className="mt-6 grid gap-4">
        {error && (
          <p className="border-destructive/30 text-destructive rounded-xl border p-4 text-sm">
            {error}
          </p>
        )}
        {!error && visible.length === 0 && (
          <p className="rounded-2xl border bg-background p-8 text-center text-muted-foreground">
            No {tab} ownership units yet.
          </p>
        )}
        {visible.map((ownership) => (
          <OwnershipCard key={ownership._id} ownership={ownership} />
        ))}
      </section>
    </div>
  );
}
