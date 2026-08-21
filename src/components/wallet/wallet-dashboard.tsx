'use client';

import { ArrowUpRight, ChevronRight, Package } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
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
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <BackButton label="Profile" />

      {walletError && (
        <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
          {walletError}
        </p>
      )}

      <section className="playtives-gold-card mt-6 rounded-2xl p-5 text-white sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
          Available balance
        </p>
        <div className="mt-2 font-sans text-3xl font-semibold">
          <BalanceAmount value={formatNaira(balance)} toggle />
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-brand-foreground/20 pt-5 sm:flex-row">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-foreground/70">
              Deposited Funds
            </p>
            <p className="mt-1 font-sans text-lg font-medium">
              <BalanceAmount value={formatNaira(walletBalance)} />
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-foreground/70">
              Investment Returns
            </p>
            <p className="mt-1 font-sans text-lg font-medium">
              <BalanceAmount value={formatNaira(earningsBalance)} />
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/wallet/deposit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:brightness-110"
          >
            Fund wallet
          </Link>

          <Link
            href="/wallet/withdraw"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-emerald-600 to-teal-500 px-4 text-sm font-semibold text-white transition hover:brightness-110"
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

      <section className="mt-7">
        <h2 className="font-sans text-[1px] font-semibold">Linked bank accounts</h2>
        <Link
          href="/profile/bank-account"
          className="mt-3 flex items-center gap-3 rounded-xl border bg-background p-4 transition hover:border-brand/30 hover:shadow-sm"
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
