'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  ArrowLeft,
  CheckCheck,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  MailOpen,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  notificationService,
  type MemberNotification,
  type MemberNotificationPage,
} from '@/lib/services/notification-service';
import { queryKeys } from '@/lib/query/query-keys';
import { cn } from '@/lib/utils';
import { notify } from '@/lib/notify';

export default function NotificationsPage(): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState<MemberNotification | null>(null);
  const notifications = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: notificationService.list,
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });

  async function refresh(): Promise<void> {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() }),
    ]);
  }

  async function markAllRead(): Promise<void> {
    const readAt = new Date().toISOString();
    const previous = queryClient.getQueryData<MemberNotificationPage>(
      queryKeys.notifications.list(),
    );
    queryClient.setQueryData<MemberNotificationPage>(queryKeys.notifications.list(), (current) =>
      current
        ? {
            ...current,
            unreadCount: 0,
            items: current.items.map((item) => ({ ...item, readAt: item.readAt ?? readAt })),
          }
        : current,
    );
    queryClient.setQueryData(queryKeys.notifications.unreadCount(), { count: 0 });
    try {
      await notificationService.markAllRead();
      await refresh();
    } catch (error: unknown) {
      if (previous) queryClient.setQueryData(queryKeys.notifications.list(), previous);
      await refresh();
      notify.error(error instanceof Error ? error.message : 'Unable to update notifications');
    }
  }

  async function markRead(notificationId: string): Promise<void> {
    const previous = queryClient.getQueryData<MemberNotificationPage>(
      queryKeys.notifications.list(),
    );
    const item = previous?.items.find((notification) => notification._id === notificationId);
    if (item?.readAt) return;
    const readAt = new Date().toISOString();
    queryClient.setQueryData<MemberNotificationPage>(queryKeys.notifications.list(), (current) =>
      current
        ? {
            ...current,
            unreadCount: Math.max(0, current.unreadCount - 1),
            items: current.items.map((notification) =>
              notification._id === notificationId ? { ...notification, readAt } : notification,
            ),
          }
        : current,
    );
    queryClient.setQueryData<{ count: number }>(
      queryKeys.notifications.unreadCount(),
      (current) => ({ count: Math.max(0, (current?.count ?? previous?.unreadCount ?? 1) - 1) }),
    );
    try {
      await notificationService.markRead(notificationId);
      await refresh();
    } catch (error: unknown) {
      if (previous) queryClient.setQueryData(queryKeys.notifications.list(), previous);
      await refresh();
      notify.error(error instanceof Error ? error.message : 'Unable to mark notification as read');
    }
  }

  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-5xl px-4 py-6 sm:px-7 lg:py-9">
      <button
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-brand"
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push('/');
        }}
        type="button"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Important account, opportunity, and Wealth Collective messages.
          </p>
        </div>
        {(notifications.data?.unreadCount ?? 0) > 0 ? (
          <button
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-brand/25 bg-brand/5 px-3.5 text-sm font-semibold text-brand transition hover:bg-brand/10 sm:self-auto"
            onClick={() => void markAllRead()}
            type="button"
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </button>
        ) : null}
      </header>

      {notifications.isLoading ? (
        <div className="mt-8 grid min-h-64 place-items-center rounded-2xl border bg-background">
          <LoaderCircle className="size-6 animate-spin text-brand" />
        </div>
      ) : notifications.isError ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {notifications.error instanceof Error
            ? notifications.error.message
            : 'Unable to load notifications.'}
        </div>
      ) : notifications.data?.items.length ? (
        <section className="mt-7 overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="border-b bg-muted/25 px-4 py-3 text-xs font-semibold text-muted-foreground sm:px-5">
            {notifications.data.unreadCount} unread · {notifications.data.total} total
          </div>
          <div className="divide-y">
            {notifications.data.items.map((item) => (
              <button
                className={cn(
                  'group flex w-full gap-3 px-4 py-4 text-left transition hover:bg-muted/30 sm:gap-4 sm:px-5',
                  !item.readAt && 'bg-brand/[0.035]',
                )}
                key={item._id}
                onClick={() => {
                  void markRead(item._id);
                  setSelectedNotification({
                    ...item,
                    readAt: item.readAt ?? new Date().toISOString(),
                  });
                }}
                type="button"
              >
                <span
                  className={cn(
                    'relative mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl',
                    item.readAt ? 'bg-muted text-muted-foreground' : 'bg-brand/10 text-brand',
                  )}
                >
                  {item.readAt ? <MailOpen className="size-4.5" /> : <Bell className="size-4.5" />}
                  {!item.readAt ? (
                    <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-brand" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span className="font-semibold text-foreground">{item.title}</span>
                    <time className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </time>
                  </span>
                  <span className="mt-1 block whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {item.message}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                    {item.reason}
                    <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-8 grid min-h-64 place-items-center rounded-2xl border bg-background p-7 text-center shadow-sm">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Bell className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold">You are all caught up</h2>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              New account, opportunity, and Collective updates will appear here.
            </p>
          </div>
        </section>
      )}

      {selectedNotification ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-5"
          onClick={() => setSelectedNotification(null)}
          role="dialog"
        >
          <section
            className="w-full max-w-xl rounded-t-3xl border bg-background p-5 shadow-2xl sm:rounded-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <Bell className="size-5" />
              </span>
              <button
                aria-label="Close notification"
                className="grid size-9 place-items-center rounded-full border text-muted-foreground transition hover:bg-muted"
                onClick={() => setSelectedNotification(null)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              {selectedNotification.reason}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {selectedNotification.title}
            </h2>
            <time className="mt-2 block text-xs text-muted-foreground">
              {formatDate(selectedNotification.createdAt)}
            </time>
            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
              {selectedNotification.message}
            </p>
            {selectedNotification.actionUrl &&
            selectedNotification.actionUrl !== '/notifications' ? (
              <Link
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90"
                href={selectedNotification.actionUrl}
                prefetch={false}
              >
                Open related page
                <ExternalLink className="size-4" />
              </Link>
            ) : (
              <button
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-brand/25 bg-brand/5 px-4 text-sm font-semibold text-brand"
                onClick={() => setSelectedNotification(null)}
                type="button"
              >
                Done
              </button>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
