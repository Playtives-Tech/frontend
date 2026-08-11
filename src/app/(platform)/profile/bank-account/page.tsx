'use client';

import { CheckCircle2, Landmark, Loader2, Trash2 } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { ApiError } from '@/lib/api';
import { notify } from '@/lib/notify';
import {
  linkBankAccount,
  listBankAccounts,
  listNigerianBanks,
  type NigerianBank,
  removeBankAccount,
  resolveBankAccount,
  type ResolvedBankAccount,
} from '@/lib/services/profile-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { type LinkedAccount, useProfileStore } from '@/stores/use-profile-store';

export default function BankAccountPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const accounts = useProfileStore((state) => state.accounts);
  const setAccounts = useProfileStore((state) => state.setAccounts);
  const [banks, setBanks] = useState<NigerianBank[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [linking, setLinking] = useState(false);
  const [resolved, setResolved] = useState<ResolvedBankAccount | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([listNigerianBanks(), listBankAccounts()])
      .then(([bankList, linkedAccounts]) => {
        setBanks(bankList);
        setAccounts(linkedAccounts);
      })
      .catch((reason: unknown) =>
        setError(reason instanceof ApiError ? reason.message : 'Could not load bank accounts.'),
      )
      .finally(() => setLoading(false));
  }, [setAccounts]);

  async function verify(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setResolved(null);
    setResolving(true);
    try {
      setResolved(await resolveBankAccount(bankCode, number));
    } catch (reason: unknown) {
      setError(reason instanceof ApiError ? reason.message : 'Could not verify this account.');
    } finally {
      setResolving(false);
    }
  }

  async function link(): Promise<void> {
    if (!resolved?.nameMatches) return;
    setError(null);
    setLinking(true);
    try {
      const account = await linkBankAccount(bankCode, number);
      setAccounts([account, ...accounts]);
      setNumber('');
      setBankCode('');
      setResolved(null);
      notify.success('Bank account verified and linked');
    } catch (reason: unknown) {
      setError(reason instanceof ApiError ? reason.message : 'Could not link this account.');
    } finally {
      setLinking(false);
    }
  }

  async function remove(account: LinkedAccount): Promise<void> {
    setRemovingId(account.id);
    setError(null);
    try {
      const response = await removeBankAccount(account.id);
      setAccounts(accounts.filter((item) => item.id !== account.id));
      notify.info(response.message);
    } catch (reason: unknown) {
      setError(reason instanceof ApiError ? reason.message : 'Could not remove this account.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      <BackButton label="Profile" />
      <h1 className="mt-8 font-heading text-3xl font-semibold">Linked bank accounts</h1>
      <p className="mt-3 text-muted-foreground">
        Add verified Nigerian accounts for withdrawals and payouts.
      </p>

      <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
        <strong>Account ownership requirement:</strong> The bank account must be registered in the
        same name as your Playtives profile, <strong>{user?.name ?? 'your registered name'}</strong>
        . Accounts with a different holder name will not be linked.
      </div>

      {error ? (
        <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <section className="mt-7 rounded-2xl border bg-background p-6">
        <h2 className="font-heading text-xl font-semibold">Add an account</h2>
        <form onSubmit={verify} className="mt-5 grid gap-5">
          <label className="grid gap-2 text-sm font-semibold">
            Bank
            <select
              required
              value={bankCode}
              onChange={(event) => {
                setBankCode(event.target.value);
                setResolved(null);
                setError(null);
              }}
              disabled={loading || resolving || linking}
              className="h-12 rounded-xl border bg-background px-4"
            >
              <option value="">Select your bank</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Account number
            <input
              required
              value={number}
              onChange={(event) => {
                setNumber(event.target.value.replace(/\D/g, '').slice(0, 10));
                setResolved(null);
                setError(null);
              }}
              inputMode="numeric"
              pattern="\d{10}"
              disabled={resolving || linking}
              className="h-12 rounded-xl border bg-background px-4"
              placeholder="10-digit account number"
            />
          </label>
          <button
            type="submit"
            disabled={resolving || linking || loading || !bankCode || number.length !== 10}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-brand-foreground disabled:opacity-40"
          >
            {resolving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {resolving ? 'Verifying account…' : 'Verify account'}
          </button>
        </form>

        {resolved ? (
          <div
            className={`mt-5 rounded-2xl border p-5 ${
              resolved.nameMatches
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-red-500/30 bg-red-500/10'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account name returned by the bank
            </p>
            <p className="mt-2 text-lg font-semibold">{resolved.accountName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {resolved.bankName} · •••• {resolved.accountNumberLast4}
            </p>
            {resolved.nameMatches ? (
              <>
                <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  This account name matches your Playtives profile. Confirm below to link it.
                </p>
                <button
                  type="button"
                  onClick={() => void link()}
                  disabled={linking}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-brand-foreground disabled:opacity-40"
                >
                  {linking ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  {linking ? 'Linking account…' : 'Link this account'}
                </button>
              </>
            ) : (
              <p className="mt-4 text-sm font-medium text-red-700 dark:text-red-300">
                This name does not match your registered name, {user?.name}. You cannot link this
                account.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-semibold">Your accounts</h2>
        <div className="mt-4 grid gap-3">
          {loading ? (
            <p className="rounded-2xl border p-5 text-sm text-muted-foreground">
              Loading accounts…
            </p>
          ) : accounts.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              You have not linked a bank account yet.
            </p>
          ) : (
            accounts.map((account) => (
              <article
                key={account.id}
                className="flex items-center gap-4 rounded-2xl border bg-background p-5"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Landmark className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block">
                    {account.bank} · •••• {account.last4}
                  </strong>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{account.name}</p>
                </div>
                <button
                  type="button"
                  disabled={removingId === account.id}
                  onClick={() => void remove(account)}
                  aria-label={`Remove ${account.bank} account ending ${account.last4}`}
                  className="grid size-10 place-items-center rounded-xl text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/20"
                >
                  {removingId === account.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
