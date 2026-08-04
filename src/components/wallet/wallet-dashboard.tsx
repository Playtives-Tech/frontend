'use client';

import { ArrowDownLeft, ArrowUpRight, ChevronRight, Plus, Package } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
import { formatNaira } from '@/components/ownership/formatters';
import { useProfileStore } from '@/stores/use-profile-store';

const iconByType = {
  Deposit: Plus,
  Withdrawal: ArrowUpRight,
  Distribution: ArrowDownLeft,
  'Ownership contribution': ArrowUpRight,
} as const;

export function WalletDashboard(): React.JSX.Element {
  const balance = useProfileStore((state) => state.balance);
  const accounts = useProfileStore((state) => state.accounts);
  const allActivity = useProfileStore((state) => state.activity);
  const activity = allActivity.slice(0, 3);
  const account = accounts[0];

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <BackButton label="Profile" />
      <header className="mt-7">
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">My Wallet</h1>
      </header>

      <section className="mt-8 rounded-3xl bg-gradient-to-br from-brand to-emerald-950 p-6 text-brand-foreground sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-foreground/70">
          Available balance
        </p>
        <p className="mt-3 font-heading text-4xl font-semibold">{formatNaira(balance)}</p>
        <p className="mt-2 text-brand-foreground/75">
          Available for verified ownership and withdrawal requests.
        </p>

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
            const Icon = iconByType[item.type];
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 rounded-xl py-4 transition ${index > 0 ? 'border-t' : ''}`}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block">{item.type}</strong>
                  <small className="mt-1 block text-muted-foreground">{item.detail}</small>
                </span>
                <strong className={item.amount > 0 ? 'text-brand' : ''}>
                  {item.amount > 0 ? '+' : '−'}
                  {formatNaira(Math.abs(item.amount))}
                </strong>
              </div>
            );
          })}
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
              {account ? `${account.bank} · ${account.number}` : 'Add a bank account'}
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
