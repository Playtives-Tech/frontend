'use client';

import { CheckCircle2, Clock3, MessageCircleMore, ShieldCheck } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { whatsappLearningCommunityUrl } from '@/lib/community';
import { notify } from '@/lib/notify';
import {
  getParticipationAccess,
  requestParticipationAccess,
  type ParticipationAccessStatus,
} from '@/lib/services/participation-access-service';
import { useAuthStore } from '@/stores/use-auth-store';

export default function ParticipationAccessPage(): React.JSX.Element {
  const [status, setStatus] = useState<ParticipationAccessStatus | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    void getParticipationAccess()
      .then((result) => {
        setStatus(result);
        updateUser({
          participationAccessApproved: result.approved,
          participationAccessExpiresAt: result.expiresAt,
        });
      })
      .catch(() => notify.error('Could not load your participation access status'));
  }, [updateUser]);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!message.trim()) {
      notify.error('Tell us what you are interested in before submitting');
      return;
    }
    setSubmitting(true);
    try {
      await requestParticipationAccess(message);
      const nextStatus = await getParticipationAccess();
      setStatus(nextStatus);
      updateUser({
        participationAccessApproved: nextStatus.approved,
        participationAccessExpiresAt: nextStatus.expiresAt,
      });
      setMessage('');
      notify.success('Your request has been sent to Playtives');
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could not submit your request');
    } finally {
      setSubmitting(false);
    }
  };

  const requestStatus = status?.request?.status;
  const approved = status?.approved === true;

  return (
    <div className="w-full px-4 py-5 sm:px-8 lg:py-8">
      <section className="mx-auto max-w-3xl rounded-2xl border bg-background p-5 shadow-sm sm:p-8">
        <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
          <ShieldCheck className="size-6" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-brand">
          Participation access
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Get ready to co-own or co-fund</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          A Playtives administrator reviews this request before wallet funding and opportunity
          participation are enabled. You can continue browsing opportunities while you wait.
        </p>

        {approved ? (
          <div className="mt-7 flex gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold">Participation access approved</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                You can now fund your wallet and continue with an open opportunity. Your member
                status becomes active after your first confirmed participation. Complete it before{' '}
                {formatParticipationExpiry(status.expiresAt)} or your account will return to
                community membership.
              </p>
            </div>
          </div>
        ) : requestStatus === 'PENDING' ? (
          <div className="mt-7 flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Request awaiting review</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                The Playtives team will review your request and enable participation when you are
                ready to proceed.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7">
            {requestStatus === 'REJECTED' ? (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4 text-xs leading-5 text-muted-foreground">
                Your previous request was not approved
                {status?.request?.reviewNote ? `: ${status.request.reviewNote}` : '.'} You may
                contact the team and submit another request when ready.
              </div>
            ) : null}
            <label className="text-sm font-semibold" htmlFor="participation-message">
              Tell us what you are interested in <span className="text-red-600">*</span>
            </label>
            <textarea
              id="participation-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={500}
              required
              rows={4}
              placeholder="For example, I am ready to participate in an open co-ownership opportunity."
              className="mt-2 w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Sending request…' : 'Request participation access'}
            </button>
          </form>
        )}

        <div className="mt-7 border-t pt-6">
          <div className="flex items-start gap-3">
            <MessageCircleMore className="mt-0.5 size-5 shrink-0 text-brand" />
            <div>
              <p className="text-sm font-semibold">Prefer to talk to someone?</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Contact the community team on WhatsApp or email coown@playtives.com.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={whatsappLearningCommunityUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#22c967] px-4 text-xs font-semibold text-white"
                >
                  <WhatsAppIcon className="size-4" /> Open WhatsApp
                </a>
                <a
                  href="mailto:coown@playtives.com?subject=Participation%20access%20request"
                  className="inline-flex h-10 items-center rounded-lg border px-4 text-xs font-semibold"
                >
                  Send email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatParticipationExpiry(value: string | null): string {
  if (!value) return 'the 48-hour approval window closes';
  return `${new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(new Date(value))} WAT`;
}
