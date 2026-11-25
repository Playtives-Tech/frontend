'use client';

import { IconChartPie, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import type { Portfolio } from '@/lib/services/portfolio-service';
import { formatNaira } from './formatters';

type Segment = { label: string; amount: number; color: string };

const labels: Record<Portfolio['allocation'][number]['kind'], string> = {
  CO_OWNERSHIP: 'Co-owned',
  CO_FUNDING: 'Co-funded',
  FULL_OWNERSHIP: 'Full ownership',
  COLLECTIVE: 'Wealth Collective',
};
const colors: Record<Portfolio['allocation'][number]['kind'], string> = {
  CO_OWNERSHIP: '#6ee7b7',
  CO_FUNDING: '#38bdf8',
  FULL_OWNERSHIP: '#a78bfa',
  COLLECTIVE: '#f2b928',
};

export function PortfolioBreakdown({ portfolio, variant = 'default' }: { portfolio: Portfolio; variant?: 'default' | 'home' }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'donut' | 'pie'>('donut');
  const chartsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open]);

  const allocated = portfolio.allocation.reduce((sum, item) => sum + item.amountMinorUnits, 0);
  const remainingProductive = Math.max(0, portfolio.productivePortfolioMinorUnits - allocated);
  const remainingPending = Math.max(0, portfolio.pendingCapitalMinorUnits - portfolio.pendingDeploymentMinorUnits - portfolio.pendingSettlementMinorUnits);
  const allocationAmount = (kind: Portfolio['allocation'][number]['kind']) => portfolio.allocation.find((item) => item.kind === kind)?.amountMinorUnits ?? 0;
  const homeSegments: Segment[] = [
    { label: 'Wallet', amount: portfolio.availableWalletMinorUnits, color: '#19795a' },
    { label: 'Co-owned', amount: allocationAmount('CO_OWNERSHIP'), color: colors.CO_OWNERSHIP },
    { label: 'Co-funded', amount: allocationAmount('CO_FUNDING'), color: colors.CO_FUNDING },
    { label: 'Wealth Collective', amount: allocationAmount('COLLECTIVE'), color: colors.COLLECTIVE },
    ...(allocationAmount('FULL_OWNERSHIP') > 0 ? [{ label: 'Full ownership', amount: allocationAmount('FULL_OWNERSHIP'), color: colors.FULL_OWNERSHIP }] : []),
    ...(remainingProductive > 0 ? [{ label: 'Other productive capital', amount: remainingProductive, color: '#64748b' }] : []),
  ];
  const portfolioSegments: Segment[] = [
    { label: 'Wallet', amount: portfolio.availableWalletMinorUnits, color: '#19795a' },
    ...portfolio.allocation.map((item) => ({ label: labels[item.kind], amount: item.amountMinorUnits, color: colors[item.kind] })),
    { label: 'Other productive capital', amount: remainingProductive, color: '#64748b' },
    { label: 'Awaiting deployment', amount: portfolio.pendingDeploymentMinorUnits, color: '#818cf8' },
    { label: 'Awaiting settlement', amount: portfolio.pendingSettlementMinorUnits, color: '#fb7185' },
    { label: 'Other pending capital', amount: remainingPending, color: '#94a3b8' },
  ].filter((segment) => segment.amount > 0);
  const segments = variant === 'home' ? homeSegments : portfolioSegments;
  const total = segments.reduce((sum, segment) => sum + segment.amount, 0);
  const amount = (minorUnits: number) => formatNaira(minorUnits / 100);
  let angle = 0;
  const gradient = total > 0
    ? `conic-gradient(${segments.map((segment) => {
        const start = angle;
        angle += segment.amount / total * 360;
        return `${segment.color} ${start}deg ${angle}deg`;
      }).join(', ')})`
    : 'conic-gradient(#e5e7eb 0deg 360deg)';

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand/30 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/10 ${variant === 'home' ? 'bg-background' : 'bg-brand/5'}`}>
        <IconChartPie className="size-4" stroke={1.8} aria-hidden="true" /> Portfolio breakdown
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="portfolio-breakdown-title" className="w-full max-w-lg rounded-2xl bg-background p-5 shadow-2xl sm:p-6">
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand">Portfolio value</p>
                <h2 id="portfolio-breakdown-title" className="mt-1 text-base font-semibold">Portfolio breakdown</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close portfolio breakdown" className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"><IconX className="size-4" /></button>
            </header>
            <p className="mt-4 text-center text-xs text-muted-foreground">Swipe to compare your portfolio views</p>
            <div className="mt-2 flex items-center justify-center gap-2" aria-label="Portfolio chart views">
              {(['donut', 'pie'] as const).map((option, index) => (
                <button key={option} type="button" onClick={() => chartsRef.current?.scrollTo({ left: index * chartsRef.current.clientWidth, behavior: 'smooth' })} aria-label={`Show ${option} chart`} aria-current={view === option ? 'true' : undefined} className={`h-2 rounded-full transition-all ${view === option ? 'w-5 bg-brand' : 'w-2 bg-muted-foreground/35 hover:bg-muted-foreground/60'}`} />
              ))}
            </div>
            <div ref={chartsRef} onScroll={(event) => setView(event.currentTarget.scrollLeft >= event.currentTarget.clientWidth / 2 ? 'pie' : 'donut')} className="scrollbar-none mt-5 flex snap-x snap-mandatory overflow-x-auto scroll-smooth">
              <div className="flex w-full shrink-0 snap-center justify-center">
                <div role="img" aria-label="Portfolio value by balance type" className="grid size-44 place-items-center rounded-full p-5 sm:size-48" style={{ background: gradient }}>
                  <div className="flex size-full flex-col items-center justify-center rounded-full bg-background px-2 text-center">
                    <span className="text-[11px] text-muted-foreground">Total balance</span>
                    <strong className="mt-1 max-w-full break-all text-sm tabular-nums sm:text-base">{amount(total)}</strong>
                  </div>
                </div>
              </div>
              <div className="flex w-full shrink-0 snap-center flex-col items-center justify-center">
                <div role="img" aria-label="Portfolio value by balance type" className="size-44 rounded-full sm:size-48" style={{ background: gradient }} />
                <p className="mt-3 text-sm font-semibold tabular-nums">{amount(total)} total</p>
              </div>
            </div>
            <ul className="mt-5 max-h-52 overflow-y-auto rounded-xl border border-border">
              {(segments.length ? segments : [{ label: 'No portfolio balance yet', amount: 0, color: '#e5e7eb' }]).map((segment) => (
                <li key={segment.label} className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs last:border-b-0">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                  <span className="min-w-0 flex-1 truncate">{segment.label}</span>
                  <span className="font-semibold tabular-nums">{amount(segment.amount)}</span>
                  <span className="w-10 text-right tabular-nums text-muted-foreground">{total ? `${(segment.amount / total * 100).toFixed(1)}%` : '0%'}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </>
  );
}
