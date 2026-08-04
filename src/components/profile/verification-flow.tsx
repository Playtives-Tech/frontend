'use client';

import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import {
  sendPhoneCode,
  verifyBvn,
  verifyNin,
  verifyPhoneCode,
} from '@/lib/services/profile-service';
import { useProfileStore } from '@/stores/use-profile-store';

type VerificationKind = 'phone' | 'nin' | 'bvn';
const meta = {
  phone: {
    title: 'Verify phone number',
    description: 'We will send a six-digit code to confirm your number.',
  },
  nin: {
    title: 'Verify your NIN',
    description: 'Enter your 11-digit national identification number.',
  },
  bvn: {
    title: 'Verify your BVN',
    description: 'Your details are matched against approved provider records.',
  },
} as const;

export function VerificationFlow({
  type,
}: Readonly<{ type: VerificationKind }>): React.JSX.Element {
  const setVerification = useProfileStore((state) => state.setVerification);
  const status = useProfileStore((state) => state.verification[type]);
  const [phone, setPhone] = useState('+234');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const mutation = useMutation({
    mutationFn: async () => {
      if (type === 'phone') {
        if (!codeSent) {
          await sendPhoneCode(phone);
          setCodeSent(true);
          return;
        }
        await verifyPhoneCode(code);
      }
      if (type === 'nin') await verifyNin(nin);
      if (type === 'bvn') await verifyBvn(bvn, name, dateOfBirth);
    },
    onSuccess: () => {
      if (type !== 'phone' || codeSent) setVerification(type);
    },
  });
  const verified = status === 'verified';

  return (
    <div className="mx-auto max-w-xl px-5 py-8 sm:px-8 lg:px-10">
      <BackButton label="Verification" />
      <header className="mt-7">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Identity check
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">{meta[type].title}</h1>
        <p className="mt-3 text-muted-foreground">{meta[type].description}</p>
      </header>
      {verified ? (
        <section className="mt-8 rounded-2xl border bg-background p-6 text-center">
          <CheckCircle2 className="mx-auto size-12 text-brand" />
          <h2 className="mt-4 text-xl font-semibold">Verified</h2>
          <p className="mt-2 text-muted-foreground">
            This check is attached to your Playtives profile.
          </p>
        </section>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
          className="mt-8 rounded-2xl border bg-background p-6"
        >
          {type === 'phone' && (
            <>
              {!codeSent ? (
                <Field
                  label="Phone number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+234 801 234 5678"
                />
              ) : (
                <Field
                  label="Verification code"
                  value={code}
                  onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  hint="For this demo, enter 123456."
                />
              )}
            </>
          )}
          {type === 'nin' && (
            <Field
              label="NIN"
              value={nin}
              onChange={(value) => setNin(value.replace(/\D/g, '').slice(0, 11))}
              placeholder="11-digit NIN"
            />
          )}
          {type === 'bvn' && (
            <>
              <Field
                label="BVN"
                value={bvn}
                onChange={(value) => setBvn(value.replace(/\D/g, '').slice(0, 11))}
                placeholder="11-digit BVN"
              />
              <Field
                label="Full name"
                value={name}
                onChange={setName}
                placeholder="Your name as registered with your bank"
              />
              <label className="mt-5 grid gap-2 text-sm font-semibold">
                Date of birth
                <input
                  required
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className="h-12 rounded-xl border bg-background px-4"
                />
              </label>
            </>
          )}{' '}
          {mutation.isError && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">
              {mutation.error.message}
            </p>
          )}
          <button
            disabled={mutation.isPending}
            className="mt-6 h-11 w-full rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground disabled:opacity-50"
          >
            {mutation.isPending
              ? 'Verifying…'
              : type === 'phone' && !codeSent
                ? 'Send code'
                : 'Verify details'}
          </button>
          {type === 'phone' && codeSent && (
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              className="mt-3 w-full rounded-xl border py-3 text-sm font-semibold hover:bg-muted"
            >
              Resend code
            </button>
          )}
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
}>): React.JSX.Element {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-xl border bg-background px-4 font-normal"
      />
      {hint && <small className="font-normal text-muted-foreground">{hint}</small>}
    </label>
  );
}
