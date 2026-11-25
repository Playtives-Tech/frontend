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
import { getParticipationVerification, listBankAccounts } from '@/lib/services/profile-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { trackEvent } from '@/lib/product-analytics';

export function WalletDashboard(): React.JSX.Element {
  const [remoteWallet, setRemoteWallet] = useState<WalletSummary | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioError, setPortfolioError] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [verificationReady, setVerificationReady] = useState<boolean | null>(null);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
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
        .finally(() => setAccountsLoaded(true));
      void getParticipationVerification()
        .then((status) => setVerificationReady(status.canFundWallet))
        .catch(() => undefined);
    }
  }, [isCommunity, setAccounts]);
  const walletBalance = remoteWallet ? remoteWallet.deposit.availableBalanceMinorUnits / 100 : 0;
  const earningsBalance = remoteWallet ? remoteWallet.earnings.availableBalanceMinorUnits / 100 : 0;
  const balance = walletBalance + earningsBalance;
  const account = accounts[0];
  const canWithdraw = remoteWallet?.status === 'active' && verificationReady === true && accountsLoaded && accounts.length > 0 && balance >= 1_200;
  const withdrawalReason = remoteWallet?.status === 'locked'
    ? 'Your Wallet is locked. Withdrawals are unavailable.'
    : verificationReady === false
      ? 'Complete verification before withdrawing.'
      : accountsLoaded && accounts.length === 0
        ? 'Add a bank account before withdrawing.'
        : balance < 1_200
          ? 'You need ₦1,200 available for the ₦1,000 minimum and ₦200 fee.'
          : 'Withdraw available funds to your linked bank account.';

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
              Available Wallet Balance
            </p>
            <div className="mt-1.5 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {remoteWallet ? <BalanceAmount value={formatNaira(balance)} toggle /> : '—'}
            </div>
          </div>
          <IconWallet className="size-7 shrink-0 text-brand" stroke={1.7} aria-hidden="true" />
        </div>

        <div className="mt-5 grid grid-cols-2 divide-x divide-brand/10 border-t border-brand/10 pt-4">
          <div className="pr-3">
            <p className="text-[11px] font-medium text-muted-foreground">Deposited funds</p>
            <p className="mt-1 font-sans text-base font-semibold text-foreground sm:text-lg">
              {remoteWallet ? <BalanceAmount value={formatNaira(walletBalance)} /> : '—'}
            </p>
          </div>
          <div className="pl-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <IconChartLine className="size-4 text-brand" stroke={1.8} aria-hidden="true" />
              <p className="text-[11px] font-medium">Investment returns</p>
            </div>
            <p className="mt-1 font-sans text-base font-semibold text-foreground sm:text-lg">
              {remoteWallet ? <BalanceAmount value={formatNaira(earningsBalance)} /> : '—'}
            </p>
          </div>
        </div>

      </section>

      <section className="mt-5" aria-labelledby="wallet-next-action-title">
        <h2 id="wallet-next-action-title" className="text-base font-semibold">What would you like to do?</h2>
        <div className={`mt-3 grid gap-3 ${isCommunity ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
          <div className="flex flex-col rounded-xl border border-brand/25 bg-brand/5 p-4">
            <IconPlus className="size-6 text-brand" stroke={1.8} aria-hidden="true" />
            <h3 className="mt-3 text-sm font-semibold">Fund Wallet</h3>
            <p className="mt-1 flex-1 text-xs leading-5 text-muted-foreground">{balance > 0 ? 'Add more money to your available balance.' : 'Add money before joining an opportunity.'}</p>
            <Link href="/wallet/deposit" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">Fund Wallet <IconArrowRight className="size-4" stroke={1.8} /></Link>
          </div>
          <div className="flex flex-col rounded-xl border border-brand/25 bg-brand/5 p-4">
            <IconChartLine className="size-6 text-brand" stroke={1.8} aria-hidden="true" />
            <h3 className="mt-3 text-sm font-semibold">Put Money to Work</h3>
            <p className="mt-1 flex-1 text-xs leading-5 text-muted-foreground">{verificationReady === false ? 'Explore opportunities. Verification is required before joining.' : balance > 0 ? 'Explore opportunities for your available Wallet funds.' : 'Explore opportunities, then fund your Wallet when you are ready.'}</p>
            <Link href="/discover" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">Explore opportunities <IconArrowRight className="size-4" stroke={1.8} /></Link>
          </div>
          {!isCommunity && (
            <div className="flex flex-col rounded-xl border p-4">
              <IconArrowUpRight className="size-6 text-foreground" stroke={1.8} aria-hidden="true" />
              <h3 className="mt-3 text-sm font-semibold">Withdraw</h3>
              <p className="mt-1 flex-1 text-xs leading-5 text-muted-foreground">{remoteWallet ? withdrawalReason : 'Check your available balance and withdrawal requirements.'}</p>
              <Link href="/wallet/withdraw" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">{canWithdraw ? 'Withdraw funds' : 'View requirements'} <IconArrowRight className="size-4" stroke={1.8} /></Link>
            </div>
          )}
        </div>
      </section>

      <section className="mt-5" aria-labelledby="money-status-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="money-status-title" className="text-base font-semibold">Where your money is</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Allocated capital is separate from your available Wallet balance.</p>
          </div>
          <Link href="/ownership" className="shrink-0 text-xs font-semibold text-brand hover:underline">View portfolio</Link>
        </div>
        {portfolioError ? (
          <p className="mt-3 rounded-xl border p-4 text-xs text-muted-foreground">Portfolio amounts are unavailable right now.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Pending allocation', amount: portfolio?.pendingDeploymentMinorUnits, description: 'Committed, awaiting deployment' },
              { label: 'Deployed capital', amount: portfolio?.productivePortfolioMinorUnits, description: 'Currently working in opportunities' },
              { label: 'Pending settlement', amount: portfolio?.pendingSettlementMinorUnits, description: 'Awaiting release to your Wallet' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border bg-background p-4">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-lg font-semibold">{item.amount === undefined ? '—' : <BalanceAmount value={formatNaira(item.amount / 100)} />}</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs leading-5 text-muted-foreground">Only available Wallet funds can be requested for withdrawal. Allocated or unsettled capital becomes available after it is released to the Wallet.</p>
      </section>

      {/* <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
        <strong>Wallet purpose:</strong> hold funds for verified ownership transactions, receive
        distributions, and request withdrawals.
      </p> */}

      {!isCommunity ? (
        <section className="mt-6 sm:mt-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-sans text-base font-semibold">Withdrawal account</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Where your withdrawals are sent
              </p>
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
                {account ? account.name : 'Set a verified withdrawal destination'}
              </small>
            </span>
            <IconArrowRight className="size-4 text-muted-foreground" stroke={1.8} />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
