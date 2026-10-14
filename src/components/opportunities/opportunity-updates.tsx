'use client';

import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getOpportunityUpdates,
  type OpportunityUpdate,
} from '@/lib/opportunities';

export function OpportunityUpdates({ slug }: { slug: string }) {
  const [updates, setUpdates] = useState<OpportunityUpdate[]>([]);

  useEffect(() => {
    getOpportunityUpdates(slug).then(setUpdates).catch(() => setUpdates([]));
  }, [slug]);

  if (!updates.length) return null;

  return (
    <section className="mt-5 rounded-2xl border border-border/80 bg-background p-4 sm:mt-6 sm:p-6">
      <h2 className="text-base font-bold sm:text-lg">Co-Ownership Updates</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Verified progress from funding close through operations and distributions.
      </p>
      <div className="mt-4 grid gap-3">
        {updates.map((update) => (
          <article key={update._id} className="rounded-xl border bg-muted/35 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                {update.milestone ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
                    {update.milestone}
                  </p>
                ) : null}
                <h3 className="mt-1 text-sm font-bold">{update.title}</h3>
              </div>
              <time className="text-xs text-muted-foreground">
                {new Date(update.publishedAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {update.body}
            </p>
            {update.attachments.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {update.attachments.map((attachment, index) => (
                  <a
                    key={attachment}
                    href={attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border bg-background px-3 py-2 text-xs font-semibold text-brand"
                  >
                    View attachment {index + 1}
                    <ExternalLink className="size-3.5" />
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
