'use client';

import { ChevronRight, Megaphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  markCollectiveUpdateRead,
  type CollectiveUpdate,
} from '@/lib/services/collectives-service';
import { formatCollectiveDateTime } from './collective-ui';

export function CollectiveUpdates({
  updates,
  limit,
  onRead,
  openUpdateId,
}: Readonly<{
  updates: CollectiveUpdate[];
  limit?: number;
  onRead?: (updateId: string) => void;
  openUpdateId?: string | null;
}>): React.JSX.Element {
  const [selected, setSelected] = useState<CollectiveUpdate | null>(null);
  const [readIds, setReadIds] = useState(
    () => new Set(updates.filter((item) => item.isRead).map((item) => item._id)),
  );
  const newsEntries = updates
    .map((update) => ({ kind: 'news' as const, update }))
    .sort(
      (a, b) => new Date(b.update.publishedAt).getTime() - new Date(a.update.publishedAt).getTime(),
    );
  const visible = limit ? newsEntries.slice(0, limit) : newsEntries;

  const openUpdate = (update: CollectiveUpdate) => {
    setSelected(update);
    if (!readIds.has(update._id)) {
      setReadIds((current) => new Set(current).add(update._id));
      onRead?.(update._id);
      void markCollectiveUpdateRead(update._id).catch(() => undefined);
    }
  };

  useEffect(() => {
    if (!openUpdateId) return;
    const update = updates.find((item) => item._id === openUpdateId);
    if (update) openUpdate(update);
    // Opening from a notification is intentionally handled once per target id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openUpdateId]);

  if (!visible.length)
    return <p className="py-5 text-sm text-muted-foreground">No Collective updates yet.</p>;
  return (
    <>
      <div className="divide-y">
        {visible.map((entry) => (
          <button
            className="group flex w-full items-center gap-3 py-5 text-left"
            key={entry.update._id}
            onClick={() => openUpdate(entry.update)}
            type="button"
          >
            <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <Megaphone className="size-5" />
              {!readIds.has(entry.update._id) ? (
                <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-red-600 ring-2 ring-background" />
              ) : null}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[.9rem] font-semibold">{entry.update.title}</h3>
              <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {plainPreview(entry.update.body)}
              </p>
              <p className="mt-2 text-[.8rem] text-muted-foreground">
                {formatCollectiveDateTime(entry.update.publishedAt)}
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-brand" />
          </button>
        ))}
      </div>
      {selected ? (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/50 sm:place-items-center sm:p-5"
          onClick={() => setSelected(null)}
        >
          <section
            aria-modal="true"
            role="dialog"
            className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-t-3xl border bg-background shadow-2xl sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b p-5">
              <div className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Megaphone className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{selected.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatCollectiveDateTime(selected.publishedAt)}
                  </p>
                </div>
              </div>
              <button
                aria-label="Close update"
                className="grid size-9 place-items-center rounded-full border"
                onClick={() => setSelected(null)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="max-h-[68vh] overflow-y-auto p-5 sm:p-6">
              <UpdateBody update={selected} />
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function plainPreview(value: string): string {
  return value
    .replace(/[#*_>`\[\]()~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function UpdateBody({ update }: { update: CollectiveUpdate }): React.JSX.Element {
  if (update.format !== 'MARKDOWN')
    return (
      <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{update.body}</p>
    );
  return (
    <div className="space-y-3 text-sm leading-7 text-muted-foreground">
      {update.body.split(/\n\s*\n/).map((block, index) => {
        const heading = block.match(/^(#{1,3})\s+(.+)/s);
        if (heading)
          return (
            <h3 className="text-base font-semibold text-foreground" key={index}>
              {inlineMarkdown(heading[2])}
            </h3>
          );
        const lines = block.split('\n');
        if (lines.every((line) => /^[-*]\s+/.test(line)))
          return (
            <ul className="list-disc space-y-1 pl-5" key={index}>
              {lines.map((line) => (
                <li key={line}>{inlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        return (
          <p className="whitespace-pre-wrap" key={index}>
            {inlineMarkdown(block)}
          </p>
        );
      })}
    </div>
  );
}
function inlineMarkdown(value: string): React.ReactNode[] {
  return value
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
    .filter(Boolean)
    .map((part, index) => {
      const bold = part.match(/^\*\*(.+)\*\*$/);
      if (bold)
        return (
          <strong className="font-semibold text-foreground" key={index}>
            {bold[1]}
          </strong>
        );
      const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      if (link)
        return (
          <a
            className="font-semibold text-brand underline"
            href={link[2]}
            key={index}
            rel="noreferrer"
            target="_blank"
          >
            {link[1]}
          </a>
        );
      return <span key={index}>{part}</span>;
    });
}
