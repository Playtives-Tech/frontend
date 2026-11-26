'use client';

import {
  IconArrowRight, IconArrowUpRight, IconBuildingBank,
  IconChartLine, IconPlus, IconWallet,
} from '@tabler/icons-react';
import Link from 'next/link';
import { BalanceAmount } from '@/components/ui/balance-amount';
import { formatNaira } from '@/components/ownership/formatters';
import { useProfileStore } from '@/stores/use-profile-store';
import { useEffect, useState } from 'react';
import { getWallet, type WalletSummary } from '@/lib/services/wallet-service';
import { getPortfolio, type Portfolio } from '@/lib/services/portfolio-service';
import { listBankAccounts } from '@/lib/services/profile-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { trackEvent } from '@/lib/product-analytics';

export function WalletDashboard(): React.JSX.Element {
  const [remoteWallet, setRemoteWallet] = useState<WalletSummary | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioError, setPortfolioError] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const accounts = useProfileStore((state) => state.accounts);
  const setAccounts = useProfileStore((state) => state.setAccounts);
  const isCommunity = useAuthStore((state) => state.user?.memberStatus === 'community');
  useEffect(() => { trackEvent('wallet_viewed'); }, []);
  useEffect(() => {
    void getWallet()
      .then(setRemoteWallet)
      .catch(() => setWalletError('Wallet information could not be loaded.'));
    void getPortfolio()
      .then(setPortfolio)
      .catch(() => setPortfolioError(true));
    if (!isCommunity) {
      void listBankAccounts()
        .then(setAccounts)
        .catch(() => undefined)
    }
  }, [isCommunity, setAccounts]);
  const walletBalance = remoteWallet ? remoteWallet.deposit.availableBalanceMinorUnits / 100 : 0;
  const earningsBalance = remoteWallet ? remoteWallet.earnings.availableBalanceMinorUnits / 100 : 0;
  const balance = walletBalance + earningsBalance;
  const account = accounts[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <header>
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Wallet</h1>
      </header>

      {walletError && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
          {walletError}
        </p>
      )}

      <section className="mt-5 min-w-0 overflow-hidden rounded-2xl border border-brand/15 bg-brand/[0.035] p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Available balance
            </p>
            <div className="mt-1 min-w-0 break-all font-sans text-[clamp(1.65rem,5vw,2.25rem)] font-semibold tracking-tight text-foreground">
              {remoteWallet ? <BalanceAmount value={formatNaira(balance)} toggle /> : '—'}
            </div>
          </div>
          <IconWallet className="size-7 shrink-0 text-brand" stroke={1.7} aria-hidden="true" />
        </div>

        <div className="mt-4 grid gap-3 border-t border-brand/10 pt-4 min-[420px]:grid-cols-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">Deposited funds</p>
            <p className="mt-1 break-all font-sans text-sm font-semibold text-foreground sm:text-base">
              {remoteWallet ? <BalanceAmount value={formatNaira(walletBalance)} /> : '—'}
            </p>
          </div>
          <div className="min-w-0 min-[420px]:border-l min-[420px]:border-brand/10 min-[420px]:pl-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <IconChartLine className="size-4 text-brand" stroke={1.8} aria-hidden="true" />
              <p className="text-[11px] font-medium">Investment returns</p>
            </div>
            <p className="mt-1 break-all font-sans text-sm font-semibold text-foreground sm:text-base">
              {remoteWallet ? <BalanceAmount value={formatNaira(earningsBalance)} /> : '—'}
            </p>
          </div>
        </div>

      </section>

      <section className="mt-5" aria-label="Wallet actions">
        <div className="flex flex-col gap-2 min-[420px]:flex-row">
          {[
            { href: '/wallet/deposit', label: 'Fund wallet', Icon: IconPlus, primary: true },
            ...(!isCommunity ? [{ href: '/wallet/withdraw', label: 'Withdraw funds', Icon: IconArrowUpRight, primary: false }] : []),
          ].map(({ href, label, Icon, primary }) => (
            <Link key={href} href={href} className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition hover:shadow-sm ${primary ? 'border-brand bg-brand text-white hover:bg-brand/90' : 'border-brand/20 bg-background text-brand hover:bg-brand/5'}`}>
              <Icon className="size-5 shrink-0" stroke={1.8} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5" aria-labelledby="money-status-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="money-status-title" className="text-base font-semibold">Portfolio funds</h2>
          </div>
          <Link href="/ownership" className="shrink-0 text-xs font-semibold text-brand hover:underline">View portfolio</Link>
        </div>
        {portfolioError ? (
          <p className="mt-3 rounded-xl border p-4 text-xs text-muted-foreground">Portfolio amounts are unavailable right now.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Pending allocation', amount: portfolio?.pendingDeploymentMinorUnits },
              { label: 'Deployed capital', amount: portfolio?.productivePortfolioMinorUnits },
              { label: 'Pending settlement', amount: portfolio?.pendingSettlementMinorUnits },
            ].map((item) => (
              <div key={item.label} className="min-w-0 rounded-xl border bg-background p-3.5">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="mt-1 break-all text-base font-semibold">{item.amount === undefined ? '—' : <BalanceAmount value={formatNaira(item.amount / 100)} />}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {!isCommunity ? (
        <section className="mt-6 sm:mt-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-sans text-base font-semibold">Withdrawal account</h2>
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
            <IconBuildingBank className="size-6 shrink-0 text-brand" stroke={1.8} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <strong className="block text-[13px]">
                {account ? `${account.bank} · •••• ${account.last4}` : 'Add a bank account'}
              </strong>
              <small className="mt-0.5 block text-[12px] text-muted-foreground">
                {account ? account.name : 'Set up withdrawals'}
              </small>
            </span>
            <IconArrowRight className="size-4 text-muted-foreground" stroke={1.8} />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
