'use client';

import { ArrowRight, FileCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { notify } from '@/lib/notify';
import { useProfileStore } from '@/stores/use-profile-store';
import { useRouter } from 'next/navigation';

export default function BvnVerificationPage(): React.JSX.Element {
  const [bvn, setBvn] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setVerification = useProfileStore((state) => state.setVerification);
  const status = useProfileStore((state) => state.verification.bvn);
  const router = useRouter();

  async function handleVerify(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (bvn.length !== 11) {
      notify.error('BVN must be exactly 11 digits');
      return;
    }

    setIsSubmitting(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    if (bvn === '00000000000' || fullName.toLowerCase().includes('fail')) {
      notify.error('Details do not match BVN records. Please check and try again.');
      return;
    }

    setVerification('bvn');
    notify.success('BVN verified successfully');
    router.back();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      <BackButton label="Verification" />

      <header className="mt-7">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Identity</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">BVN verification</h1>
        <p className="mt-3 text-muted-foreground">
          Verify your Bank Verification Number (BVN) to enable withdrawals.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border bg-background p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
            <FileCheck className="size-6" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-semibold">Bank details</h2>
            <p className="text-sm text-muted-foreground">
              {status === 'verified'
                ? 'Your BVN is verified.'
                : 'Enter your BVN and matching details.'}
            </p>
          </div>
        </div>

        {status === 'verified' ? (
          <div className="mt-8 rounded-xl bg-emerald-500/10 p-5 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <strong>Verified!</strong> Your Bank Verification Number is verified.
          </div>
        ) : (
          <form onSubmit={handleVerify} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-medium">
              Bank Verification Number (BVN)
              <input
                type="text"
                required
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                placeholder="Enter 11-digit BVN"
                className="h-12 rounded-xl border bg-background px-4 tracking-widest outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Full Name (as it appears on BVN)
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Date of Birth
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <p className="text-sm text-muted-foreground">
              Your details are processed securely. Enter any valid details to simulate success (add
              &quot;fail&quot; to name to simulate mismatch).
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify BVN'} <ArrowRight className="size-4" />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
