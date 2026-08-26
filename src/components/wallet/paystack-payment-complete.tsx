'use client';

import Link from 'next/link';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { verifyPaystackWalletFunding } from '@/lib/services/wallet-service';

type ViewState = 'verifying' | 'credited' | 'pending' | 'failed';

export function PaystackPaymentComplete({ reference }: { reference?: string }): React.JSX.Element {
  const [state, setState] = useState<ViewState>(reference ? 'verifying' : 'failed');
  const [message, setMessage] = useState(
    reference ? 'We are confirming your deposit securely.' : 'No payment reference was provided.',
  );
  const [isRetrying, setIsRetrying] = useState(false);

  const checkPayment = useCallback(async (): Promise<boolean> => {
    if (!reference) return false;
    setIsRetrying(true);
    try {
      const result = await verifyPaystackWalletFunding(reference);
      if (result.credited) {
        setState('credited');
        setMessage('Your deposit has been verified and your wallet has been credited.');
        return true;
      }
      setState('pending');
      setMessage('Your deposit is still being confirmed. We will keep checking for a short time.');
      return false;
    } catch {
      setState('pending');
      setMessage('We could not confirm the deposit yet. You can check it again shortly.');
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, [reference]);

  useEffect(() => {
    if (!reference) return;
    let attempts = 0;
    const check = async () => {
      const credited = await checkPayment();
      attempts += 1;
      if (credited || attempts >= 6) window.clearInterval(interval);
    };
    void check();
    const interval = window.setInterval(() => void check(), 5_000);
    return () => window.clearInterval(interval);
  }, [checkPayment, reference]);

  const Icon = state === 'credited' ? CheckCircle2 : state === 'failed' ? XCircle : Clock3;
  const iconClass = state === 'credited' ? 'text-brand' : state === 'failed' ? 'text-destructive' : 'text-amber-600';
  return (
    <div className="mx-auto max-w-lg px-5 py-6 sm:px-8">
      <BackButton label="Wallet" />
      <section className="mt-8 rounded-2xl border bg-background p-6 text-center shadow-sm">
        <Icon className={`mx-auto size-12 ${iconClass}`} />
        <h1 className="mt-4 font-sans text-xl font-semibold">
          {state === 'credited' ? 'Wallet funded successfully' : state === 'failed' ? 'Payment could not be confirmed' : 'Confirming your payment'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {state !== 'credited' && reference ? (
            <button
              type="button"
              onClick={() => void checkPayment()}
              disabled={isRetrying}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-brand/25 px-5 text-sm font-semibold text-brand transition hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRetrying ? 'Checking deposit…' : 'Check deposit again'}
            </button>
          ) : null}
          <Link href="/wallet" className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground">
            View wallet
          </Link>
        </div>
      </section>
    </div>
  );
}
