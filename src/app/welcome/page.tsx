'use client';

import { ArrowRight, BookOpen, HandCoins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { CommunityMembershipNotice } from '@/components/auth/community-membership-notice';
import { notify } from '@/lib/notify';
import { updateMemberIntent } from '@/lib/services/registration-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { whatsappLearningCommunityUrl } from '@/lib/community';

type Intent = 'LEARN_FIRST' | 'READY_TO_PARTICIPATE';

export default function WelcomePage(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const signOut = useAuthStore((state) => state.signOut);
  const [saving, setSaving] = useState<Intent | null>(null);
  const [showCommunityNotice, setShowCommunityNotice] = useState(false);

  const choose = async (intent: Intent): Promise<void> => {
    setSaving(intent);
    if (intent === 'LEARN_FIRST') setShowCommunityNotice(true);
    try {
      const result = await updateMemberIntent(
        intent,
        intent === 'LEARN_FIRST' ? whatsappLearningCommunityUrl : undefined,
      );
      if (intent === 'LEARN_FIRST') {
        signOut();
        window.location.replace('/community-membership');
        return;
      }
      updateUser(result);
      router.replace('/');
    } catch (error: unknown) {
      setShowCommunityNotice(false);
      notify.error(error instanceof ApiError ? error.message : 'Could not save your choice');
      setSaving(null);
    }
  };

  if (showCommunityNotice)
    return (
      <main className="app-background grid min-h-dvh place-items-center px-5 py-10">
        <CommunityMembershipNotice />
      </main>
    );

  return (
    <main className="app-background grid min-h-dvh place-items-center px-5 py-10">
      <section className="w-full max-w-5xl rounded-3xl border bg-background p-6 shadow-sm sm:p-9">
        <p className="mt-8 text-[.85rem] font-bold uppercase tracking-[0.18em] text-brand">
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </p>
        <h1 className="mt-2 font-sans text-2xl font-semibold sm:text-2xl">
          What best describes you?
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Start by learning with the wider community, or request access to prepare for your first
          co-ownership or co-funding opportunity.
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <ChoiceCard
            icon={BookOpen}
            title="Join the community and learn first"
            description="Join the Playtives community on WhatsApp and learn until you are ready to participate. Dashboard access is not included yet."
            loading={saving === 'LEARN_FIRST'}
            disabled={saving !== null}
            onClick={() => void choose('LEARN_FIRST')}
          />
          <ChoiceCard
            icon={HandCoins}
            title="I’m ready to co-own or co-fund"
            description="Enter the dashboard in pending mode, explore opportunities, and request approval before funding or participating."
            loading={saving === 'READY_TO_PARTICIPATE'}
            disabled={saving !== null}
            onClick={() => void choose('READY_TO_PARTICIPATE')}
          />
        </div>
        <p className="mt-6 text-xs leading-5 text-muted-foreground">
          Full member access unlocks automatically after your first confirmed opportunity.
        </p>
      </section>
    </main>
  );
}

function ChoiceCard({
  icon: Icon,
  title,
  description,
  loading,
  disabled,
  onClick,
}: Readonly<{
  icon: typeof BookOpen;
  title: string;
  description: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}>): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex min-h-48 flex-col items-start rounded-2xl border bg-surface p-5 text-left transition hover:border-brand/40 hover:bg-brand/[0.035] disabled:opacity-60"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon className="size-5" />
      </span>
      <strong className="mt-5 text-base leading-6">{title}</strong>
      <span className="mt-2 text-xs leading-5 text-muted-foreground">{description}</span>
      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-semibold text-brand">
        {loading ? 'Saving your choice…' : 'Continue'}
        {!loading ? <ArrowRight className="size-4 transition group-hover:translate-x-0.5" /> : null}
      </span>
    </button>
  );
}
