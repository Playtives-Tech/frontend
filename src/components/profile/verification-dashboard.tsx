'use client';

import { CheckCircle2, ChevronRight, Check } from 'lucide-react';

import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
import { useProfileStore, type VerificationStatus } from '@/stores/use-profile-store';
import { useEffect } from 'react';
import { getPhoneVerificationStatus } from '@/lib/services/profile-service';

const checks = [
  {
    key: 'phone',
    title: 'Phone number',
    detail: 'Verify a primary phone number',
    href: '/profile/verification/phone',
  },
  {
    key: 'bvn',
    title: 'BVN verification',
    detail: 'Confirm your bank verification details',
    href: '/profile/verification/bvn',
  },
  {
    key: 'nin',
    title: 'NIN verification',
    detail: 'Confirm your national identification number',
    href: '/profile/verification/nin',
  },
] as const;

function StatusBadge({ status }: Readonly<{ status: VerificationStatus }>): React.JSX.Element {
  return (
    <span
      className={
        status === 'verified'
          ? 'rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand'
          : 'rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground'
      }
    >
      {status === 'verified' ? 'Verified' : 'Not verified'}
    </span>
  );
}

export function VerificationDashboard(): React.JSX.Element {
  const verification = useProfileStore((state) => state.verification);
  const setVerificationStatus = useProfileStore((state) => state.setVerificationStatus);
  useEffect(() => {
    void getPhoneVerificationStatus()
      .then((result) =>
        setVerificationStatus('phone', result.verified ? 'verified' : 'not-verified'),
      )
      .catch(() => undefined);
  }, [setVerificationStatus]);
  const verified = Object.values(verification).filter((status) => status === 'verified').length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      <BackButton label="Profile" />

      <header className="mt-7">
        <h1 className="mt-2 font-sans text-3xl font-semibold">Identity and verification</h1>
        <p className="mt-3 text-muted-foreground">
          Complete these checks to protect your account and unlock verified ownership transactions.
        </p>
      </header>

      <section className="mt-8 rounded-3xl bg-brand/5 p-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand/10 text-brand">
          <Check className="size-8" />
        </span>
        <h2 className="mt-5 font-sans text-2xl font-semibold">
          {verified === 3 ? 'Your identity is verified' : `${verified} of 3 checks complete`}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your details are processed through the approved verification service and sensitive IDs are
          not retained here.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border bg-background p-2">
        {checks.map(({ key, title, detail, href }, index) => (
          <Link
            key={key}
            href={href}
            className={`flex items-center gap-4 rounded-xl p-4 transition hover:bg-muted ${index > 0 ? 'border-t' : ''}`}
          >
            <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
              <CheckCircle2 className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block">{title}</strong>
              <small className="mt-1 block text-muted-foreground">{detail}</small>
            </span>
            <StatusBadge status={verification[key]} />
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        ))}
      </section>
    </div>
  );
}
