'use client';

import {
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  PartyPopper,
  Share2,
  WalletCards,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { notify } from '@/lib/notify';
import { getOwnership } from '@/lib/services/ownership-service';
import { getActivityLog, type ActivityLog } from '@/lib/services/wallet-service';

export default function ActivityDetailPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityLog | null>(null);
  const [error, setError] = useState('');
  const [showSharedAmount, setShowSharedAmount] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    void getActivityLog(params.id)
      .then(async (record) => {
        const ownershipId = stringMetadata(record, 'ownershipId');
        if (!stringMetadata(record, 'opportunityTitle') && ownershipId) {
          try {
            const ownership = await getOwnership(ownershipId);
            setActivity({
              ...record,
              metadata: {
                ...record.metadata,
                opportunityTitle: ownership.opportunityId.title,
              },
            });
            return;
          } catch {}
        }
        setActivity(record);
      })
      .catch(() => setError('This activity could not be found.'));
  }, [params.id]);

  const details = useMemo(() => (activity ? getActivityDetails(activity) : null), [activity]);

  const shareCelebration = async () => {
    if (!details) return;
    setIsSharing(true);
    try {
      const blob = await createPayoutSnapshot(details, showSharedAmount);
      const file = new File([blob], `playtives-payout-${activity?._id ?? 'receipt'}.png`, {
        type: 'image/png',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
      notify.success('Receipt downloaded as PNG');
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
      notify.error('The receipt snapshot could not be shared');
    } finally {
      setIsSharing(false);
    }
  };

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
          {details.isPayout ? (
            <section className="mt-6 overflow-hidden rounded-2xl border bg-background text-center">
              <div className="px-5 pb-7 pt-8 sm:px-10 sm:pb-8 sm:pt-9">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <PartyPopper className="size-6" />
                </span>
                <h1 className="mt-4 text-2xl font-bold tracking-tight">Congratulations! 🎉</h1>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                  Your {details.opportunityTitle} payout is in.
                </p>
                {details.amount ? (
                  <p
                    className={`mt-5 text-3xl font-bold transition ${showSharedAmount ? '' : 'select-none blur-md'}`}
                  >
                    {details.amount}
                  </p>
                ) : null}
                <p className="mt-3 text-2xl font-bold text-emerald-600">Payout Successful</p>
                <p className="mt-2 text-sm text-muted-foreground">{details.date}</p>
              </div>
              <div className="flex items-center justify-between gap-4 border-t px-5 py-4 text-left sm:px-10">
                <div>
                  <p className="text-sm font-semibold">Show amount when sharing</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Turn off to blur the payout amount.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showSharedAmount}
                  onClick={() => setShowSharedAmount((value) => !value)}
                  className={`relative h-8 w-14 shrink-0 rounded-full transition ${showSharedAmount ? 'bg-brand' : 'bg-muted-foreground/30'}`}
                >
                  <span
                    className={`absolute top-1 grid size-6 place-items-center rounded-full bg-white text-brand shadow transition ${showSharedAmount ? 'left-7' : 'left-1'}`}
                  >
                    {showSharedAmount ? (
                      <Eye className="size-3.5" />
                    ) : (
                      <EyeOff className="size-3.5" />
                    )}
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={shareCelebration}
                disabled={isSharing}
                className="flex w-full items-center justify-center gap-3 bg-neutral-950 px-5 py-5 text-base font-semibold text-white transition hover:bg-neutral-800"
              >
                <Share2 className="size-5" />
                {isSharing ? 'Preparing receipt…' : 'Share receipt'}
              </button>
            </section>
          ) : (
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
          )}

          {!details.isPayout ? (
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
                {details.balanceBefore ? (
                  <DetailRow label="Balance before" value={details.balanceBefore} />
                ) : null}
                {details.balanceAfter ? (
                  <DetailRow label="Balance after" value={details.balanceAfter} />
                ) : null}
              </dl>
            </section>
          ) : null}

          {/* <section className="mt-4 rounded-2xl border bg-background p-5">
            <div className="flex items-center gap-2">
              <ReceiptText className="size-4 text-brand" />
              <h2 className="font-semibold">What this means</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{details.description}</p>
          </section> */}
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
  const balanceBeforeMinorUnits = numberMetadata(activity, 'balanceBeforeMinorUnits');
  const balanceAfterMinorUnits = numberMetadata(activity, 'balanceAfterMinorUnits');

  return {
    ...presentation,
    amount: amountMinorUnits === null ? null : formatAmount(amountMinorUnits / 100),
    reference,
    balanceBefore:
      balanceBeforeMinorUnits === null ? null : formatAmount(balanceBeforeMinorUnits / 100),
    balanceAfter:
      balanceAfterMinorUnits === null ? null : formatAmount(balanceAfterMinorUnits / 100),
    timestamp: new Intl.DateTimeFormat('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(activity.createdAt)),
    date: new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(activity.createdAt)),
    isPayout: ['OWNERSHIP_RETURN_CREDITED', 'MATURITY_PRINCIPAL_CREDITED'].includes(
      activity.action,
    ),
    opportunityTitle: stringMetadata(activity, 'opportunityTitle') ?? 'opportunity',
    status:
      activity.action.includes('PENDING') || activity.action.includes('REQUESTED')
        ? 'Pending review'
        : 'Approved',
    description: descriptionFor(activity.action),
  };
}

