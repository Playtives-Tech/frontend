'use client';

import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBalanceVisibilityStore } from '@/stores/use-balance-visibility-store';

type BalanceAmountProps = Readonly<{
  value: string;
  className?: string;
  toggle?: boolean;
}>;

export function BalanceAmount({
  value,
  className,
  toggle = false,
}: BalanceAmountProps): React.JSX.Element {
  const isBalanceVisible = useBalanceVisibilityStore((state) => state.isBalanceVisible);
  const toggleBalanceVisibility = useBalanceVisibilityStore(
    (state) => state.toggleBalanceVisibility,
  );

  return (
    <span className={cn('inline-flex max-w-full flex-wrap items-center gap-2', className)}>
      <span className="order-1 min-w-0 break-all">{isBalanceVisible ? value : '••••••'}</span>
      {toggle ? (
        <button
          type="button"
          onClick={toggleBalanceVisibility}
          className="hover:bg-current/10 focus-visible:ring-current/60 order-2 grid size-9 shrink-0 place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2"
          aria-label={isBalanceVisible ? 'Hide balances' : 'Show balances'}
          title={isBalanceVisible ? 'Hide balances' : 'Show balances'}
        >
          {isBalanceVisible ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
        </button>
      ) : null}
    </span>
  );
}
