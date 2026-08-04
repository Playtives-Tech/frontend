'use client';

import { ArrowRight, Phone } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { notify } from '@/lib/notify';
import { useProfileStore } from '@/stores/use-profile-store';
import { useRouter } from 'next/navigation';

export default function PhoneVerificationPage(): React.JSX.Element {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setVerification = useProfileStore((state) => state.setVerification);
  const status = useProfileStore((state) => state.verification.phone);
  const router = useRouter();

  async function handleSendCode(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (phone.length < 10) {
      notify.error('Enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    // Simulate sending OTP
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    notify.success('Code sent successfully');
    setStep('otp');
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (otp.length < 4) {
      notify.error('Enter a valid verification code');
      return;
    }

    setIsSubmitting(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    if (otp === '0000') {
      notify.error('Invalid code. Please try again.');
      return;
    }

    setVerification('phone');
    notify.success('Phone number verified successfully');
    router.back();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      <BackButton label="Verification" />

      <header className="mt-7">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Identity</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Verify phone number</h1>
        <p className="mt-3 text-muted-foreground">
          Secure your account by verifying your primary phone number.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border bg-background p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
            <Phone className="size-6" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-semibold">Phone verification</h2>
            <p className="text-sm text-muted-foreground">
              {status === 'verified'
                ? 'Your phone number is verified.'
                : 'Follow the steps to verify.'}
            </p>
          </div>
        </div>

        {status === 'verified' ? (
          <div className="mt-8 rounded-xl bg-emerald-500/10 p-5 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <strong>Verified!</strong> Your phone number is verified and secure.
          </div>
        ) : step === 'input' ? (
          <form onSubmit={handleSendCode} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-medium">
              Phone number
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234 800 000 0000"
                className="h-12 rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending code...' : 'Send verification code'}{' '}
              <ArrowRight className="size-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-medium">
              Verification code
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                placeholder="Enter 4-6 digit code"
                className="h-12 rounded-xl border bg-background px-4 text-center tracking-[0.5em] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <p className="text-center text-sm text-muted-foreground">
              Enter any 6 digit code (except 000000) to simulate success.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify code'} <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep('input')}
              disabled={isSubmitting}
              className="mt-2 text-sm font-medium text-brand hover:underline"
            >
              Change phone number
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
