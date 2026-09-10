'use client';

import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Phone,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { notify } from '@/lib/notify';
import { countryDialCodes, dialCodeForCountry } from '@/lib/country-dial-codes';
import {
  getVerificationSteps,
  sendPhoneCode,
  verifyIdentityNumber,
  verifyPhoneCode,
} from '@/lib/services/profile-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { useProfileStore, type VerificationStatus } from '@/stores/use-profile-store';

type StepId = 'bvn' | 'nin' | 'phone';

const steps: ReadonlyArray<{
  id: StepId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: typeof Fingerprint;
}> = [
  {
    id: 'bvn',
    number: '01',
    title: 'Verify your BVN',
    shortTitle: 'BVN',
    description: 'Confirm your banking identity using your 11-digit Bank Verification Number.',
    icon: Fingerprint,
  },
  {
    id: 'nin',
    number: '02',
    title: 'Verify your NIN',
    shortTitle: 'NIN',
    description:
      'Confirm your national identity using your 11-digit National Identification Number.',
    icon: BadgeCheck,
  },
  {
    id: 'phone',
    number: '03',
    title: 'Verify your phone number',
    shortTitle: 'Phone',
    description:
      'Receive a one-time password to confirm that your registered phone belongs to you.',
    icon: Phone,
  },
];

