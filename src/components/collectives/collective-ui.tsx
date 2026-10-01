import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function formatCollectiveMoney(amountMinorUnits: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

export function formatCollectiveActivityAmount(item: { type: string; amountMinorUnits: number }): string {
  const amount = formatCollectiveMoney(item.amountMinorUnits);
  if (['SCHEDULED_CYCLE_CONTRIBUTION', 'CYCLE_LOSS_ATTRIBUTED'].includes(item.type)) return `−${amount}`;
  if (['CYCLE_RETURN', 'EARLY_EXIT_SETTLED', 'CYCLE_PROFIT_ATTRIBUTED'].includes(item.type)) return `+${amount}`;
  return amount;
}

export function formatCollectiveDate(value: string): string {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeZone: 'Africa/Lagos' }).format(
    new Date(value),
  );
}

export function formatCollectiveLongDate(value: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Lagos',
  }).format(new Date(value));
}

export function formatCollectiveDeploymentDate(value: string, now = new Date()): string {
  const lagosDay = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Africa/Lagos',
  });
  const formatted = formatCollectiveLongDate(value);
  return lagosDay.format(new Date(value)) === lagosDay.format(now)
    ? `Today (${formatted})`
    : formatted;
}

export function formatCollectiveDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(new Date(value));
}

export function CollectiveDetailLayout({
  title,
  description,
  children,
}: Readonly<{ title: string; description: string; children: ReactNode }>): React.JSX.Element {
  return (
    <main className="w-full min-w-0 px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          href="/collectives"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
        <header>
          {/* <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Playtives Wealth Collective
          </p> */}
          <h1 className="mt-2 text-2xl font-semibold sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
