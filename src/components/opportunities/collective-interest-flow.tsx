'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, Pencil, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { notify } from '@/lib/notify';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  opportunityInterestService,
  type InterestProgress,
  type RecentInterestActivity,
  type Opportunity,
  type OpportunityInterest,
} from '@/lib/opportunities';

const readiness = [
  { value: 'available_now', label: 'Yes I have the capital ready now' },
  { value: 'within_7_days', label: 'I can have it ready within 7 days if funding opens' },
  { value: 'not_sure', label: 'Not sure yet, I want to learn more first' },
] as const;
const acknowledgementFallback =
  'I understand this is an expression of interest only. No payment is required now, and submitting this does not mean that my position has been funded.';

export function OpportunityInterestFlow({
  opportunity,
}: Readonly<{ opportunity: Opportunity }>): React.JSX.Element {
  const [progress, setProgress] = useState<InterestProgress | null>(null);
  const [interest, setInterest] = useState<OpportunityInterest | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentInterestActivity[]>([]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [editing, setEditing] = useState(false);
  const [about, setAbout] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const refresh = useCallback(() => {
    void opportunityInterestService
      .progress(opportunity.slug)
      .then(setProgress)
      .catch(() =>
        setProgress({
          totalCommitted: 0,
          targetAmount: opportunity.interestTargetAmount ?? 0,
          memberCount: 0,
          totalMonthlyCommitment: 0,
        }),
      );
    void opportunityInterestService
      .mine(opportunity.slug)
      .then(setInterest)
      .catch(() => setInterest(null));
    void opportunityInterestService
      .recent(opportunity.slug)
      .then(setRecentActivity)
      .catch(() => setRecentActivity([]));
  }, [opportunity.interestTargetAmount, opportunity.slug]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const percent = progress?.targetAmount
    ? Math.min(100, (progress.totalCommitted / progress.targetAmount) * 100)
    : 0;
  const removeInterest = () => {
    setRemoving(true);
    void opportunityInterestService
      .remove(opportunity.slug)
      .then(() => {
        setInterest(null);
        setEditing(false);
        setDeleteOpen(false);
        refresh();
        notify.success('Interest removed');
      })
      .catch((error: unknown) =>
        notify.error(error instanceof Error ? error.message : 'Could not remove interest'),
      )
      .finally(() => setRemoving(false));
  };
  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <Link
        href="/discover"
        className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border bg-background px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to opportunities
      </Link>
      <div className="rounded-3xl bg-[#194f39] p-5 text-white shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${opportunity.status === 'INTEREST_OPEN' ? 'bg-amber-300/15 text-amber-300' : 'bg-white/10 text-white/70'}`}
            >
              {opportunity.status === 'INTEREST_OPEN'
                ? 'INTEREST OPEN'
                : 'INTEREST REGISTRATION CLOSED'}
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              {opportunity.title}
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-5 text-white/70">
              {opportunity.summary}
            </p>
          </div>
        </div>
        <OpportunityMetrics opportunity={opportunity} progress={progress} />
      </div>
      <button
        type="button"
        onClick={() => setAbout(true)}
        className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-4 text-sm font-semibold text-brand-foreground transition hover:brightness-110"
      >
        About {opportunity.title}
        <ArrowRight className="size-4" />
      </button>
      {opportunity.showInterestProgress ? (
        <section className="mt-5 rounded-2xl border bg-background p-5 text-foreground">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Interest progress</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Follow the interest registered for this opportunity before its funding stage.
              </p>
            </div>
            <p className="mt-2 text-sm font-semibold text-brand">
              {progress
                ? `${formatNaira(progress.totalCommitted)} of ${formatNaira(progress.targetAmount)} target`
                : 'Loading interest progress…'}
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {progress?.memberCount ?? 0} members have signified interest
          </p>
        </section>
      ) : null}
      {recentActivity.length > 0 ? (
        <RecentInterestActivityList
          items={recentActivity.slice(0, 7)}
          total={recentActivity.length}
          opportunityTitle={opportunity.title}
          onViewAll={() => setShowAllActivity(true)}
        />
      ) : null}
      <section id="interest" className="mt-5">
        {interest && !editing ? (
          <Confirmation
            opportunity={opportunity}
            interest={interest}
            onEdit={() => setEditing(true)}
            onDelete={() => setDeleteOpen(true)}
          />
        ) : opportunity.status === 'INTEREST_OPEN' ? (
          <InterestForm
            opportunity={opportunity}
            existing={interest}
            onSaved={(record) => {
              setInterest(record);
              setEditing(false);
              refresh();
            }}
          />
        ) : (
          <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
            Interest registration is closed. Members who already signified interest will be
            contacted about the next stage.
          </div>
        )}
      </section>
      {about ? (
        <AboutModal
          opportunity={opportunity}
          onClose={() => setAbout(false)}
          onInterest={() => {
            setAbout(false);
            document.getElementById('interest')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      ) : null}
      {showAllActivity ? (
        <AllInterestActivityModal
          items={recentActivity}
          opportunityTitle={opportunity.title}
          onClose={() => setShowAllActivity(false)}
        />
      ) : null}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={removeInterest}
        title="Remove your interest?"
        description="This removes your expression of interest and updates this opportunity's progress. No payment or portfolio position is affected."
        confirmLabel={removing ? 'Removing…' : 'Remove interest'}
      />
    </div>
  );
}

function RecentInterestActivityList({
  items,
  total,
  opportunityTitle,
  onViewAll,
}: Readonly<{
  items: RecentInterestActivity[];
  total: number;
  opportunityTitle: string;
  onViewAll: () => void;
}>): React.JSX.Element {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border bg-background">
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-bold">Recent activities</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Members who recently signified interest.
        </p>
      </div>
      <div className="divide-y">
        {items.map((item) => (
          <ActivityRow key={item.id} item={item} opportunityTitle={opportunityTitle} />
        ))}
      </div>
      {total > items.length ? (
        <button
          type="button"
          onClick={onViewAll}
          className="flex w-full items-center justify-center gap-2 border-t px-5 py-3.5 text-sm font-semibold text-brand transition hover:bg-brand/[.04]"
        >
          View all {total} interested members
          <ArrowRight className="size-4" />
        </button>
      ) : null}
    </section>
  );
}

function AllInterestActivityModal({
  items,
  opportunityTitle,
  onClose,
}: Readonly<{
  items: RecentInterestActivity[];
  opportunityTitle: string;
  onClose: () => void;
}>): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-interest-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border bg-background shadow-xl">
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div>
            <h2 id="all-interest-title" className="text-lg font-bold">
              Interested members
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {items.length} members have signified interest.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close interested members"
            className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[calc(80vh-82px)] divide-y overflow-y-auto">
          {items.map((item) => (
            <ActivityRow key={item.id} item={item} opportunityTitle={opportunityTitle} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ActivityRow({
  item,
  opportunityTitle,
}: Readonly<{ item: RecentInterestActivity; opportunityTitle: string }>): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-[13px] font-bold text-brand">
        {initials(item.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {initials(item.name)} signified interest in {opportunityTitle}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{relativeTime(item.joinedAt)}</p>
      </div>
      <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-bold tracking-wide text-brand">
        INTERESTED
      </span>
    </div>
  );
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
function relativeTime(value: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function Metric({ value, label }: Readonly<{ value: string; label: string }>): React.JSX.Element {
  return (
    <div className="rounded-xl bg-white/10 p-4 text-center">
      <p className="text-lg font-bold text-amber-300">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/65">
        {label}
      </p>
    </div>
  );
}
function OpportunityMetrics({
  opportunity,
  progress,
}: Readonly<{ opportunity: Opportunity; progress: InterestProgress | null }>): React.JSX.Element {
  const metrics = [
    opportunity.interestTargetAmount
      ? { value: formatNaira(opportunity.interestTargetAmount), label: 'Interest target' }
      : null,
    { value: String(progress?.memberCount ?? 0), label: 'Interested members' },
    opportunity.durationValue
      ? {
          value: `${opportunity.durationValue} ${opportunity.durationUnit?.toLowerCase() ?? 'months'}`,
          label: 'Expected duration',
        }
      : null,
    opportunity.location ? { value: opportunity.location, label: 'Location' } : null,
  ].filter((metric): metric is { value: string; label: string } => metric !== null);

  return (
    <div
      className={`mt-8 grid gap-3 ${metrics.length > 2 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'}`}
    >
      {metrics.map((metric) => (
        <Metric key={metric.label} {...metric} />
      ))}
    </div>
  );
}
function Confirmation({
  opportunity,
  interest,
  onEdit,
  onDelete,
}: Readonly<{
  interest: OpportunityInterest;
  opportunity: Opportunity;
  onEdit: () => void;
  onDelete: () => void;
}>): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-brand/25 bg-brand/[.06] p-5">
      <div className="flex items-center gap-2 text-lg font-bold text-brand">
        <CheckCircle2 className="size-5" />
        You’re interested
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        {opportunity.collectOpeningCapital ? (
          <Detail label="Opening capital" value={formatNaira(interest.openingCapital)} />
        ) : null}
        {opportunity.collectRecurringAmount ? (
          <Detail label="Recurring commitment" value={formatNaira(interest.recurringAmount ?? 0)} />
        ) : null}
        {opportunity.collectCapitalReadiness ? (
          <Detail
            label="Capital readiness"
            value={
              readiness.find((item) => item.value === interest.capitalReadiness)?.label ??
              interest.capitalReadiness
            }
          />
        ) : null}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        No payment is required yet. We’ll notify you when this opportunity moves to its next stage.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl border border-brand/30 px-4 py-2 text-sm font-semibold text-brand"
        >
          <Pencil className="size-4" />
          Edit interest
        </button>
        <button
          onClick={onDelete}
          className="text-destructive hover:bg-destructive/10 rounded-xl px-4 py-2 text-sm font-semibold"
        >
          Remove interest
        </button>
      </div>
    </div>
  );
}
function Detail({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
function InterestForm({
  opportunity,
  existing,
  onSaved,
}: Readonly<{
  opportunity: Opportunity;
  existing: OpportunityInterest | null;
  onSaved: (interest: OpportunityInterest) => void;
}>): React.JSX.Element {
  const [openingCapital, setOpeningCapital] = useState(String(existing?.openingCapital ?? ''));
  const [recurringAmount, setRecurringAmount] = useState(String(existing?.recurringAmount ?? ''));
  const [capitalReadiness, setCapitalReadiness] = useState<OpportunityInterest['capitalReadiness']>(
    existing?.capitalReadiness ?? 'available_now',
  );
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      (opportunity.collectOpeningCapital && !openingCapital) ||
      (opportunity.collectRecurringAmount && !recurringAmount) ||
      !accepted
    )
      return notify.error('Complete all fields and acknowledge the interest terms.');
    setSaving(true);
    void opportunityInterestService
      .save(opportunity.slug, {
        openingCapital: opportunity.collectOpeningCapital ? Math.round(Number(openingCapital)) : 0,
        recurringAmount: opportunity.collectRecurringAmount
          ? Math.round(Number(recurringAmount))
          : undefined,
        capitalReadiness,
        acknowledgementVersion: opportunity.interestAcknowledgementVersion,
      })
      .then((record) => {
        notify.success('Interest registered');
        onSaved(record);
      })
      .catch((error: unknown) =>
        notify.error(error instanceof Error ? error.message : 'Could not save interest'),
      )
      .finally(() => setSaving(false));
  };
  return (
    <form onSubmit={submit} className="rounded-2xl border p-5 sm:p-6">
      <h2 className="text-xl font-bold">Signify interest</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This is only an expression of interest. No payment will be taken.
      </p>
      {opportunity.collectOpeningCapital || opportunity.collectRecurringAmount ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {opportunity.collectOpeningCapital ? (
            <MoneyInput
              label="Opening capital, how much you are starting with"
              value={openingCapital}
              onChange={setOpeningCapital}
            />
          ) : null}
          {opportunity.collectRecurringAmount ? (
            <MoneyInput
              label="Recurring commitment"
              value={recurringAmount}
              onChange={setRecurringAmount}
            />
          ) : null}
        </div>
      ) : null}
      {opportunity.collectCapitalReadiness ? (
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Capital readiness</legend>
          <div className="mt-3 grid gap-2">
            {readiness.map((item) => (
              <label key={item.value} className="flex gap-3 rounded-xl border p-3 text-sm">
                <input
                  type="radio"
                  checked={capitalReadiness === item.value}
                  onChange={() => setCapitalReadiness(item.value)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <label className="mt-5 flex gap-3 rounded-xl bg-muted/60 p-3 text-sm leading-6">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
        />
        {opportunity.interestAcknowledgementText || acknowledgementFallback}
      </label>
      <button
        disabled={saving}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground disabled:opacity-60"
      >
        <TrendingUp className="size-4" />
        {saving ? 'Saving interest…' : 'Signify interest'}
      </button>
    </form>
  );
}
function MoneyInput({
  label,
  value,
  onChange,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}>): React.JSX.Element {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <span className="flex items-center rounded-xl border bg-background px-3">
        <span className="text-muted-foreground">₦</span>
        <input
          required
          min="0"
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent px-2 py-3 outline-none"
          placeholder={label.startsWith('Opening') ? 'e.g. 500,000' : 'e.g. 100,000'}
        />
      </span>
    </label>
  );
}
function AboutModal({
  opportunity,
  onClose,
  onInterest,
}: Readonly<{
  opportunity: Opportunity;
  onClose: () => void;
  onInterest: () => void;
}>): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="opportunity-about-title"
        className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="opportunity-about-title" className="text-2xl font-bold">
            About {opportunity.title}
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {opportunity.about || 'More details for this opportunity will be shared soon.'}
        </div>
        <button
          onClick={onInterest}
          className="mt-6 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground"
        >
          Signify interest
        </button>
      </section>
    </div>
  );
}
function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}
