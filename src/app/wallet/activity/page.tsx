'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getActivityLogs, type ActivityLog } from '@/lib/services/wallet-service';

function formatAction(action: string): string {
  return action
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function ActivityPage(): React.JSX.Element {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void getActivityLogs()
      .then(setLogs)
      .catch(() => setError('We could not load your activity right now.'));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/wallet" className="rounded-lg border px-3 py-2 text-sm font-semibold">
        ← Back to wallet
      </Link>
      <h1 className="mt-8 font-heading text-3xl font-semibold">Wallet activity</h1>
      {error ? <p className="text-destructive mt-6 text-sm">{error}</p> : null}
      <div className="mt-6 space-y-3">
        {logs.map((log) => (
          <article key={log._id} className="rounded-2xl border bg-background p-5">
            <p className="font-semibold">{formatAction(log.action)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {log.subjectType} · {new Date(log.createdAt).toLocaleString()}
            </p>
            {typeof log.metadata?.amountMinorUnits === 'number' ? (
              <p className="mt-2 font-semibold text-brand">
                ₦{(log.metadata.amountMinorUnits / 100).toLocaleString('en-NG')}
              </p>
            ) : null}
          </article>
        ))}
        {!error && logs.length === 0 ? (
          <p className="rounded-2xl border bg-background p-5 text-sm text-muted-foreground">
            No activity has been recorded yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