export function VerificationDashboard(): React.JSX.Element {
  const verification = useProfileStore((state) => state.verification);
  const setVerificationStatus = useProfileStore((state) => state.setVerificationStatus);
  const user = useAuthStore((state) => state.user);
  const [activeStep, setActiveStep] = useState<StepId>('bvn');
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const profileNames = splitProfileName(user?.name);
  const [firstName, setFirstName] = useState(profileNames.firstName);
  const [lastName, setLastName] = useState(profileNames.lastName);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dialCode, setDialCode] = useState(() => dialCodeForCountry(user?.country));
  const [phone, setPhone] = useState(() =>
    nationalNumber(user?.phone, dialCodeForCountry(user?.country)),
  );
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    void useProfileStore.persist.rehydrate();
    void getVerificationSteps()
      .then((status) => {
        setVerificationStatus('bvn', status.bvn.verified ? 'verified' : 'not-verified');
        setVerificationStatus('nin', status.nin.verified ? 'verified' : 'not-verified');
        setVerificationStatus('phone', status.phone.verified ? 'verified' : 'not-verified');
        const next = steps.find((step) => !status[step.id].verified);
        if (next) setActiveStep(next.id);
      })
      .catch((error: unknown) =>
        notify.error(error instanceof Error ? error.message : 'Unable to load verification status'),
      )
      .finally(() => setLoading(false));
  }, [setVerificationStatus]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const completed = useMemo(
    () => steps.filter((step) => verification[step.id] === 'verified').length,
    [verification],
  );
  const progress = (completed / steps.length) * 100;

  function completeStep(step: StepId): void {
    setVerificationStatus(step, 'verified');
    const nextStep = steps[steps.findIndex((item) => item.id === step) + 1];
    if (nextStep) setActiveStep(nextStep.id);
  }

  async function verifyIdentifier(step: 'bvn' | 'nin', value: string): Promise<void> {
    if (!/^\d{11}$/.test(value)) {
      notify.error(`Enter a valid 11-digit ${step.toUpperCase()}`);
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth) {
      notify.error('Enter your first name, last name, and date of birth');
      return;
    }
    setBusy(true);
    try {
      const result = await verifyIdentityNumber(step, {
        number: value,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
      });
      if (!result.verified) {
        notify.error(result.message);
        return;
      }
      completeStep(step);
      if (step === 'bvn') setBvn('');
      else setNin('');
      notify.success(result.message);
    } catch (error: unknown) {
      notify.error(
        error instanceof Error ? error.message : `Unable to verify ${step.toUpperCase()}`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendOtp(): Promise<void> {
    const fullPhone = `${dialCode}${phone.replace(/^0+/, '')}`;
    if (!/^\+[1-9]\d{7,14}$/.test(fullPhone)) {
      notify.error('Enter a valid phone number');
      return;
    }
    setBusy(true);
    try {
      const result = await sendPhoneCode(fullPhone);
      setOtpSent(true);
      setResendIn(result.resendAfterSeconds);
      notify.success(result.message);
    } catch (error: unknown) {
      notify.error(error instanceof Error ? error.message : 'Unable to send verification code');
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(): Promise<void> {
    if (!/^\d{6}$/.test(otp)) {
      notify.error('Enter the 6-digit verification code');
      return;
    }
    setBusy(true);
    try {
      const result = await verifyPhoneCode(`${dialCode}${phone.replace(/^0+/, '')}`, otp);
      completeStep('phone');
      setOtp('');
      notify.success(result.message);
    } catch (error: unknown) {
      notify.error(error instanceof Error ? error.message : 'Unable to verify phone number');
    } finally {
      setBusy(false);
    }
  }

  const currentStep = steps.find((step) => step.id === activeStep) ?? steps[0];
  const CurrentStepIcon = currentStep.icon;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
      <BackButton label="Go back" />

      <header className="mt-7 max-w-2xl">
        <h1 className="mt-4 font-sans text-[1.2rem] font-bold tracking-tight lg:text-[1.6rem]">
          Verify your identity
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          Complete all three checks to protect your account and prepare your Playtives profile for
          verified transactions.
        </p>
      </header>

      <section className="mt-7 overflow-hidden rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Your progress
            </p>
            <p className="mt-1 text-sm font-semibold">{completed} of 3 steps completed</p>
          </div>
          <span className="text-xl font-bold text-brand">{Math.round(progress)}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {steps.map((step) => (
            <StepTab
              key={step.id}
              step={step}
              status={verification[step.id]}
              active={activeStep === step.id}
              onClick={() => setActiveStep(step.id)}
            />
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border bg-background shadow-sm">
        <div className="border-b px-5 py-5 sm:px-7">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
              <CurrentStepIcon className="size-6" />
            </span>
            <div>
              {/* <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                Step {currentStep.number}
              </p> */}
              <h2 className="mt-1 font-sans text-[1rem] font-bold">{currentStep.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {currentStep.description}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading verification status…
            </div>
          ) : verification[activeStep] === 'verified' ? (
            <VerifiedState
              title={`${currentStep.shortTitle} verified`}
              onContinue={() => {
                const next = steps.find((step) => verification[step.id] !== 'verified');
                if (next) setActiveStep(next.id);
              }}
              complete={completed === steps.length}
            />
          ) : activeStep === 'bvn' ? (
            <IdentifierForm
              id="bvn"
              label="Bank Verification Number (BVN)"
              value={bvn}
              onChange={setBvn}
              firstName={firstName}
              lastName={lastName}
              dateOfBirth={dateOfBirth}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onDateOfBirthChange={setDateOfBirth}
              onSubmit={() => verifyIdentifier('bvn', bvn)}
              busy={busy}
            />
          ) : activeStep === 'nin' ? (
            <IdentifierForm
              id="nin"
              label="National Identification Number (NIN)"
              value={nin}
              onChange={setNin}
              firstName={firstName}
              lastName={lastName}
              dateOfBirth={dateOfBirth}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onDateOfBirthChange={setDateOfBirth}
              onSubmit={() => verifyIdentifier('nin', nin)}
              busy={busy}
            />
          ) : (
            <PhoneForm
              phone={phone}
              dialCode={dialCode}
              otp={otp}
              otpSent={otpSent}
              busy={busy}
              onPhoneChange={setPhone}
              onDialCodeChange={(code) => {
                setDialCode(code);
                setOtpSent(false);
                setOtp('');
              }}
              onOtpChange={setOtp}
              onSend={sendOtp}
              onVerify={verifyOtp}
              resendIn={resendIn}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function StepTab({
  step,
  status,
  active,
  onClick,
}: Readonly<{
  step: (typeof steps)[number];
  status: VerificationStatus;
  active: boolean;
  onClick: () => void;
}>): React.JSX.Element {
  const Icon = step.icon;
  const complete = status === 'verified';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-20 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${active ? 'border-brand bg-brand/5' : 'hover:border-brand/30 hover:bg-surface/70'}`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-full ${complete ? 'bg-brand text-white' : active ? 'bg-brand/10 text-brand' : 'bg-surface text-muted-foreground'}`}
      >
        {complete ? <Check className="size-5" /> : <Icon className="size-5" />}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-muted-foreground">
          Step {step.number}
        </span>
        <strong className="mt-0.5 block text-sm">{step.shortTitle}</strong>
      </span>
    </button>
  );
}

function IdentifierForm({
  id,
  label,
  value,
  onChange,
  firstName,
  lastName,
  dateOfBirth,
  onFirstNameChange,
  onLastNameChange,
  onDateOfBirthChange,
  onSubmit,
  busy,
}: Readonly<{
  id: 'bvn' | 'nin';
  label: string;
  value: string;
  onChange: (value: string) => void;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
}>): React.JSX.Element {
  return (
    <form
      className="mx-auto max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${id}-first-name`}
          label="Legal first name"
          value={firstName}
          onChange={onFirstNameChange}
          autoComplete="given-name"
        />
        <TextField
          id={`${id}-last-name`}
          label="Legal last name"
          value={lastName}
          onChange={onLastNameChange}
          autoComplete="family-name"
        />
      </div>
      <label htmlFor={`${id}-dob`} className="mt-4 block text-sm font-semibold">
        Date of birth
      </label>
      <input
        id={`${id}-dob`}
        type="date"
        value={dateOfBirth}
        max={new Date().toISOString().slice(0, 10)}
        onChange={(event) => onDateOfBirthChange(event.target.value)}
        autoComplete="bday"
        className="mt-2 h-14 w-full rounded-xl border bg-background px-4 font-sans text-sm outline-none transition hover:border-brand/40 focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
      <label htmlFor={id} className="mt-4 block text-sm font-semibold">
        {label}
      </label>
      <div className="group relative mt-2">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground transition-colors group-focus-within:text-brand">
          {id === 'bvn' ? <Fingerprint className="size-5" /> : <BadgeCheck className="size-5" />}
        </span>
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 11))}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Enter your 11-digit number"
          className="h-14 w-full rounded-xl border bg-background pl-12 pr-16 font-sans text-sm outline-none transition placeholder:text-muted-foreground/70 hover:border-brand/40 focus:border-brand focus:ring-4 focus:ring-brand/10"
          aria-describedby={`${id}-help`}
        />
        <span className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-muted-foreground">
          {value.length}/11
        </span>
      </div>
      <button
        disabled={busy}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white transition-opacity disabled:opacity-60"
      >
        {busy ? 'Checking details…' : `Verify ${id.toUpperCase()}`}
        {!busy ? <ArrowRight className="size-4" /> : null}
      </button>
    </form>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: Readonly<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}>): React.JSX.Element {
  return (
    <label htmlFor={id} className="block text-sm font-semibold">
      {label}
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="mt-2 h-14 w-full rounded-xl border bg-background px-4 font-sans text-sm font-normal outline-none transition hover:border-brand/40 focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
    </label>
  );
}

function PhoneForm({
  phone,
  dialCode,
  otp,
  otpSent,
  busy,
  onPhoneChange,
  onDialCodeChange,
  onOtpChange,
  onSend,
  onVerify,
  resendIn,
}: Readonly<{
  phone: string;
  dialCode: string;
  otp: string;
  otpSent: boolean;
  busy: boolean;
  onPhoneChange: (value: string) => void;
  onDialCodeChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onSend: () => void | Promise<void>;
  onVerify: () => void | Promise<void>;
  resendIn: number;
}>): React.JSX.Element {
  return (
    <form
      className="mx-auto max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();
        if (otpSent) onVerify();
        else onSend();
      }}
    >
      <label htmlFor="phone" className="text-sm font-semibold">
        Phone number
      </label>
      <div className="mt-2 grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
        <label className="relative">
          <span className="sr-only">Country code</span>
          <select
            value={dialCode}
            disabled={otpSent}
            onChange={(event) => onDialCodeChange(event.target.value)}
            className="h-14 w-full appearance-none rounded-xl border bg-background pl-2.5 pr-6 font-sans text-sm font-semibold outline-none transition hover:border-brand/40 focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-75"
          >
            {countryDialCodes.map((option) => (
              <option key={`${option.country}-${option.code}`} value={option.code}>
                {option.flag} {option.code}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
            ⌄
          </span>
        </label>
        <div className="group relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground transition-colors group-focus-within:text-brand">
            <Phone className="size-5" />
          </span>
          <input
            id="phone"
            value={phone}
            disabled={otpSent}
            onChange={(event) => onPhoneChange(event.target.value.replace(/\D/g, '').slice(0, 14))}
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="801 234 5678"
            className="h-14 w-full rounded-xl border bg-background pl-12 pr-4 font-sans text-sm outline-none transition placeholder:text-muted-foreground/70 hover:border-brand/40 focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-75"
          />
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Country code {dialCode} is already selected. Enter only the remaining phone number without
        the leading zero.
      </p>
      {otpSent ? (
        <>
          <label htmlFor="otp" className="mt-5 block text-sm font-semibold">
            Verification code
          </label>
          <div className="group relative mt-2">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground transition-colors group-focus-within:text-brand">
              <KeyRound className="size-5" />
            </span>
            <input
              id="otp"
              value={otp}
              onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter the 6-digit code"
              className="h-14 w-full rounded-xl border bg-background pl-12 pr-4 text-center font-sans text-base tracking-[0.3em] outline-none transition placeholder:text-sm placeholder:tracking-normal placeholder:text-muted-foreground/70 hover:border-brand/40 focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
          <button
            type="button"
            onClick={() => void onSend()}
            disabled={busy || resendIn > 0}
            className="mt-3 text-xs font-semibold text-brand disabled:text-muted-foreground"
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
          </button>
        </>
      ) : (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          We will send a one-time password to this number through Termii.
        </p>
      )}
      <button
        disabled={busy}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white transition-opacity disabled:opacity-60"
      >
        {busy ? 'Please wait…' : otpSent ? 'Verify phone number' : 'Send verification code'}
        {!busy ? <ArrowRight className="size-4" /> : null}
      </button>
    </form>
  );
}

function nationalNumber(phone: string | null | undefined, dialCode: string): string {
  const digits = phone?.replace(/\D/g, '') ?? '';
  const code = dialCode.replace(/\D/g, '');
  return digits.startsWith(code) ? digits.slice(code.length) : digits.replace(/^0+/, '');
}

function splitProfileName(name: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return { firstName: parts[0] ?? '', lastName: parts.at(-1) ?? '' };
}

function VerifiedState({
  title,
  onContinue,
  complete,
}: Readonly<{ title: string; onContinue: () => void; complete: boolean }>): React.JSX.Element {
  return (
    <div className="mx-auto max-w-xl py-4 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand/10 text-brand">
        <CheckCircle2 className="size-8" />
      </span>
      <h3 className="mt-4 font-sans text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {complete
          ? 'All three verification steps are complete in this UI preview.'
          : 'This step is complete. Continue to the next identity check.'}
      </p>
      {!complete ? (
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 inline-flex items-center gap-2 font-semibold text-brand"
        >
          Continue verification <ArrowRight className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
