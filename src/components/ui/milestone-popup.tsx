'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { notificationService, type MemberNotification } from '@/lib/services/notification-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { getActivityLogPage, type ActivityLog } from '@/lib/services/wallet-service';

export type Milestone = { id: string; title: string; message: string; actionUrl?: string | null; actionLabel?: string };

const relevant = /deposit|credited|return|rollover|withdraw|ownership|interest|opportunity|update|payout/i;
const storageKey = (userId: string) => `playtives:milestones:${userId}`;
const activityKey = (userId: string) => `playtives:milestone-activities:${userId}`;
const activityMessages: Record<string, { title: string; message: string }> = {
  DEPOSIT_APPROVED: { title: 'Funds added to your wallet', message: 'Your deposit is now available.' },
  ADMIN_DEPOSIT_CREDITED: { title: 'Funds added to your wallet', message: 'Your wallet has been credited.' },
  OWNERSHIP_RETURN_CREDITED: { title: 'Your return is available', message: 'Your earnings are in your wallet.' },
  MATURITY_PRINCIPAL_CREDITED: { title: 'Your capital was returned', message: 'Your capital is in your wallet.' },
  WITHDRAWAL_COMPLETED: { title: 'Withdrawal completed', message: 'Your withdrawal was sent to your linked bank account.' },
};

export function showMilestone(milestone: Milestone): void {
  window.dispatchEvent(new CustomEvent<Milestone>('playtives:milestone', { detail: milestone }));
}

export function MilestonePopup(): React.JSX.Element | null {
  const user = useAuthStore((state) => state.user);
  const [active, setActive] = useState<Milestone | null>(null);
  const [queue, setQueue] = useState<Milestone[]>([]);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let disposed = false;
    const check = async () => {
      try {
        const result = await notificationService.list();
        if (disposed) return;
        const known = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]') as string[];
        const seen = new Set(known);
        const fresh = result.items.filter((item: MemberNotification) => !item.readAt && relevant.test(`${item.reason} ${item.title}`) && !seen.has(item._id));
        if (fresh.length) {
          localStorage.setItem(storageKey(userId), JSON.stringify([...known, ...fresh.map((item) => item._id)].slice(-200)));
          setQueue((current) => [...current, ...fresh.reverse().map((item) => ({ id: item._id, title: item.title, message: item.message, actionUrl: item.actionUrl, actionLabel: 'View details' }))]);
        }
      } catch { /* Notifications remain available on their page. */ }
    };
    const checkActivities = async () => {
      try {
        const result = await getActivityLogPage(1, 25);
        if (disposed) return;
        const prior = localStorage.getItem(activityKey(userId));
        const known = prior ? JSON.parse(prior) as string[] : [];
        const seen = new Set(known);
        const matching = result.items.filter((item: ActivityLog) => activityMessages[item.action]);
        localStorage.setItem(activityKey(userId), JSON.stringify([...known, ...matching.map((item) => item._id)].slice(-200)));
        const recent = matching.filter((item) => !seen.has(item._id) && (item.action === 'ADMIN_DEPOSIT_CREDITED' ? Date.now() - new Date(item.createdAt).getTime() < 24 * 60 * 60_000 : prior !== null || Date.now() - new Date(item.createdAt).getTime() < 5 * 60_000));
        if (recent.length) setQueue((current) => [...current, ...recent.reverse().map((item) => ({ id: item._id, ...activityMessages[item.action], actionUrl: `/wallet/activity/${item._id}`, actionLabel: 'View receipt' }))]);
      } catch { /* Activity history remains available from the wallet. */ }
    };
    void check();
    void checkActivities();
    const interval = window.setInterval(() => { void check(); void checkActivities(); }, 10_000);
    const checkOnReturn = () => { if (document.visibilityState === 'visible') { void check(); void checkActivities(); } };
    document.addEventListener('visibilitychange', checkOnReturn);
    return () => { disposed = true; window.clearInterval(interval); document.removeEventListener('visibilitychange', checkOnReturn); };
  }, [userId]);

  useEffect(() => {
    const onMilestone = (event: Event) => setQueue((current) => [...current, (event as CustomEvent<Milestone>).detail]);
    window.addEventListener('playtives:milestone', onMilestone);
    return () => window.removeEventListener('playtives:milestone', onMilestone);
  }, []);

  useEffect(() => {
    if (!active && queue.length) {
      setActive(queue[0]);
      setQueue((current) => current.slice(1));
    }
  }, [active, queue]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  if (!active) return null;
  const actionUrl = active.actionUrl?.startsWith('/') && !active.actionUrl.startsWith('//') ? active.actionUrl : '/notifications';
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="milestone-title" aria-describedby="milestone-message" className="relative flex max-h-[80vh] w-full max-w-xl flex-col items-center overflow-y-auto rounded-3xl bg-white px-6 py-8 text-center text-slate-900 shadow-2xl sm:px-10 sm:py-10">
      <button type="button" onClick={() => setActive(null)} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="size-5" /></button>
      <div className="mb-5 grid size-40 place-items-center rounded-full bg-emerald-50 text-emerald-700" aria-hidden="true"><Check className="size-20" strokeWidth={2.5} /></div>
      <h2 id="milestone-title" className="font-sans text-xl font-bold sm:text-2xl">{active.title}</h2>
      <p id="milestone-message" className="mt-3 max-w-md text-sm leading-6 text-slate-600">{active.message}</p>
      <div className="mt-auto flex w-full flex-col gap-3 pt-7">
        <Link href={actionUrl} onClick={() => setActive(null)} className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">{active.actionLabel ?? 'View details'}</Link>
        <button type="button" onClick={() => setActive(null)} className="rounded-xl px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Continue</button>
      </div>
    </div>
  </div>;
}
