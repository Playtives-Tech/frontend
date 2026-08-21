'use client';

import { ArrowRight, Phone } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { ButtonLoadingContent } from '@/components/ui/loading-indicator';
import { notify } from '@/lib/notify';
import { useProfileStore } from '@/stores/use-profile-store';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import {
  getPhoneVerificationStatus,
  sendPhoneCode,
  verifyPhoneCode,
} from '@/lib/services/profile-service';

export default function PhoneVerificationPage(): React.JSX.Element {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [countryCode] = useState('+234');
  const [localNumber, setLocalNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setVerificationStatus = useProfileStore((state) => state.setVerificationStatus);
  const status = useProfileStore((state) => state.verification.phone);
  const router = useRouter();
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const phone = `${countryCode}${localNumber}`;

  useEffect(() => {
    void getPhoneVerificationStatus()
      .then((result) => {
        setVerificationStatus('phone', result.verified ? 'verified' : 'not-verified');
        setMaskedPhone(result.phone);
      })
      .catch(() => undefined);
  }, [setVerificationStatus]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(
      () => setResendIn((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [resendIn]);

  async function handleSendCode(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!/^[789]\d{9}$/.test(localNumber)) {
      notify.error('Enter the 10 digits after +234, without the leading zero');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendPhoneCode(phone);
      notify.success(result.message);
      setResendIn(result.resendAfterSeconds);
      setStep('otp');
    } catch (error: unknown) {
      notify.error(error instanceof ApiError ? error.message : 'Could not send verification code');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (otp.length < 4) {
      notify.error('Enter a valid verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyPhoneCode(phone, otp);
      setVerificationStatus('phone', 'verified');
      setMaskedPhone(result.phone);
      notify.success(result.message);
      router.back();
    } catch (error: unknown) {
      notify.error(error instanceof ApiError ? error.message : 'Could not verify code');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend(): Promise<void> {
    setIsSubmitting(true);
    try {
      const result = await sendPhoneCode(phone);
      notify.success(result.message);
      setResendIn(result.resendAfterSeconds);
    } catch (error: unknown) {
      notify.error(error instanceof ApiError ? error.message : 'Could not resend code');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      <BackButton label="Verification" />

      <header className="mt-7">
        <h1 className="mt-2 font-sans text-3xl font-semibold">Verify phone number</h1>
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
            <h2 className="font-sans text-xl font-semibold">Phone verification</h2>
            <p className="text-sm text-muted-foreground">
              {status === 'verified'
                ? 'Your phone number is verified.'
                : 'Follow the steps to verify.'}
            </p>
          </div>
        </div>

        {status === 'verified' ? (
          <div className="mt-8 rounded-xl bg-emerald-500/10 p-5 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <strong>Verified!</strong> {maskedPhone ?? 'Your phone number'} is verified and secure.
          </div>
        ) : step === 'input' ? (
          <form onSubmit={handleSendCode} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-medium">
              Phone number
              <div className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
                <div className="relative">
                  <select
                    aria-label="Country"
                    value="NG"
                    disabled={isSubmitting}
                    className="h-12 w-full appearance-none rounded-xl border bg-background px-4 pr-9 font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="NG">🇳🇬 Nigeria</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    ▼
                  </span>
                </div>
                <div className="flex h-12 overflow-hidden rounded-xl border bg-background transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <span className="flex items-center border-r bg-muted/50 px-3 font-semibold text-foreground">
                    {countryCode}
                  </span>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={localNumber}
                    onChange={(event) =>
                      setLocalNumber(event.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    minLength={10}
                    maxLength={10}
                    pattern="[789][0-9]{9}"
                    placeholder="8100000000"
                    aria-describedby="phone-number-hint"
                    className="min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              <ButtonLoadingContent
                loading={isSubmitting}
                loadingLabel="Sending code"
                icon={<ArrowRight className="size-4" />}
              >
                Send verification code
              </ButtonLoadingContent>
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
              Enter the six-digit code sent to <strong>{phone}</strong>. It expires shortly and can
              only be used once.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              <ButtonLoadingContent
                loading={isSubmitting}
                loadingLabel="Verifying code"
                icon={<ArrowRight className="size-4" />}
              >
                Verify code
              </ButtonLoadingContent>
            </button>
            <button
              type="button"
              onClick={() => setStep('input')}
              disabled={isSubmitting}
              className="mt-2 text-sm font-medium text-brand hover:underline"
            >
              Change phone number
            </button>
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={isSubmitting || resendIn > 0}
              className="text-sm font-medium text-brand hover:underline disabled:opacity-50"
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
