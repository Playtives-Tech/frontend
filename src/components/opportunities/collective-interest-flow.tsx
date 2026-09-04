'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, Pencil, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notify } from '@/lib/notify';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  formatOpportunityMoney,
  opportunityInterestService,
  type InterestProgress,
  type RecentInterestActivity,
  type Opportunity,
  type OpportunityInterest,
} from '@/lib/opportunities';

const readiness = [
  { value: 'available_now', label: 'Yes I have the capital ready now' },
  { value: 'within_7_days', label: 'I can have it ready within 7 days of the Collective opening' },
  { value: 'not_sure', label: 'Not sure yet, I want to learn more first' },
] as const;
const acknowledgementFallback =
  'I understand this is an expression of interest only. No payment is required now, and submitting this does not mean that my position has been funded.';

export function CollectiveInterestFlow({
  opportunity,
}: Readonly<{ opportunity: Opportunity }>): React.JSX.Element {
  const [progress, setProgress] = useState<InterestProgress | null>(null);
  const [interest, setInterest] = useState<OpportunityInterest | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentInterestActivity[]>([]);
  const [editing, setEditing] = useState(false);
  const [about, setAbout] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const refresh = () => {
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
  };
  useEffect(() => {
    refresh();
  }, [opportunity.slug]);
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
              {/* {opportunity.title} */}
              The Playtives Wealth Collective
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-5 text-white/70">
              {opportunity.summary}
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          <Metric value="3%+" label="Monthly (min)" />
          <Metric value="42.58%" label="Annual (compounded)" />
          <Metric value="12 mo" label="Duration" />
          <Metric value="Auto" label="Profit reinvested" />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setAbout(true)}
        className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-4 text-sm font-semibold text-brand-foreground transition hover:brightness-110"
      >
        About The Playtives Wealth Collective
        <ArrowRight className="size-4" />
      </button>
      {opportunity.showInterestProgress ? (
        <section className="mt-5 rounded-2xl border bg-background p-5 text-foreground">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Collective opens when we reach ₦100M</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Once ₦100M in committed capital is confirmed ready, the Collective launches. All
                members share the same start and end date.
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
      {recentActivity.length > 0 ? <RecentInterestActivityList items={recentActivity} /> : null}
      <section id="interest" className="mt-5">
        {interest && !editing ? (
          <Confirmation
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
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={removeInterest}
        title="Remove your interest?"
        description="This removes your expression of interest and updates the Collective progress. No payment or portfolio position is affected."
        confirmLabel={removing ? 'Removing…' : 'Remove interest'}
      />
    </div>
  );
}

function RecentInterestActivityList({
  items,
}: Readonly<{ items: RecentInterestActivity[] }>): React.JSX.Element {
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
          <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
            <span className="grid size-10 shrink-0 place-items-center gap-1 rounded-full bg-brand/10 text-[13px] font-bold text-brand">
              {initials(item.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {initials(item.name)} signified interest in The Collective
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{relativeTime(item.joinedAt)}</p>
            </div>
            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-bold tracking-wide text-brand">
              INTERESTED
            </span>
          </div>
        ))}
      </div>
    </section>
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
function Confirmation({
  interest,
  onEdit,
  onDelete,
}: Readonly<{
  interest: OpportunityInterest;
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
        <Detail label="Opening capital" value={formatNaira(interest.openingCapital)} />
        <Detail label="Monthly commitment" value={formatNaira(interest.recurringAmount ?? 0)} />
        <Detail
          label="Capital readiness"
          value={
            readiness.find((item) => item.value === interest.capitalReadiness)?.label ??
            interest.capitalReadiness
          }
        />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        No payment is required yet. We’ll notify you if the Collective moves to funding.
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
    if (!openingCapital || !recurringAmount || !accepted)
      return notify.error('Complete all fields and acknowledge the interest terms.');
    setSaving(true);
    void opportunityInterestService
      .save(opportunity.slug, {
        openingCapital: Math.round(Number(openingCapital)),
        recurringAmount: Math.round(Number(recurringAmount)),
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
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <MoneyInput
          label="Opening capital, how much you are starting with"
          value={openingCapital}
          onChange={setOpeningCapital}
        />
        <MoneyInput
          label="Monthly commitment, how much you will add every month"
          value={recurringAmount}
          onChange={setRecurringAmount}
        />
      </div>
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
        aria-labelledby="collective-about-title"
        className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="collective-about-title" className="text-2xl font-bold">
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
