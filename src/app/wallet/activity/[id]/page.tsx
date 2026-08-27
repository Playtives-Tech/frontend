'use client';

import { CheckCircle2, Clock3, Copy, ReceiptText, WalletCards } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { notify } from '@/lib/notify';
import { getActivityLog, type ActivityLog } from '@/lib/services/wallet-service';

export default function ActivityDetailPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityLog | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.id) return;
    void getActivityLog(params.id)
      .then(setActivity)
      .catch(() => setError('This activity could not be found.'));
  }, [params.id]);

  const details = useMemo(() => (activity ? getActivityDetails(activity) : null), [activity]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 sm:px-8 lg:px-10">
      <BackButton label="Wallet activity" />

      {error ? (
        <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </p>
      ) : !details ? (
        <div className="mt-6 space-y-4" aria-label="Loading activity details">
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
          <div className="h-52 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : (
        <>
          <section className="mt-6 rounded-2xl border bg-background p-5 text-center sm:p-7">
            <span
              className={`mx-auto grid size-12 place-items-center rounded-full ${details.iconClass}`}
            >
              <WalletCards className="size-5" />
            </span>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Wallet activity
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight">{details.label}</h1>
            {details.amount ? (
              <p className={`mt-3 text-2xl font-bold ${details.amountClass}`}>
                {details.prefix}
                {details.amount}
              </p>
            ) : null}
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <CheckCircle2 className="size-3.5" />
              {details.status}
            </span>
          </section>

          <section className="mt-4 rounded-2xl border bg-background p-5">
            <h2 className="font-semibold">Transaction summary</h2>
            <dl className="mt-4 divide-y border-y text-sm">
              <DetailRow
                label="Date & time"
                value={details.timestamp}
                icon={<Clock3 className="size-4" />}
              />
              {details.reference ? (
                <DetailRow label="Reference" value={details.reference} copyable />
              ) : null}
              <DetailRow label="Activity ID" value={details.activityId} copyable />
            </dl>
          </section>

          <section className="mt-4 rounded-2xl border bg-background p-5">
            <div className="flex items-center gap-2">
              <ReceiptText className="size-4 text-brand" />
              <h2 className="font-semibold">What this means</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{details.description}</p>
          </section>
        </>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
  copyable = false,
}: Readonly<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  copyable?: boolean;
}>): React.JSX.Element {
  const copyValue = () => {
    void navigator.clipboard.writeText(value);
    notify.success(`${label} copied`);
  };

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="flex min-w-0 items-center gap-2 text-right font-medium">
        <span className="break-all">{value}</span>
        {copyable ? (
          <button
            type="button"
            onClick={copyValue}
            className="shrink-0 text-brand"
            aria-label={`Copy ${label}`}
          >
            <Copy className="size-4" />
          </button>
        ) : null}
      </dd>
    </div>
  );
}

function getActivityDetails(activity: ActivityLog) {
  const amountMinorUnits =
    typeof activity.metadata?.amountMinorUnits === 'number'
      ? activity.metadata.amountMinorUnits
      : null;
  const presentation = activityPresentation(activity.action);
  const reference =
    stringMetadata(activity, 'reference') ??
    stringMetadata(activity, 'paymentReference') ??
    stringMetadata(activity, 'paystackReference') ??
    stringMetadata(activity, 'requestId');

  return {
    ...presentation,
    amount: amountMinorUnits === null ? null : formatAmount(amountMinorUnits / 100),
    reference,
    activityId: activity._id,
    timestamp: new Intl.DateTimeFormat('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(activity.createdAt)),
    status:
      activity.action.includes('PENDING') || activity.action.includes('REQUESTED')
        ? 'Pending review'
        : 'Recorded',
    description: descriptionFor(activity.action),
  };
}

function stringMetadata(activity: ActivityLog, key: string): string | null {
  const value = activity.metadata?.[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function descriptionFor(action: string): string {
  if (action === 'WITHDRAWAL_FEE_CHARGED')
    return 'This is the separate transaction fee for a completed cash withdrawal.';
  if (action === 'OPPORTUNITY_ACQUIRED')
    return 'Your wallet was debited after your opportunity ownership was confirmed.';
  if (action === 'WALLET_FUNDED_BY_CARD')
    return 'Your deposit was verified before the balance was added to your wallet.';
  if (action.includes('WITHDRAWAL'))
    return 'Keep this reference for any follow-up regarding this withdrawal.';
  return 'This entry is kept in your wallet history for your records.';
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function activityPresentation(action: string) {
  const incoming = ['DEPOSIT_APPROVED', 'WALLET_FUNDED_BY_CARD', 'EARNINGS_CREDITED'].includes(
    action,
  );
  const outgoing = [
    'WITHDRAWAL_COMPLETED',
    'WITHDRAWAL_FEE_CHARGED',
    'OPPORTUNITY_ACQUIRED',
  ].includes(action);
  const labels: Record<string, string> = {
    DEPOSIT_REQUESTED: 'Cash deposit pending',
    DEPOSIT_APPROVED: 'Cash deposit',
    WALLET_FUNDED_BY_CARD: 'Cash deposit',
    WITHDRAWAL_REQUESTED: 'Cash withdrawal pending',
    WITHDRAWAL_COMPLETED: 'Cash withdrawal',
    WITHDRAWAL_FEE_CHARGED: 'Transaction fee',
    EARNINGS_CREDITED: 'Investment return credited',
    OPPORTUNITY_ACQUIRED: 'Opportunity purchase completed',
  };
  return {
    label: labels[action] ?? action.replaceAll('_', ' ').toLowerCase(),
    prefix: incoming ? '+ ' : outgoing ? '- ' : '',
    iconClass: incoming
      ? 'bg-emerald-500/10 text-emerald-600'
      : outgoing
        ? 'bg-red-500/10 text-red-600'
        : 'bg-brand/10 text-brand',
    amountClass: incoming ? 'text-emerald-600' : outgoing ? 'text-red-600' : 'text-foreground',
  };
}
