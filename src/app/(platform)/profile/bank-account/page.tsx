'use client';

import { CheckCircle2, ChevronDown, Landmark, Search, Trash2 } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { ButtonLoadingContent, LoadingSpinner } from '@/components/ui/loading-indicator';
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
  const [bankQuery, setBankQuery] = useState('');
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [linking, setLinking] = useState(false);
  const [resolved, setResolved] = useState<ResolvedBankAccount | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(bankQuery.trim().toLowerCase()),
  );

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
      setBankQuery('');
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
    <div className="mx-auto max-w-2xl px-5 py-6 sm:px-8 lg:px-10">
      <BackButton label="Account" />
      <h1 className="mt-6 font-sans text-2xl font-semibold">Linked bank accounts</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Add verified Nigerian accounts for withdrawals and payouts.
      </p>

      <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-50 p-3 text-xs leading-5 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
        <strong>Account ownership requirement:</strong> The bank account name must reasonably match
        your Playtives profile, <strong>{user?.name ?? 'your registered name'}</strong>. Accounts
        with a different holder name will not be linked. Apply for a full name change on your
        Account page to correct your credentials.
      </div>

      {error ? (
        <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-xl border bg-background p-4">
        <h2 className="font-sans text-lg font-semibold">Add an account</h2>
        <form onSubmit={verify} className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            Bank
            <span className="relative block">
              <button
                type="button"
                disabled={loading || resolving || linking}
                onClick={() => setBankPickerOpen((open) => !open)}
                className="flex h-10 w-full items-center justify-between rounded-lg border bg-background px-3 text-left text-sm font-normal disabled:opacity-50"
                aria-expanded={bankPickerOpen}
                aria-haspopup="listbox"
              >
                <span className={bankCode ? 'text-foreground' : 'text-muted-foreground'}>
                  {banks.find((bank) => bank.code === bankCode)?.name ?? 'Select your bank'}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
              {bankPickerOpen ? (
                <span className="absolute z-20 mt-1 block w-full overflow-hidden rounded-lg border bg-background p-2 shadow-lg">
                  <span className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={bankQuery}
                      onChange={(event) => setBankQuery(event.target.value)}
                      autoFocus
                      className="h-9 w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm font-normal outline-none focus:border-brand"
                      placeholder="Search banks"
                      aria-label="Search banks"
                    />
                  </span>
                  <span className="mt-2 block max-h-52 overflow-y-auto" role="listbox">
                    {filteredBanks.length ? filteredBanks.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        role="option"
                        aria-selected={bank.code === bankCode}
                        onClick={() => {
                          setBankCode(bank.code);
                          setBankQuery('');
                          setBankPickerOpen(false);
                          setResolved(null);
                          setError(null);
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm font-normal transition hover:bg-muted"
                      >
                        {bank.name}
                      </button>
                    )) : <span className="block px-3 py-4 text-center text-xs font-normal text-muted-foreground">No banks match your search.</span>}
                  </span>
                </span>
              ) : null}
            </span>
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
              className="h-10 w-full min-w-0 max-w-full rounded-lg border bg-background px-3 text-sm"
              placeholder="10-digit account number"
            />
          </label>
          <button
            type="submit"
            disabled={resolving || linking || loading || !bankCode || number.length !== 10}
            className="inline-flex h-10 w-full min-w-0 max-w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-brand-foreground disabled:opacity-40"
          >
            <ButtonLoadingContent
              loading={resolving}
              loadingLabel="Verifying account"
              icon={<CheckCircle2 className="size-4" />}
            >
              Verify account
            </ButtonLoadingContent>
          </button>
        </form>

        {resolved ? (
          <div
            className={`mt-4 rounded-xl border p-4 ${
              resolved.nameMatches
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-red-500/30 bg-red-500/10'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account name returned by the bank
            </p>
            <p className="mt-1.5 text-base font-semibold">{resolved.accountName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {resolved.bankName} · •••• {resolved.accountNumberLast4}
            </p>
            {resolved.nameMatches ? (
              <>
                <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  This account name has a {resolved.nameMatchPercentage}% match with your Playtives
                  profile. Confirm below to link it.
                </p>
                <button
                  type="button"
                  onClick={() => void link()}
                  disabled={linking}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-brand-foreground disabled:opacity-40"
                >
                  <ButtonLoadingContent
                    loading={linking}
                    loadingLabel="Linking account"
                    icon={<CheckCircle2 className="size-4" />}
                  >
                    {resolved.nameMatchPercentage < 85 ? 'Verify anyway' : 'Link this account'}
                  </ButtonLoadingContent>
                </button>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm font-medium text-red-700 dark:text-red-300">
                  This name has a {resolved.nameMatchPercentage}% match with your registered name,
                  {' '}{user?.name}. A minimum 50% match is required to link this account.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  If this is your account, please contact support to review your profile name before
                  trying again.
                </p>
              </>
            )}
          </div>
        ) : null}
      </section>

      <section className="mt-6">
        <h2 className="font-sans text-lg font-semibold">Your accounts</h2>
        <div className="mt-3 grid gap-2">
          {loading ? (
            <p className="inline-flex items-center gap-2 rounded-2xl border p-5 text-sm text-muted-foreground">
              <LoadingSpinner />
              Loading accounts
            </p>
          ) : accounts.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              You have not linked a bank account yet.
            </p>
          ) : (
            accounts.map((account) => (
              <article
                key={account.id}
                className="flex items-center gap-3 rounded-xl border bg-background p-4"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand">
                  <Landmark className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block font-sans text-[14px] font-semibold">
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
                    <LoadingSpinner className="size-4" label="Removing account" />
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
