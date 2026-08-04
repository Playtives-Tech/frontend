'use client';

import { ArrowRight, Fingerprint } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { notify } from '@/lib/notify';
import { useProfileStore } from '@/stores/use-profile-store';
import { useRouter } from 'next/navigation';

export default function NinVerificationPage(): React.JSX.Element {
  const [nin, setNin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setVerification = useProfileStore((state) => state.setVerification);
  const status = useProfileStore((state) => state.verification.nin);
  const router = useRouter();

  async function handleVerify(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (nin.length !== 11) {
      notify.error('NIN must be exactly 11 digits');
      return;
    }

    setIsSubmitting(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    if (nin === '00000000000') {
      notify.error('NIN verification failed. Please check the number and try again.');
      return;
    }

    setVerification('nin');
    notify.success('NIN verified successfully');
    router.back();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      <BackButton label="Verification" />

      <header className="mt-7">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Identity</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">NIN verification</h1>
        <p className="mt-3 text-muted-foreground">
          Verify your National Identification Number (NIN).
        </p>
      </header>

      <section className="mt-8 rounded-2xl border bg-background p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
            <Fingerprint className="size-6" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-semibold">National ID</h2>
            <p className="text-sm text-muted-foreground">
              {status === 'verified' ? 'Your NIN is verified.' : 'Enter your 11-digit NIN.'}
            </p>
          </div>
        </div>

        {status === 'verified' ? (
          <div className="mt-8 rounded-xl bg-emerald-500/10 p-5 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <strong>Verified!</strong> Your National Identification Number is verified.
          </div>
        ) : (
          <form onSubmit={handleVerify} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-medium">
              National Identification Number (NIN)
              <input
                type="text"
                required
                value={nin}
                onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                placeholder="Enter 11-digit NIN"
                className="h-12 rounded-xl border bg-background px-4 tracking-widest outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <p className="text-sm text-muted-foreground">
              We process your NIN securely through an approved verification service. Enter any 11
              digits to simulate success.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify NIN'} <ArrowRight className="size-4" />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
