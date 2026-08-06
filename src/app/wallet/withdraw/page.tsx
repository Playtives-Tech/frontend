'use client';

import { ArrowRight, CheckCircle2, ChevronRight, Landmark } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';
import { formatNaira } from '@/components/ownership/formatters';
import { BackButton } from '@/components/ui/back-button';
import { notify } from '@/lib/notify';
import { type LinkedAccount, useProfileStore } from '@/stores/use-profile-store';
import {
  createWithdrawalRequest,
  getWallet,
  type WalletSummary,
} from '@/lib/services/wallet-service';

type Step = 'select-account' | 'enter-amount' | 'review' | 'result';

export default function WithdrawPage(): React.JSX.Element {
  const [step, setStep] = useState<Step>('select-account');
  const [selectedAccount, setSelectedAccount] = useState<LinkedAccount | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultStatus, setResultStatus] = useState<'success' | 'error' | null>(null);

  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const balance = (wallet?.totalAvailableBalanceMinorUnits ?? 0) / 100;
  const accounts = useProfileStore((state) => state.accounts);
  useEffect(() => {
    void getWallet()
      .then(setWallet)
      .catch(() => undefined);
  }, []);

  const parsedAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;
  const fee = 50; // Fixed fee for example
  const totalDeduction = parsedAmount + fee;

  const handleAccountSelect = (account: LinkedAccount) => {
    setSelectedAccount(account);
    setStep('enter-amount');
  };

  const handleAmountSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (parsedAmount < 1000) {
      notify.error('Minimum withdrawal is ₦1,000');
      return;
    }
    if (totalDeduction > balance) {
      notify.error('Insufficient funds');
      return;
    }
    setStep('review');
  };

  const handleConfirm = async () => {
    if (!selectedAccount) return;
    setIsSubmitting(true);

    try {
      await createWithdrawalRequest({
        amountMinorUnits: totalDeduction * 100,
        bankName: selectedAccount.bank,
        accountNumber: selectedAccount.number,
        accountName: selectedAccount.name,
      });
      const updatedWallet = await getWallet();
      setWallet(updatedWallet);
      setResultStatus('success');
      setStep('result');
    } catch (error: unknown) {
      notify.error(error instanceof Error ? error.message : 'Withdrawal request failed.');
      setResultStatus('error');
      setStep('result');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      {step === 'select-account' && <BackButton label="Wallet" />}
      {step === 'enter-amount' && (
        <button
          onClick={() => setStep('select-account')}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-semibold transition hover:bg-muted"
        >
          ← Back to accounts
        </button>
      )}
      {step === 'review' && (
        <button
          onClick={() => setStep('enter-amount')}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-semibold transition hover:bg-muted"
        >
          ← Edit amount
        </button>
      )}

      <header className="mt-7">
        <h1 className="font-heading text-3xl font-semibold">Withdraw funds</h1>
        <p className="mt-2 text-muted-foreground">
          Transfer money from your wallet to your bank account.
        </p>
      </header>

      {step === 'select-account' && (
        <section className="mt-8">
          <h2 className="font-heading text-xl font-semibold">Select destination</h2>
          <div className="mt-4 grid gap-3">
            {accounts.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center">
                <Landmark className="mx-auto size-8 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">No bank accounts linked</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Link a bank account to withdraw your funds.
                </p>
                <Link
                  href="/profile/bank-account"
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 font-semibold text-brand-foreground"
                >
                  Link bank account
                </Link>
              </div>
            ) : (
              accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleAccountSelect(acc)}
                  className="flex items-center gap-4 rounded-2xl border bg-background p-5 text-left transition hover:border-brand/30 hover:shadow-sm"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Landmark className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block">
                      {acc.bank} · •••• {acc.number.slice(-4)}
                    </strong>
                    <small className="mt-1 block text-muted-foreground">{acc.name}</small>
                  </span>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </section>
      )}

      {step === 'enter-amount' && (
        <section className="mt-8 rounded-2xl border bg-background p-6">
          <form onSubmit={handleAmountSubmit} className="grid gap-6">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Available balance</p>
              <p className="mt-1 font-heading text-2xl font-semibold">{formatNaira(balance)}</p>
            </div>

            <label className="grid gap-2 text-sm font-semibold">
              Amount to withdraw
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold">₦</span>
                <input
                  type="text"
                  required
                  value={amountStr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setAmountStr(val ? parseInt(val, 10).toLocaleString('en-NG') : '');
                  }}
                  className="h-14 w-full rounded-xl border bg-background pl-10 pr-4 text-lg font-semibold outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="0"
                />
              </div>
            </label>

            <button className="h-12 w-full rounded-xl bg-brand font-semibold text-brand-foreground transition hover:brightness-110">
              Continue
            </button>
          </form>
        </section>
      )}

      {step === 'review' && (
        <section className="mt-8 rounded-2xl border bg-background p-6">
          <h2 className="font-heading text-xl font-semibold">Review withdrawal</h2>

          <dl className="mt-6 divide-y border-b border-t text-sm">
            <div className="flex justify-between py-4">
              <dt className="text-muted-foreground">Withdrawal amount</dt>
              <dd className="font-semibold">{formatNaira(parsedAmount)}</dd>
            </div>
            <div className="flex justify-between py-4">
              <dt className="text-muted-foreground">Transaction fee</dt>
              <dd className="font-semibold">{formatNaira(fee)}</dd>
            </div>
            <div className="flex justify-between py-4 text-base">
              <dt className="font-semibold">Total deduction</dt>
              <dd className="font-bold text-brand">{formatNaira(totalDeduction)}</dd>
            </div>
            <div className="flex justify-between py-4">
              <dt className="text-muted-foreground">Destination</dt>
              <dd className="text-right font-semibold">
                {selectedAccount?.bank}
                <br />
                •••• {selectedAccount?.number.slice(-4)}
              </dd>
            </div>
            <div className="flex justify-between py-4">
              <dt className="text-muted-foreground">Estimated arrival</dt>
              <dd className="font-semibold">Within 5 minutes</dd>
            </div>
          </dl>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Confirm withdrawal'}{' '}
            <ArrowRight className="size-4" />
          </button>
        </section>
      )}

      {step === 'result' && (
        <section className="mt-8 text-center">
          {resultStatus === 'success' ? (
            <div className="rounded-3xl border bg-background p-8">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </span>
              <h2 className="mt-5 font-heading text-2xl font-semibold">Withdrawal processing</h2>
              <p className="mt-2 text-muted-foreground">
                Your request to withdraw {formatNaira(parsedAmount)} is being processed and will
                arrive shortly.
              </p>
              <Link
                href="/wallet"
                className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand font-semibold text-brand-foreground"
              >
                Return to wallet
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-950 dark:border-red-900/50 dark:bg-red-950/20">
              <h2 className="font-heading text-2xl font-semibold">Withdrawal failed</h2>
              <p className="mt-2 opacity-80">
                There was an issue processing your request. Please try again.
              </p>
              <button
                onClick={() => setStep('review')}
                className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-xl bg-red-600 font-semibold text-white transition hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
