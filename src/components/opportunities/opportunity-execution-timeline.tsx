import { Check, Clock3 } from 'lucide-react';
import type { OpportunityExecutionProgress } from '@/lib/opportunities';

export function OpportunityExecutionTimeline({
  progress,
  compact = false,
}: Readonly<{ progress: OpportunityExecutionProgress; compact?: boolean }>) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border border-brand/20 bg-brand/[0.035] ${compact ? 'p-4' : 'p-4 sm:p-5'}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            Deal progress
          </p>
          <h2 className="mt-1 text-sm font-semibold text-foreground">{progress.label}</h2>
        </div>
        {progress.expectedAt ? (
          <p className="w-fit rounded-full bg-background px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:text-right">
            Next update expected {formatDate(progress.expectedAt)}
          </p>
        ) : null}
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-y-12 sm:gap-y-14">
        {progress.steps.length > 3 ? (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 1000 220"
            preserveAspectRatio="none"
          >
            <path
              d="M 833 18 H 970 Q 990 18 990 38 V 91 Q 990 108 970 108 H 30 Q 10 108 10 128 V 143 Q 10 163 30 163 H 167"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className={progress.steps[3]?.status === 'UPCOMING' ? 'text-border' : 'text-brand'}
            />
          </svg>
        ) : null}
        {progress.steps.map((step, index) => {
          const row = Math.floor(index / 3);
          const rowIndex = index % 3;
          const column = row === 0 ? rowIndex : 2 - rowIndex;
          const nextStep = progress.steps[index + 1];
          return (
            <div
              key={step.stage}
              className="relative flex min-w-0 flex-col items-center px-1 text-center sm:px-3"
              style={{ gridColumn: column + 1, gridRow: row + 1 }}
            >
              {row === 0 && column > 0 ? (
                <span
                  className={`absolute left-0 right-1/2 top-4 h-px ${step.status === 'UPCOMING' ? 'bg-border' : 'bg-brand'}`}
                />
              ) : null}
              {row === 0 && column < 2 ? (
                <span
                  className={`absolute left-1/2 right-0 top-4 h-px ${nextStep?.status === 'UPCOMING' ? 'bg-border' : 'bg-brand'}`}
                />
              ) : null}
              {row === 1 && column < 2 ? (
                <span
                  className={`absolute left-1/2 right-0 top-4 h-px ${step.status === 'UPCOMING' ? 'bg-border' : 'bg-brand'}`}
                />
              ) : null}
              {row === 1 && column > 0 ? (
                <span
                  className={`absolute left-0 right-1/2 top-4 h-px ${nextStep?.status === 'UPCOMING' ? 'bg-border' : 'bg-brand'}`}
                />
              ) : null}
              <span
                className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                  step.status === 'COMPLETED'
                    ? 'border-brand bg-brand text-brand-foreground'
                    : step.status === 'CURRENT'
                      ? 'border-brand bg-background text-brand shadow-[0_0_0_5px_rgb(26_127_91/0.12)]'
                      : 'border-border bg-background text-muted-foreground'
                }`}
                aria-current={step.status === 'CURRENT' ? 'step' : undefined}
              >
                {step.status === 'COMPLETED' ? (
                  <Check className="size-4 stroke-[2.5]" />
                ) : step.status === 'CURRENT' ? (
                  <Clock3 className="size-4 stroke-[2.3]" />
                ) : (
                  <span className="size-2 rounded-full bg-current opacity-50" />
                )}
              </span>
              <span
                className={`mt-3 max-w-[112px] text-[10px] font-semibold leading-4 ${
                  step.status === 'CURRENT'
                    ? 'text-brand'
                    : step.status === 'COMPLETED'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {progress.note ? (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">{progress.note}</p>
      ) : null}
      {progress.stage !== 'DEAL_ACTIVE' && progress.commencementDate ? (
        <p className="mt-5 text-[11px] text-primary font-semibold">
          Scheduled deal start: {formatDate(progress.commencementDate)}
        </p>
      ) : null}
    </section>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
