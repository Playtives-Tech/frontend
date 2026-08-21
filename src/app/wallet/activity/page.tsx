'use client';

import { ChevronLeft, ChevronRight, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import {
  getActivityLogPage,
  type ActivityLog,
  type ActivityLogPage,
} from '@/lib/services/wallet-service';

const pageSize = 8;

export default function ActivityPage(): React.JSX.Element {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ActivityLogPage | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    void getActivityLogPage(page, pageSize)
      .then((response) => {
        if (cancelled) return;
        setResult(response);
        if (response.page !== page) setPage(response.page);
      })
      .catch(() => {
        if (!cancelled) setError('We could not load your activity right now.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const logs = result?.items ?? [];
  const totalPages = result?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 sm:px-8 lg:px-10">
      <BackButton label="Wallet" />
      <header className="mt-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-xl font-bold tracking-tight">Wallet activity</h1>
          <p className="mt-1 text-[.7rem] text-muted-foreground">
            {result ? `${result.total} recorded activities` : 'Your recorded activities'}
          </p>
        </div>
      </header>

      {error ? (
        <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <section className="mt-5 overflow-hidden rounded-2xl border bg-background">
        {loading ? (
          <div className="space-y-4 p-4" aria-label="Loading activity">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : logs.length > 0 ? (
          <div className="divide-y px-4">
            {logs.map((log) => (
              <ActivityRow key={log._id} log={log} />
            ))}
          </div>
        ) : !error ? (
          <p className="p-5 text-sm text-muted-foreground">No activity has been recorded yet.</p>
        ) : null}
      </section>

      {result && result.totalPages > 1 ? (
        <nav
          className="mt-4 flex items-center justify-between gap-3"
          aria-label="Activity pagination"
        >
          <button
            type="button"
            disabled={page === 1 || loading}
            onClick={() => setPage((current) => current - 1)}
            className="grid size-9 place-items-center rounded-full border bg-background text-muted-foreground transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span
            className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground"
            aria-live="polite"
          >
            Page {result.page} of {result.totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
            className="grid size-9 place-items-center rounded-full border bg-background text-muted-foreground transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}

function ActivityRow({ log }: Readonly<{ log: ActivityLog }>): React.JSX.Element {
  const amount =
    typeof log.metadata?.amountMinorUnits === 'number' ? log.metadata.amountMinorUnits / 100 : null;

  return (
    <article className="flex items-center gap-3 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
        <WalletCards className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate font-sans text-[.8rem]">
          {formatActivityAction(log.action)}
        </strong>
        <small className="mt-0.5 block font-sans text-[.7rem] text-muted-foreground">
          {new Date(log.createdAt).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </small>
      </span>
      {amount !== null ? (
        <strong className="font-sans text-xs text-brand">
          {new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
          }).format(amount)}
        </strong>
      ) : null}
    </article>
  );
}

function formatActivityAction(action: string): string {
  const labels: Record<string, string> = {
    ACCOUNT_CREATED: 'Account setup completed',
    USER_LOGIN: 'User login completed',
    ADMIN_LOGIN: 'Admin login completed',
    PASSWORD_CHANGED: 'Password update completed',
    BANK_ACCOUNT_LINKED: 'Bank account linked',
    BANK_ACCOUNT_REMOVED: 'Bank account removed',
    WALLET_CREATED: 'Wallet setup completed',
    DEPOSIT_REQUESTED: 'Wallet deposit requested',
    WITHDRAWAL_REQUESTED: 'Wallet withdrawal requested',
    EARNINGS_CREDITED: 'Earnings payment credited',
    PHONE_OTP_SENT: 'Verification code sent',
    PHONE_VERIFIED: 'Phone verification completed',
    OPPORTUNITY_ACQUIRED: 'Opportunity purchase completed',
  };

  const label = labels[action] ?? action.replaceAll('_', ' ').toLowerCase();
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}