function numberMetadata(activity: ActivityLog, key: string): number | null {
  const value = activity.metadata?.[key];
  return typeof value === 'number' ? value : null;
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
    BVN_VERIFIED: 'BVN verified',
    NIN_VERIFIED: 'NIN verified',
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

async function createPayoutSnapshot(
  details: ReturnType<typeof getActivityDetails>,
  showAmount: boolean,
): Promise<Blob> {
  const width = 1080;
  const height = 1080;
  const logoDataUrl = await fetchImageDataUrl('/playtives-logo-mark.png');
  const opportunityLines = wrapSnapshotText(
    `I just received my payout for ${details.opportunityTitle}.`,
    46,
  );
  const lineMarkup = opportunityLines
    .map(
      (line, index) =>
        `<text x="540" y="${365 + index * 46}" text-anchor="middle" font-size="34" fill="#667085">${escapeSvgText(line)}</text>`,
    )
    .join('');
  const amountY = 365 + opportunityLines.length * 46 + 65;
  const statusY = amountY + 100;
  const dateY = statusY + 66;
  const amountFilter = showAmount ? '' : ' filter="url(#blurAmount)"';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs><filter id="blurAmount"><feGaussianBlur stdDeviation="13" /></filter></defs>
    <rect width="1080" height="1080" fill="#f7faf8" />
    <rect x="80" y="72" width="920" height="936" rx="42" fill="#ffffff" stroke="#d9e2dc" stroke-width="3" />
    <circle cx="540" cy="205" r="62" fill="#e8f6ef" />
    <g transform="translate(492 157) scale(4)" fill="none" stroke="#079c61" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5.8 11.3 2 22l10.7-3.79" />
      <path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01" />
      <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
      <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11-.11.7-.72 1.22-1.43 1.22H17" />
      <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" />
      <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
    </g>
    <text x="540" y="308" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#101828">Congratulations!</text>
    ${lineMarkup}
    <text x="540" y="${amountY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="62" font-weight="700" fill="#101828"${amountFilter}>${escapeSvgText(details.amount ?? '')}</text>
    <text x="540" y="${statusY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#079c61">Payout Successful</text>
    <text x="540" y="${dateY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#667085">${escapeSvgText(details.date)}</text>
    <line x1="80" y1="840" x2="1000" y2="840" stroke="#e4e7ec" stroke-width="3" />
    <image href="${logoDataUrl}" x="424" y="881" width="48" height="51" preserveAspectRatio="xMidYMid meet" />
    <text x="490" y="920" font-family="Arial, sans-serif" font-size="31" font-weight="700" letter-spacing="4" fill="#197b57">PLAYTIVES</text>
    <text x="540" y="968" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#667085">playtives.com</text>
  </svg>`;
  const image = new Image();
  const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Could not render payout snapshot'));
    image.src = svgUrl;
  });
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(image, 0, 0);
  URL.revokeObjectURL(svgUrl);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not create payout snapshot'))),
      'image/png',
    );
  });
}

async function fetchImageDataUrl(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Could not load receipt branding');
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not load receipt branding'));
    reader.readAsDataURL(blob);
  });
}

function wrapSnapshotText(value: string, maximumLength: number): string[] {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (!current || current.length + word.length + 1 > maximumLength) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }
  return lines.slice(0, 3);
}

function escapeSvgText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
