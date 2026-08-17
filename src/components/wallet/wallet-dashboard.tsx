'use client';

import { ArrowUpRight, ChevronRight, Package } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
import { formatNaira } from '@/components/ownership/formatters';
import { useProfileStore } from '@/stores/use-profile-store';
import { useEffect, useState } from 'react';
import {
  getActivityLogs,
  getWallet,
  type ActivityLog,
  type WalletSummary,
} from '@/lib/services/wallet-service';
import { listBankAccounts } from '@/lib/services/profile-service';

export function WalletDashboard(): React.JSX.Element {
  const [remoteWallet, setRemoteWallet] = useState<WalletSummary | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [walletError, setWalletError] = useState<string | null>(null);
  const accounts = useProfileStore((state) => state.accounts);
  const setAccounts = useProfileStore((state) => state.setAccounts);
  useEffect(() => {
    void getWallet()
      .then(setRemoteWallet)
      .catch(() => setWalletError('Wallet information could not be loaded.'));
    void getActivityLogs()
      .then((logs) => setActivity(logs.slice(0, 3)))
      .catch(() => undefined);
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
      <header className="mt-7">
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">My Wallet</h1>
      </header>

      {walletError && (
        <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
          {walletError}
        </p>
      )}

      <section className="playtives-gold-card mt-8 rounded-3xl p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-foreground/70">
          Total available balance
        </p>
        <p className="mt-3 font-heading text-4xl font-semibold">{formatNaira(balance)}</p>

        <div className="mt-6 flex flex-col gap-4 border-t border-brand-foreground/20 pt-6 sm:flex-row">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-foreground/70">
              Deposited Funds
            </p>
            <p className="mt-1 font-heading text-xl font-medium">{formatNaira(walletBalance)}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-foreground/70">
              Investment Returns
            </p>
            <p className="mt-1 font-heading text-xl font-medium">{formatNaira(earningsBalance)}</p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link
            href="/wallet/deposit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110"
          >
            Fund wallet
          </Link>

          {/* Redesigned Withdraw button with gradient and icon */}
          <Link
            href="/wallet/withdraw"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 font-semibold text-white transition hover:brightness-110"
          >
            <ArrowUpRight className="size-5" />
            Withdraw funds
          </Link>
        </div>
      </section>

      <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
        <strong>Wallet purpose:</strong> hold funds for verified ownership transactions, receive
        distributions, and request withdrawals.
      </p>

      <section className="mt-9">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Recent activity</h2>
          <Link
            href="/wallet/activity"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border bg-background p-5">
          {activity.map((item, index) => {
            const amount =
              typeof item.metadata?.amountMinorUnits === 'number'
                ? item.metadata.amountMinorUnits / 100
                : null;
            return (
              <div
                key={item._id}
                className={`flex items-center gap-4 rounded-xl py-4 transition ${index > 0 ? 'border-t' : ''}`}
              >
                <span className="min-w-0 flex-1">
                  <strong className="block">{item.action.replaceAll('_', ' ')}</strong>
                  <small className="mt-1 block text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString('en-NG')}
                  </small>
                </span>
                {amount !== null ? <strong>{formatNaira(amount)}</strong> : null}
              </div>
            );
          })}
          {activity.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No wallet activity yet.</p>
          ) : null}
        </div>
      </section>

      <section className="mt-9">
        <h2 className="font-heading text-xl font-semibold">Linked bank accounts</h2>
        <Link
          href="/profile/bank-account"
          className="mt-4 flex items-center gap-4 rounded-2xl border bg-background p-5 transition hover:border-brand/30 hover:shadow-sm"
        >
          <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
            <Package className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block">
              {account ? `${account.bank} · •••• ${account.last4}` : 'Add a bank account'}
            </strong>
            <small className="mt-1 block text-muted-foreground">
              {account ? account.name : 'Set a verified withdrawal destination'}
            </small>
          </span>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>
      </section>
    </div>
  );
}
