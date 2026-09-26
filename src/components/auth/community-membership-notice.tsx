import { UsersRound } from 'lucide-react';
import Link from 'next/link';
import { whatsappLearningCommunityUrl, whatsappSupportUrl } from '@/lib/community';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';

export function CommunityMembershipNotice(): React.JSX.Element {
  return (
    <div className="w-full max-w-lg rounded-3xl border bg-background p-6 text-center shadow-sm sm:p-8">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#22c967]/10 text-[#16984b]">
        <UsersRound className="size-7" />
      </span>
      {/* <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-brand">
        Community membership
      </p> */}
      <h1 className="mt-5 font-sans text-2xl font-semibold">You&apos;re in!</h1>
      <p className="text-md mx-auto mt-3 max-w-md font-medium leading-4">
        Now join our Playtives Whatsapp community
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        As a general community member, you will have access to learn and participate in profitable
        opportunities. Contact support when you are ready to co-own or co-fund!
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <a
          href={whatsappLearningCommunityUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#22c967] px-5 text-sm font-semibold text-white"
        >
          <WhatsAppIcon className="size-5" /> Join WhatsApp
        </a>
        <a
          href={`${whatsappSupportUrl}?text=Hello%20Playtives%2C%20I%20am%20ready%20to%20learn%20more%20about%20co-owning%20or%20co-funding.`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-xl border px-5 text-sm font-semibold"
        >
          Contact Support
        </a>
      </div>
      <Link href="/sign-in" className="mt-5 inline-block text-sm font-semibold text-brand">
        Back to sign in
      </Link>
    </div>
  );
}
