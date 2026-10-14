import { Check, Clock3 } from 'lucide-react';
import type { OpportunityExecutionProgress } from '@/lib/opportunities';

export function OpportunityExecutionTimeline({
  progress,
  compact = false,
}: Readonly<{ progress: OpportunityExecutionProgress; compact?: boolean }>) {
  const rows = chunk(progress.steps, 3);
  return (
    <section className={`min-w-0 overflow-hidden rounded-2xl border border-brand/20 bg-brand/[0.035] ${compact ? 'p-4' : 'p-4 sm:p-5'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">{progress.assetLifecycle ? 'Activation progress' : 'Deal progress'}</p>
        </div>
        {progress.expectedAt ? <p className="w-fit rounded-full bg-background px-3 py-1.5 text-[11px] font-medium text-muted-foreground">Next update expected {formatDate(progress.expectedAt)}</p> : null}
      </div>

      <div className="mt-5">
        {rows.map((row, rowIndex) => {
          const lineRight = row.length === 2 ? '50%' : '16.66%';
          return (
            <div key={`row-${rowIndex}`} className="relative">
              {row.length > 1 ? <div className="absolute left-[16.66%] top-4 h-px bg-border" style={{ right: lineRight }} aria-hidden="true" /> : null}
              <div className="relative grid grid-cols-3">
                {row.map((step, index) => {
                  return (
                    <div key={step.stage} className="flex min-w-0 flex-col items-center px-1 text-center sm:px-3" style={{ gridColumn: index + 1 }}>
                      <span className={`relative z-10 grid size-8 place-items-center rounded-full border-2 ${step.status === 'COMPLETED' ? 'border-brand bg-brand text-brand-foreground' : step.status === 'CURRENT' ? 'border-brand bg-background text-brand shadow-[0_0_0_5px_rgb(26_127_91/0.12)]' : 'border-border bg-background text-muted-foreground'}`} aria-current={step.status === 'CURRENT' ? 'step' : undefined}>
                        {step.status === 'COMPLETED' ? <Check className="size-4 stroke-[2.5]" /> : step.status === 'CURRENT' ? <Clock3 className="size-4 stroke-[2.3]" /> : <span className="size-2 rounded-full bg-current opacity-50" />}
                      </span>
                      <span className={`mt-3 max-w-[120px] text-[10px] font-semibold leading-4 ${step.status === 'CURRENT' ? 'text-brand' : step.status === 'COMPLETED' ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                      {step.date ? <span className="mt-1 text-[9px] text-muted-foreground">{formatDate(step.date)}</span> : null}
                    </div>
                  );
                })}
              </div>
              {rowIndex < rows.length - 1 ? (
                <svg className="h-14 w-full overflow-visible text-border" viewBox="0 0 100 56" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M83.33 0 V24 H16.67 V56" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>

      {progress.note ? <p className="mt-4 text-xs leading-5 text-muted-foreground">{progress.note}</p> : null}
      {!progress.assetLifecycle && !progress.customStages && progress.stage !== 'DEAL_ACTIVE' && progress.commencementDate ? <p className="mt-5 text-[11px] font-semibold text-primary">Scheduled deal start: {formatDate(progress.commencementDate)}</p> : null}
    </section>
  );
}

function chunk<T>(items: ReadonlyArray<T>, size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) rows.push(items.slice(index, index + size));
  return rows;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}
