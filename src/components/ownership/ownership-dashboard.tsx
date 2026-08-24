'use client';

import { CalendarDays, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getOwnerships, type Ownership } from '@/lib/services/ownership-service';
import { cn } from '@/lib/utils';
import { BalanceAmount } from '@/components/ui/balance-amount';
import { formatNaira } from './formatters';

type OwnershipTab = 'active' | 'completed';
const tabs = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
] as const;

function OwnershipCard({ ownership }: Readonly<{ ownership: Ownership }>): React.JSX.Element {
  const opportunity = ownership.opportunityId;
  const projectedReturn =
    (ownership.amountMinorUnits / 100) * (ownership.projectedReturnRatePercent / 100);
  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set';
  return (
    <Link
      href={`/ownership/${ownership._id}`}
      className="group grid overflow-hidden rounded-2xl border bg-background transition-colors hover:border-brand/30 sm:gap-4 sm:px-3 sm:py-2 sm:grid-cols-[5rem_1fr_auto_auto] sm:items-center"
    >
      <div className="relative aspect-video overflow-hidden bg-muted sm:aspect-square sm:rounded-xl">
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
      <div className="px-4 py-3 sm:px-0 sm:py-0">
        <h2 className="font-sans text-[14px] font-bold">{opportunity.title}</h2>
        <p className="text-[12px] text-muted-foreground">
          {ownership.units} {ownership.units === 1 ? 'unit' : 'units'} · {ownership.status === 'COMPLETED' ? 'Cycle completed' : 'Cycle in progress'}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-surface px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">Your contribution</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              <BalanceAmount value={formatNaira(ownership.amountMinorUnits / 100)} />
            </p>
          </div>

          <div className="rounded-xl bg-surface px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">Projected return</p>
            <div className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-brand">
              <BalanceAmount value={formatNaira(projectedReturn)} />
              <span className="text-[11px] font-medium text-muted-foreground">
                · {ownership.projectedReturnRatePercent}% target ROI
              </span>
            </div>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CalendarDays className="size-3.5 text-brand" />
          Acquired {formatDate(ownership.createdAt)} · {ownership.status === 'COMPLETED' ? `Completed ${formatDate(ownership.completedAt)}` : `Matures ${formatDate(ownership.maturityAt)}`}
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
        <h1 className="sm:text-2.5xl font-sans text-2xl font-semibold tracking-tight">
          My ownership
        </h1>
        <p className="font-sans text-[14px] text-muted-foreground">
          Follow every unit and completed cycle.
        </p>
      </header>
      <section className="playtives-gold-card mt-6 rounded-2xl p-5 text-white sm:p-6">
        <p className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-brand-foreground/70">
          Total active ownership
        </p>
        <div className="mt-3 font-sans text-2xl font-semibold sm:text-3xl">
          <BalanceAmount value={formatNaira(activeTotal / 100)} toggle />
        </div>
        <p className="mt-3 text-[13px] text-brand-foreground/75">
          Across {active.length} active {active.length === 1 ? 'ownership' : 'ownerships'}
        </p>
      </section>
      <div className="scrollbar-none mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              'shrink-0 rounded-full px-7 py-2 text-[12px] font-semibold transition',
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
          <p className="rounded-2xl border bg-background p-8 text-center text-[13px] text-muted-foreground">
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
