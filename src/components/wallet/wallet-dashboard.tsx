'use client';

import { ArrowUpRight, ChevronRight, Package, Plus, TrendingUp, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { BalanceAmount } from '@/components/ui/balance-amount';
import { formatNaira } from '@/components/ownership/formatters';
import { useProfileStore } from '@/stores/use-profile-store';
import { useEffect, useState } from 'react';
import { getWallet, type WalletSummary } from '@/lib/services/wallet-service';
import { listBankAccounts } from '@/lib/services/profile-service';

export function WalletDashboard(): React.JSX.Element {
  const [remoteWallet, setRemoteWallet] = useState<WalletSummary | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const accounts = useProfileStore((state) => state.accounts);
  const setAccounts = useProfileStore((state) => state.setAccounts);
  useEffect(() => {
    void getWallet()
      .then(setRemoteWallet)
      .catch(() => setWalletError('Wallet information could not be loaded.'));
    void listBankAccounts()
      .then(setAccounts)
      .catch(() => undefined);
  }, [setAccounts]);
  const walletBalance = remoteWallet ? remoteWallet.deposit.availableBalanceMinorUnits / 100 : 0;
  const earningsBalance = remoteWallet ? remoteWallet.earnings.availableBalanceMinorUnits / 100 : 0;
  const balance = walletBalance + earningsBalance;
  const account = accounts[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Your money</p>
        <h1 className="mt-1 font-sans text-xl font-semibold tracking-tight sm:text-2xl">Wallet</h1>
      </header>

      {walletError && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
          {walletError}
        </p>
      )}

      <section className="mt-5 overflow-hidden rounded-2xl border border-brand/15 bg-background p-4 shadow-[0_18px_35px_-30px_rgba(7,82,59,0.35)] sm:mt-6 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand">
              Available balance
            </p>
            <div className="mt-1.5 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              <BalanceAmount value={formatNaira(balance)} toggle />
            </div>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
            <WalletCards className="size-5" />
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 divide-x divide-brand/10 border-t border-brand/10 pt-4">
          <div className="pr-3">
            <p className="text-[11px] font-medium text-muted-foreground">Deposited funds</p>
            <p className="mt-1 font-sans text-base font-semibold text-foreground sm:text-lg">
              <BalanceAmount value={formatNaira(walletBalance)} />
            </p>
          </div>
          <div className="pl-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="size-3.5 text-brand" />
              <p className="text-[11px] font-medium">Investment returns</p>
            </div>
            <p className="mt-1 font-sans text-base font-semibold text-foreground sm:text-lg">
              <BalanceAmount value={formatNaira(earningsBalance)} />
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
          <Link
            href="/wallet/deposit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-brand-foreground transition hover:brightness-110"
          >
            <Plus className="size-4" />
            Deposit funds
          </Link>

          <Link
            href="/wallet/withdraw"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand/20 px-3 text-sm font-semibold text-brand transition hover:bg-brand/5"
          >
            <ArrowUpRight className="size-5" />
            Withdraw funds
          </Link>
        </div>
      </section>

      {/* <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
        <strong>Wallet purpose:</strong> hold funds for verified ownership transactions, receive
        distributions, and request withdrawals.
      </p> */}

      <section className="mt-6 sm:mt-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-sans text-base font-semibold">Withdrawal account</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Where your withdrawals are sent</p>
          </div>
          <Link
            href="/wallet/activity"
            className="text-xs font-semibold text-brand hover:underline"
          >
            Activity
          </Link>
        </div>
        <Link
          href="/profile/bank-account"
          className="mt-3 flex items-center gap-3 rounded-xl border bg-background p-3.5 transition hover:border-brand/30 hover:shadow-sm"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
            <Package className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-[13px]">
              {account ? `${account.bank} · •••• ${account.last4}` : 'Add a bank account'}
            </strong>
            <small className="mt-0.5 block text-[12px] text-muted-foreground">
              {account ? account.name : 'Set a verified withdrawal destination'}
            </small>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </section>
    </div>
  );
}
