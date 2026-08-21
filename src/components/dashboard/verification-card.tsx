import { ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

type VerificationCardProps = Readonly<{ status: 'guest' | 'unverified' | 'verified' }>;

export function VerificationCard({ status }: VerificationCardProps): React.JSX.Element {
  const isGuest = status === 'guest';
  const isVerified = status === 'verified';
  const title = isGuest
    ? 'Set up your Playtives profile'
    : isVerified
      ? 'Identity verified'
      : 'Complete your identity check';

  const description = isGuest
    ? 'Create an account to fund your wallet and start owning opportunities.'
    : isVerified
      ? 'Your profile is ready to fund opportunities with confidence.'
      : 'Verification helps keep Playtives secure and unlocks investment funding.';

  const action = isGuest ? 'Create account' : isVerified ? 'View profile' : 'Start KYC';

  return (
    <section className="mt-4 rounded-2xl border border-brand/10 bg-brand/5 px-4 py-3">
      <div className="flex items-start gap-3 sm:items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-background text-brand">
          <User className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
        </span>
      </div>

      <Link
        href="/profile/verification"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline sm:ml-[3.25rem]"
      >
        {action}
        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
