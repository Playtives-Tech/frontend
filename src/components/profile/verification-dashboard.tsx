'use client';

import { CheckCircle2, Clock3, FileCheck2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { notify } from '@/lib/notify';
import { getKycSubmission, getPhoneVerificationStatus, submitKyc, type KycSubmission } from '@/lib/services/profile-service';

const documentTypes = [['NIN', 'National Identity Number (NIN)'], ['BVN', 'Bank Verification Number (BVN)'], ['PASSPORT', 'International passport'], ['DRIVERS_LICENSE', "Driver's licence"], ['VOTERS_CARD', "Voter's card"]] as const;

export function VerificationDashboard(): React.JSX.Element {
  const [submission, setSubmission] = useState<KycSubmission | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void Promise.all([getKycSubmission(), getPhoneVerificationStatus()])
      .then(([kyc, phone]) => { setSubmission(kyc); setPhoneVerified(phone.verified); })
      .catch((error: unknown) => {
        setSubmission({ status: 'NOT_STARTED' });
        notify.error(error instanceof Error ? error.message : 'Unable to load verification status');
      })
      .finally(() => setLoading(false));
  }, []);

  const canSubmit = submission?.status === 'NOT_STARTED' || submission?.status === 'NEEDS_RESUBMISSION' || submission?.status === 'REJECTED';
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const front = data.get('documentFront');
    const back = data.get('documentBack');
    if (!(front instanceof File) || front.size === 0) return notify.error('Upload the front of your identity document');
    setSubmitting(true);
    try {
      const result = await submitKyc({ legalName: String(data.get('legalName')), dateOfBirth: String(data.get('dateOfBirth')), residentialAddress: String(data.get('residentialAddress')), state: String(data.get('state')), country: String(data.get('country')), documentType: String(data.get('documentType')), documentNumber: String(data.get('documentNumber')), documentFront: front, documentBack: back instanceof File && back.size > 0 ? back : null });
      setSubmission(result); notify.success('KYC submitted for review'); form.reset();
    } catch (error) { notify.error(error instanceof Error ? error.message : 'Unable to submit KYC'); }
    finally { setSubmitting(false); }
  }

  return <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
    <BackButton label="Account" />
    <header className="mt-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Account protection</p><h1 className="mt-2 font-sans text-3xl font-semibold">Identity verification</h1><p className="mt-3 leading-7 text-muted-foreground">Submit a valid identity document for secure manual review. Verification is required before funding, investing, or withdrawing.</p></header>
    <section className="mt-7 grid gap-3 sm:grid-cols-2"><StatusCard icon={phoneVerified ? CheckCircle2 : Clock3} title="Phone number" detail={phoneVerified ? 'Verified' : 'Complete phone verification first'} complete={phoneVerified} /><StatusCard icon={submission?.status === 'VERIFIED' ? ShieldCheck : FileCheck2} title="Identity document" detail={loading ? 'Loading…' : statusLabel(submission?.status)} complete={submission?.status === 'VERIFIED'} /></section>
    {!loading && submission && !canSubmit ? <section className="mt-6 rounded-2xl border bg-background p-6"><h2 className="font-sans text-xl font-semibold">{statusLabel(submission.status)}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{submission.status === 'VERIFIED' ? 'Your identity has been reviewed and approved.' : 'Your encrypted details and private documents are with our review team.'}</p>{submission.reviewNote ? <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Reviewer note: {submission.reviewNote}</div> : null}</section> : null}
    {!loading && canSubmit ? <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border bg-background p-5 sm:p-7">
      {(submission?.status === 'NEEDS_RESUBMISSION' || submission?.status === 'REJECTED') && submission.reviewNote ? <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Reviewer note: {submission.reviewNote}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Legal name"><input required name="legalName" defaultValue={submission?.legalName} className="input" /></Field><Field label="Date of birth"><input required name="dateOfBirth" type="date" className="input" /></Field></div>
      <Field label="Residential address"><textarea required name="residentialAddress" rows={3} className="input h-auto py-3" /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="State"><input required name="state" className="input" /></Field><Field label="Country"><input required name="country" defaultValue="Nigeria" className="input" /></Field></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Identity document"><select required name="documentType" className="input">{documentTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Document number"><input required minLength={5} name="documentNumber" autoComplete="off" className="input" /></Field></div>
      <div className="grid gap-4 sm:grid-cols-2"><FileField name="documentFront" label="Document front" required /><FileField name="documentBack" label="Document back (if applicable)" /></div>
      <label className="flex items-start gap-3 rounded-xl bg-surface p-4 text-sm leading-6"><input required type="checkbox" className="mt-1 size-4 accent-brand" /><span>I consent to Playtives securely storing and reviewing this information for identity verification and regulatory compliance.</span></label>
      {!phoneVerified ? <p className="text-sm font-medium text-amber-700">Verify your phone number before submitting KYC.</p> : null}
      <button disabled={submitting || !phoneVerified} className="h-12 w-full rounded-xl bg-brand font-semibold text-white disabled:opacity-50">{submitting ? 'Submitting securely…' : 'Submit for verification'}</button>
      <p className="text-center text-xs leading-5 text-muted-foreground">Documents are stored privately and can only be accessed by authorised reviewers.</p>
    </form> : null}
  </div>;
}

function StatusCard({ icon: Icon, title, detail, complete }: Readonly<{ icon: typeof ShieldCheck; title: string; detail: string; complete: boolean }>) { return <div className="flex items-center gap-3 rounded-2xl border bg-background p-4"><span className={`grid size-11 place-items-center rounded-xl ${complete ? 'bg-brand/10 text-brand' : 'bg-surface text-muted-foreground'}`}><Icon className="size-5" /></span><span><strong className="block text-sm">{title}</strong><small className="text-muted-foreground">{detail}</small></span></div>; }
function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) { return <label className="block text-sm font-semibold">{label}<span className="mt-2 block">{children}</span></label>; }
function FileField({ name, label, required = false }: Readonly<{ name: string; label: string; required?: boolean }>) { return <Field label={label}><input required={required} name={name} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="block w-full rounded-xl border p-3 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-brand/10 file:px-3 file:py-2 file:font-semibold file:text-brand" /></Field>; }
function statusLabel(status?: KycSubmission['status']) { return ({ NOT_STARTED: 'Not submitted', SUBMITTED: 'Submitted for review', UNDER_REVIEW: 'Review in progress', NEEDS_RESUBMISSION: 'Action required', VERIFIED: 'Identity verified', REJECTED: 'Submission not approved' } as const)[status ?? 'NOT_STARTED']; }
