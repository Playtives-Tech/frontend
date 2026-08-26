'use client';

import Link from 'next/link';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { verifyPaystackWalletFunding } from '@/lib/services/wallet-service';

type ViewState = 'verifying' | 'credited' | 'pending' | 'failed';

export function PaystackPaymentComplete({ reference }: { reference?: string }): React.JSX.Element {
  const [state, setState] = useState<ViewState>(reference ? 'verifying' : 'failed');
  const [message, setMessage] = useState(
    reference ? 'We are confirming your card payment securely.' : 'No payment reference was provided.',
  );

  useEffect(() => {
    if (!reference) return;
    void verifyPaystackWalletFunding(reference)
      .then((result) => {
        if (result.credited) {
          setState('credited');
          setMessage('Your payment has been verified and your wallet has been credited.');
          return;
        }
        setState('pending');
        setMessage('Your payment is still being confirmed. Your wallet will update once Paystack confirms it.');
      })
      .catch(() => {
        setState('pending');
        setMessage('We are still confirming your payment. Please check your wallet again shortly.');
      });
  }, [reference]);

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
        <Link href="/wallet" className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground">
          View wallet
        </Link>
      </section>
    </div>
  );
}
