'use client';

import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { getVerificationSteps } from '@/lib/services/profile-service';
import { useProfileStore } from '@/stores/use-profile-store';

export function VerificationCard(): React.JSX.Element {
  const verification = useProfileStore((state) => state.verification);
  const setVerificationStatus = useProfileStore((state) => state.setVerificationStatus);

  useEffect(() => {
    void useProfileStore.persist.rehydrate();
    void getVerificationSteps()
      .then((status) => {
        setVerificationStatus('bvn', status.bvn.verified ? 'verified' : 'not-verified');
        setVerificationStatus('nin', status.nin.verified ? 'verified' : 'not-verified');
        setVerificationStatus('phone', status.phone.verified ? 'verified' : 'not-verified');
      })
      .catch(() => undefined);
  }, [setVerificationStatus]);

  const completed = Object.values(verification).filter((status) => status === 'verified').length;
  const isComplete = completed === 3;

  return (
    <Link
      href="/profile/verification"
      className="group block overflow-hidden rounded-2xl border border-brand/15 bg-[linear-gradient(120deg,rgb(30_130_94_/_0.10),rgb(255_255_255_/_0.96)_58%)] p-4 transition-colors hover:border-brand/35 dark:bg-[linear-gradient(120deg,rgb(30_130_94_/_0.16),rgb(20_32_27_/_0.96)_58%)] sm:p-5"
    >
      <div className="flex items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-sm">
          {isComplete ? <CheckCircle2 className="size-5" /> : <ShieldCheck className="size-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-sm sm:text-[1rem]">
              {isComplete
                ? 'Identity verification complete'
                : 'Complete your identity verification'}
            </strong>
            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-brand">
              {completed} of 3 complete
            </span>
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground sm:text-[.75rem]">
            {isComplete
              ? 'Your BVN, NIN and phone number are marked as verified.'
              : 'Verify your BVN, NIN and phone number to secure your Playtives account.'}
          </span>
        </span>
        <ArrowRight className="size-5 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
      </div>
      <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-brand/10">
        <span
          className="block h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${(completed / 3) * 100}%` }}
        />
      </span>
    </Link>
  );
}
