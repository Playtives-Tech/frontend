import { ArrowRight, Plus, Wallet } from 'lucide-react';
import Link from 'next/link';
import { formatNaira } from '@/components/ownership/formatters';
import { BalanceAmount } from '@/components/ui/balance-amount';

type WalletSummaryCardProps = Readonly<{
  balanceMinorUnits: number | null;
  depositedFundsMinorUnits: number | null;
  investmentReturnsMinorUnits: number | null;
}>;

export function WalletSummaryCard({
  balanceMinorUnits,
  depositedFundsMinorUnits,
  investmentReturnsMinorUnits,
}: WalletSummaryCardProps): React.JSX.Element {
  const balance = balanceMinorUnits === null ? '—' : formatNaira(balanceMinorUnits / 100);
  const depositedFunds =
    depositedFundsMinorUnits === null ? '—' : formatNaira(depositedFundsMinorUnits / 100);
  const investmentReturns =
    investmentReturnsMinorUnits === null ? '—' : formatNaira(investmentReturnsMinorUnits / 100);

  return (
    <section className="h-full rounded-[1.5rem] border border-brand/15 bg-background p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-[14rem]">
          <p className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Wallet balance
          </p>
          <div className="mt-3 text-[clamp(1.65rem,7vw,2.25rem)] font-bold leading-tight tracking-tight text-foreground">
            <BalanceAmount value={balance} toggle className="max-w-full" />
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Funds available for your next ownership.
          </p>
        </div>
        <span className="ml-auto grid size-11 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
          <Wallet className="size-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        </span>
      </div>

      {/* <div className="mt-6 grid grid-cols-2 gap-3 border-t pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Deposited funds</p>
          <p className="mt-1 text-sm font-semibold text-foreground"><BalanceAmount value={depositedFunds} /></p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Investment returns</p>
          <p className="mt-1 text-sm font-semibold text-foreground"><BalanceAmount value={investmentReturns} /></p>
        </div>
      </div> */}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/wallet/deposit"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-3.5 text-sm font-semibold text-brand-foreground transition hover:brightness-110"
        >
          <Plus className="size-4" />
          Quick top up
        </Link>
        <Link
          href="/wallet"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand/20 px-3.5 text-sm font-semibold text-brand transition hover:bg-brand/5"
        >
          View wallet
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
