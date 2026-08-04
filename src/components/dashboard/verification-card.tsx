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
    <section className="z-10 flex min-h-52 flex-col justify-between rounded-2xl border border-brand/20 bg-white/5 p-5">
      <div>
        <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
          <User className="size-5" />
        </span>

        <h2 className="mt-5 font-heading text-xl font-semibold">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <Link
        href="/profile/verification"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
      >
        {action}

        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
