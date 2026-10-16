'use client';

import { Megaphone, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getCollectiveUpdateStatus,
  type CollectiveUpdate,
} from '@/lib/services/collectives-service';

export function CollectiveUpdateAlert(): React.JSX.Element | null {
  const router = useRouter();
  const [update, setUpdate] = useState<CollectiveUpdate | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      void getCollectiveUpdateStatus()
        .then((result) => {
          if (cancelled || !result.latestUnread) return;
          const dismissed = window.sessionStorage.getItem('dismissed-collective-update');
          if (dismissed !== result.latestUnread._id) setUpdate(result.latestUnread);
        })
        .catch(() => undefined);
    load();
    const timer = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (!update) return null;
  const dismiss = () => {
    window.sessionStorage.setItem('dismissed-collective-update', update._id);
    setUpdate(null);
  };
  return (
    <aside
      className="fixed left-1/2 top-1/2 z-40 w-[calc(100%-2rem)] max-w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-4 shadow-2xl sm:p-5"
      role="status"
    >
      <div className="flex items-start gap-3 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
          <Megaphone className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold uppercase tracking-[0.15em] text-brand">
            Wealth Collective update
          </p>
          <h2 className="mt-1 truncate text-sm font-semibold">{update.title}</h2>
          <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">
            {update.body.replace(/[#*_>`\[\]()~-]/g, '').replace(/\s+/g, ' ')}
          </p>
        </div>
        <button
          aria-label="Dismiss update"
          className="grid size-8 shrink-0 place-items-center rounded-full border"
          onClick={dismiss}
          type="button"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          className="rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground"
          onClick={dismiss}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white"
          onClick={() => {
            dismiss();
            router.push(`/collectives/updates?update=${update._id}`);
          }}
          type="button"
        >
          Read more
        </button>
      </div>
    </aside>
  );
}
