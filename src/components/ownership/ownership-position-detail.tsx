import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  WalletCards,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  getOwnershipCapitalReturn,
  getOwnershipProjection,
  type MemberMaturityPayout,
  type Ownership,
} from '@/lib/services/ownership-service';
import { BalanceAmount } from '@/components/ui/balance-amount';
import { formatReturnSchedule } from '@/lib/opportunities';
import { formatNaira } from './formatters';

type OwnershipPositionDetailProps = Readonly<{
  ownership: Ownership;
  payout?: MemberMaturityPayout;
}>;

function DetailMetric({
  label,
  value,
  supportingText,
}: Readonly<{
  label: string;
  value: React.ReactNode;
  supportingText?: string;
}>): React.JSX.Element {
  return (
    <div className="rounded-lg bg-surface px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
      {supportingText ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{supportingText}</p>
      ) : null}
    </div>
  );
}

export function OwnershipPositionDetail({
  ownership,
  payout,
}: OwnershipPositionDetailProps): React.JSX.Element {
  const opportunity = ownership.opportunityId;
  const completed = ownership.status === 'COMPLETED';
  const projection = getOwnershipProjection(ownership);
  const formatDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'Not set';
  return (
    <div className="mx-auto max-w-4xl px-5 py-6 sm:px-8 lg:px-10">
      <Link
        href="/ownership"
        className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-xs font-semibold text-muted-foreground transition hover:border-brand/35 hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <section className="mt-5 overflow-hidden rounded-xl border bg-background">
        <div className="relative aspect-[16/7] min-h-44 bg-muted">
          <Image
            src={opportunity.imageUrl}
            unoptimized
            alt={opportunity.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        </div>
        <div className="relative -mt-5 rounded-t-xl bg-background p-4 sm:p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
            {completed ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}
            {completed ? 'Completed ownership' : 'Active ownership'}
          </span>
          <h1 className="mt-3 font-sans text-[18px] font-semibold tracking-tight sm:text-[18px]">
            {opportunity.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ownership.units} {ownership.units === 1 ? 'unit' : 'units'}
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <DetailMetric
              label="Your contribution"
              value={<BalanceAmount value={formatNaira(ownership.amountMinorUnits / 100)} toggle />}
            />
            <DetailMetric
              label={`Projected ${formatReturnSchedule(ownership.returnSchedule).toLowerCase()} distribution`}
              value={<BalanceAmount value={projection.amount} />}
              supportingText={`${projection.rate} ${ownership.returnSchedule.toLowerCase()} rate`}
            />
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>
              Acquired {formatDate(ownership.createdAt)} ·{' '}
              {ownership.termType === 'LIFE_OF_ASSET'
                ? `Capital returns — ${getOwnershipCapitalReturn(ownership)}`
                : `Principal return ${formatDate(ownership.maturityAt)}`}
            </span>
          </p>
          <div className="mt-4 grid gap-2">
            <DetailMetric
              label={completed ? 'Completed on' : 'Cycle status'}
              value={completed ? formatDate(ownership.completedAt) : 'Cycle in progress'}
            />
          </div>
          {!completed && (
            <>
              {/* <div className="mt-5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cycle progress</span>
                <span className="font-semibold text-brand">
                  {ownership.progressPercent}% complete
                </span>
              </div> */}
              {/* <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${ownership.progressPercent}%` }}
                />
              </div> */}
              <section className="mt-7">
                <h2 className="font-sans text-[17px] font-semibold">Unit information</h2>
                <p className="mt-1 max-w-3xl text-[12px] leading-6 text-muted-foreground">
                  Your ownership units are active. Operator updates, reviewed evidence, and
                  distribution records will appear here as the cycle progresses.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <DetailMetric
                    label="Return schedule"
                    value={formatReturnSchedule(ownership.returnSchedule)}
                    supportingText={
                      ownership.termType === 'LIFE_OF_ASSET'
                        ? 'Variable distributions are based on realised performance.'
                        : `${ownership.scheduledReturnCycles} scheduled ${ownership.scheduledReturnCycles === 1 ? 'return' : 'returns'}`
                    }
                  />
                  <DetailMetric
                    label={
                      ownership.termType === 'LIFE_OF_ASSET'
                        ? 'Distribution timing'
                        : 'Next return date'
                    }
                    value={
                      ownership.termType === 'LIFE_OF_ASSET'
                        ? `${formatReturnSchedule(ownership.returnSchedule)} allocation`
                        : formatDate(ownership.nextAccrualAt)
                    }
                    supportingText={
                      ownership.termType === 'LIFE_OF_ASSET'
                        ? 'Any distribution is based on realised performance and credited after administrator approval.'
                        : 'Actual returns are credited to your earnings balance after administrator approval.'
                    }
                  />
                  <DetailMetric
                    label="Actual returns credited"
                    value={
                      <BalanceAmount
                        value={formatNaira(ownership.totalAccruedReturnMinorUnits / 100)}
                      />
                    }
                  />
                  <DetailMetric
                    label="Opportunity structure"
                    value={opportunity.opportunityStructure.replaceAll('_', '-')}
                  />
                  <DetailMetric
                    label="Monthly profit preference"
                    value={
                      ownership.rolloverElection === 'COMPOUND'
                        ? 'Rolled into contribution'
                        : 'Paid to earnings wallet'
                    }
                    supportingText={
                      ownership.rolloverElection === 'COMPOUND'
                        ? 'Approved profit increases the capital used for the next calculation.'
                        : 'Approved profit is credited to your wallet each month.'
                    }
                  />
                </div>
              </section>
            </>
          )}
          {completed && (
            <section className="mt-7 rounded-xl bg-surface p-4 sm:p-5">
              <h2 className="font-sans text-lg font-semibold">
                {payout?.status === 'APPROVED'
                  ? 'Payout credited to your wallet'
                  : payout?.status === 'REJECTED'
                    ? 'Withdrawal requires attention'
                    : 'Withdrawal awaiting admin approval'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {payout?.status === 'APPROVED'
                  ? `${formatNaira(payout.totalPayoutMinorUnits / 100)} principal has been returned to your wallet balance.`
                  : payout?.status === 'REJECTED'
                    ? payout.reviewNote ||
                      'The payout was not approved. Contact support for a review.'
                    : `This cycle is complete. ${payout ? formatNaira(payout.totalPayoutMinorUnits / 100) : 'The maturity payout'} will only be credited after admin approval.`}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link
                  href="/wallet"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-xs font-semibold transition hover:border-brand/35 hover:bg-muted"
                >
                  <WalletCards className="size-4" />
                  View wallet
                </Link>
                <Link
                  href="/discover"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-brand-foreground transition hover:brightness-110"
                >
                  <RefreshCw className="size-4" />
                  Explore opportunities
                </Link>
              </div>
            </section>
          )}
          <section className="mt-7 border-t pt-5">
            <h2 className="font-sans text-[16px] font-semibold">Ownership timeline</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="size-4 text-brand" />
                Units acquired
              </p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-4 text-brand" />
                Agreement recorded
              </p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-4 text-brand"> </Clock3>
                {completed ? 'Cycle completed' : 'Cycle in progress'}
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
