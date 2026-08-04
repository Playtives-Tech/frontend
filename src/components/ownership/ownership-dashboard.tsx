'use client';

import { ArrowRight, ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { opportunities } from '@/lib/opportunities';
import { ownedOpportunities, ownershipTotal, type OwnedOpportunity } from '@/lib/ownership';
import { cn } from '@/lib/utils';
import { formatNaira } from './formatters';

type OwnershipTab = 'active' | 'completed' | 'activity';

const tabs = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'activity', label: 'Activity' },
] as const satisfies readonly Readonly<{ value: OwnershipTab; label: string }>[];

function getOpportunity(slug: string) {
  const opportunity = opportunities.find((item) => item.slug === slug);
  if (!opportunity) throw new Error(`Opportunity not found: ${slug}`);
  return opportunity;
}

function ActiveOwnershipCard({
  ownership,
}: Readonly<{ ownership: OwnedOpportunity }>): React.JSX.Element {
  const opportunity = getOpportunity(ownership.opportunitySlug);
  return (
    <Link
      href={`/ownership/${ownership.id}`}
      className="group grid gap-5 rounded-2xl border bg-background p-4 transition hover:border-brand/30 hover:shadow-lg sm:grid-cols-[6rem_1fr_auto_auto] sm:items-center sm:p-5"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted sm:aspect-square">
        <Image
          src={opportunity.image}
          alt={opportunity.alt}
          fill
          sizes="160px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-brand">Active ownership</p>
        <h2 className="mt-1 font-heading text-xl font-semibold">{opportunity.title}</h2>
        <p className="mt-1 text-muted-foreground">
          {ownership.positions} {ownership.positions === 1 ? 'position' : 'positions'} ·{' '}
          {ownership.cycle}
        </p>
        <div className="mt-4 flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Completes {ownership.expectedCompletion}</span>
          <span className="font-semibold text-brand">{ownership.progress}% complete</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${ownership.progress}%` }}
          />
        </div>
      </div>
      <div className="sm:text-right">
        <p className="text-sm text-muted-foreground">Your contribution</p>
        <p className="mt-1 text-lg font-semibold text-brand">
          {formatNaira(ownership.contribution)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Target ROI {ownership.roi}</p>
      </div>

      <ChevronRight className="hidden size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-brand sm:block" />
    </Link>
  );
}

function CompletedOwnershipCard({
  ownership,
}: Readonly<{ ownership: OwnedOpportunity }>): React.JSX.Element {
  const opportunity = getOpportunity(ownership.opportunitySlug);
  return (
    <Link
      href={`/ownership/${ownership.id}`}
      className="group grid gap-5 rounded-2xl border bg-background p-4 transition hover:border-brand/30 hover:shadow-lg sm:grid-cols-[5.5rem_1fr_auto_auto] sm:items-center sm:p-5"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <Image
          src={opportunity.image}
          alt={opportunity.alt}
          fill
          sizes="88px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div>
        <div>
          <span className="inline-flex rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
            Completed
          </span>

          <h2 className="mt-3 font-heading text-xl font-semibold">{opportunity.title}</h2>

          <p className="mt-1 text-muted-foreground">
            {ownership.positions} position · {ownership.cycle}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-brand/5 p-3 sm:min-w-44 sm:text-right">
        <p className="text-sm text-muted-foreground">Funds credited</p>

        <p className="mt-1 text-xl font-semibold text-brand">
          {formatNaira(ownership.distribution)}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">{ownership.roi} return achieved</p>
      </div>

      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-brand" />
    </Link>
  );
}

function ActivityFeed(): React.JSX.Element {
  const events = [
    {
      title: 'Cycle distribution',
      detail: 'Palm Oil Supply · Cycle 04',
      amount: '+₦1,125,000',
      icon: Plus,
    },
    {
      title: 'Ownership contribution',
      detail: 'Palm Oil Supply · Cycle 05',
      amount: '−₦15,000,000',
      icon: ArrowRight,
    },
    { title: 'Wallet funding', detail: 'Wallet top-up', amount: '+₦10,000,000', icon: Plus },
  ] as const;
  return (
    <section className="rounded-2xl border bg-background p-5 sm:p-6">
      {events.map(({ title, detail, amount, icon: Icon }, index) => (
        <div key={title} className={cn('flex items-center gap-4 py-4', index > 0 && 'border-t')}>
          <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </div>
          <p className={cn('font-semibold', amount.startsWith('+') && 'text-brand')}>{amount}</p>
        </div>
      ))}
    </section>
  );
}

export function OwnershipDashboard(): React.JSX.Element {
  const [tab, setTab] = useState<OwnershipTab>('active');
  const active = ownedOpportunities.filter((item) => item.status === 'active');
  const completed = ownedOpportunities.filter((item) => item.status === 'completed');
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          My ownership
        </h1>
        <p className="mt-2 text-muted-foreground">
          Follow every active position, distribution, and completed cycle.
        </p>
      </header>
      <section className="mt-8 rounded-3xl bg-gradient-to-br from-brand to-emerald-950 p-6 text-brand-foreground sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-foreground/70">
          Total active ownership
        </p>
        <p className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {formatNaira(ownershipTotal)}
        </p>
        <p className="mt-2 text-brand-foreground/75">Across {active.length} real businesses</p>
      </section>
      <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              tab === value
                ? 'bg-brand text-brand-foreground'
                : 'bg-surface text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <section className="mt-6">
        {tab === 'active' && (
          <div className="grid gap-4">
            {active.map((ownership) => (
              <ActiveOwnershipCard key={ownership.id} ownership={ownership} />
            ))}
          </div>
        )}
        {tab === 'completed' && (
          <div className="grid gap-4">
            {completed.map((ownership) => (
              <CompletedOwnershipCard key={ownership.id} ownership={ownership} />
            ))}
          </div>
        )}
        {tab === 'activity' && <ActivityFeed />}
      </section>
    </div>
  );
}
