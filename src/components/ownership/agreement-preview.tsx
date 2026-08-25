'use client';

import { Check, Download, FileText, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export function AgreementPreview({
  agreement,
  version = '1.0',
  effectiveDate,
  resourceUrl,
  accepted,
  onAccept,
}: Readonly<{
  agreement: string;
  version?: string;
  effectiveDate?: string | null;
  resourceUrl?: string;
  accepted?: boolean;
  onAccept?: () => void;
}>): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const preview = useMemo(
    () =>
      agreement
        .split(/\r?\n/)
        .map((line) => line.replace(/^\s{0,3}(#{1,6}\s+|[-*+]\s+|\d+\.\s+)/, '').trim())
        .filter(Boolean)
        .slice(0, 5),
    [agreement],
  );

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[16px] font-semibold tracking-tight">Opportunity agreement</h2>
        <div className="flex shrink-0 items-center gap-3">
          {accepted ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand"><Check className="size-3.5" /> Accepted</span> : null}
          <button type="button" onClick={() => setIsOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:opacity-75">
            <FileText className="size-4" /> Read full agreement
          </button>
        </div>
      </div>
      <div className="mt-2 border-l-2 border-brand/25 pl-3 text-sm leading-6 text-muted-foreground">
        {preview.map((line, index) => (
          <p key={`${line}-${index}`} className="line-clamp-1">
            {line}
          </p>
        ))}
      </div>
      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Opportunity agreement"
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
        >
          <article className="flex h-[min(82vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-background">
            <header className="flex shrink-0 items-center justify-between border-b px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Before you continue</p>
                <h2 className="mt-1 text-lg font-semibold">Opportunity agreement</h2>
                <p className="mt-1 text-xs text-muted-foreground">Version {version}{effectiveDate ? ` · Effective ${new Date(effectiveDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-9 place-items-center rounded-lg border text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close agreement"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
              <MarkdownContent markdown={agreement} />
            </div>
            <footer className="flex shrink-0 items-center justify-between gap-3 border-t px-5 py-3 sm:px-6">
              {resourceUrl ? <a href={resourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:opacity-75"><Download className="size-4" /> Download copy</a> : <span />}
              <button
                type="button"
                onClick={() => { onAccept?.(); setIsOpen(false); }}
                className="h-10 rounded-lg bg-brand px-4 text-xs font-semibold text-brand-foreground transition hover:brightness-110"
              >
                {accepted ? 'Agreement accepted' : 'I agree to this agreement'}
              </button>
            </footer>
          </article>
        </div>
      ) : null}
    </section>
  );
}

function MarkdownContent({ markdown }: Readonly<{ markdown: string }>): React.JSX.Element {
  return (
    <div className="space-y-3 text-sm leading-7 text-muted-foreground">
      {markdown.split(/\r?\n/).map((line, index) => {
        const value = line.trim();
        if (!value) return <div key={`space-${index}`} className="h-2" />;
        const heading = value.match(/^(#{1,3})\s+(.+)$/);
        if (heading) {
          const sizes = { 1: 'text-xl', 2: 'text-lg', 3: 'text-base' } as const;
          const level = heading[1].length as 1 | 2 | 3;
          return (
            <h3 key={`${value}-${index}`} className={`${sizes[level]} pt-2 font-semibold text-foreground`}>
              {inlineMarkdown(heading[2])}
            </h3>
          );
        }
        const bullet = value.match(/^[-*+]\s+(.+)$/);
        if (bullet) {
          return (
            <p key={`${value}-${index}`} className="flex gap-2">
              <span className="mt-3 size-1.5 shrink-0 rounded-full bg-brand" />
              <span>{inlineMarkdown(bullet[1])}</span>
            </p>
          );
        }
        const ordered = value.match(/^(\d+)\.\s+(.+)$/);
        if (ordered) {
          return (
            <p key={`${value}-${index}`} className="flex gap-2">
              <span className="font-semibold text-brand">{ordered[1]}.</span>
              <span>{inlineMarkdown(ordered[2])}</span>
            </p>
          );
        }
        return <p key={`${value}-${index}`}>{inlineMarkdown(value)}</p>;
      })}
    </div>
  );
}

function inlineMarkdown(value: string): React.ReactNode[] {
  return value.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="rounded bg-muted px-1 py-0.5 text-[0.9em] text-foreground">{part.slice(1, -1)}</code>;
    }
    return <span key={index}>{part}</span>;
  });
}
