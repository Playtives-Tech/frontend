'use client';

import {
  ArrowRight,
  CalendarDays,
  ChartNoAxesCombined,
  Coins,
  Layers3,
  LoaderCircle,
  Pencil,
  RefreshCcw,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { notify } from '@/lib/notify';
import {
  acceptCollectiveAgreement,
  getCollectiveDashboard,
  scheduleCollectiveContribution,
  setCollectiveMonthlyCommitment,
  type CollectiveDashboard,
} from '@/lib/services/collectives-service';
import { CollectiveAmountModal, type CollectiveAmountAction } from './collective-amount-modal';
import { CollectiveScheduleModal } from './collective-schedule-modal';
import { CollectiveContentPreview } from './collective-content-preview';
import { CollectiveUpdates } from './collective-updates';
import {
  formatCollectiveDate,
  formatCollectiveDateTime,
  formatCollectiveDeploymentDate,
  formatCollectiveMoney,
  formatCollectiveActivityAmount,
} from './collective-ui';

type View = 'overview' | 'performance' | 'updates';

export function WealthCollectiveDashboard(): React.JSX.Element {
  const [data, setData] = useState<CollectiveDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('overview');
  const [action, setAction] = useState<CollectiveAmountAction | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [signingAgreement, setSigningAgreement] = useState(false);
  const load = useCallback((): void => {
    void getCollectiveDashboard()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load Wealth Collective.'),
      );
  }, []);
  useEffect(() => {
    load();
    const interval = window.setInterval(load, 30_000);
    return () => window.clearInterval(interval);
  }, [load]);
  const submit = async (amountMinorUnits: number): Promise<boolean> => {
    if (!data || !action) return false;
    try {
      await setCollectiveMonthlyCommitment(amountMinorUnits);
      notify.success('Monthly commitment saved. No funds were deducted.');
      load();
      return true;
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : 'Please try again.');
      return false;
    }
  };
  const submitSchedule = async (amountMinorUnits: number): Promise<boolean> => {
    if (!data?.nextDeployment) return false;
    const firstContribution =
      data.contributedMinorUnits === 0 && data.scheduledContributions.length === 0;
    try {
      const contribution = await scheduleCollectiveContribution(
        amountMinorUnits,
        data.nextDeployment,
      );
      notify.success(
        contribution.status === 'PROCESSED'
          ? firstContribution
            ? 'You joined the Collective. Your funds are active today.'
            : 'Funds added and deployed today.'
          : firstContribution
            ? 'You joined the Collective. Funds are awaiting deployment.'
            : 'Funds added to your Collective position. Awaiting deployment.',
      );
      load();
      return true;
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : 'Please try again.');
      load();
      return false;
    }
  };
  const signAgreement = async (): Promise<void> => {
    if (!data?.agreement || !agreementChecked) return;
    setSigningAgreement(true);
    try {
      await acceptCollectiveAgreement({
        version: data.agreement.version,
        accepted: true,
      });
      notify.success('Your agreement acceptance has been recorded.');
      setAgreementOpen(false);
      setAgreementChecked(false);
      load();
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : 'Unable to record your signature.');
      load();
    } finally {
      setSigningAgreement(false);
    }
  };
  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;
  if (!data)
    return (
      <div
        aria-live="polite"
        className="flex min-h-[65vh] flex-col items-center justify-center gap-4 px-4 text-center"
        role="status"
      >
        <LoaderCircle aria-hidden="true" className="size-10 animate-spin text-brand" />
        <p className="text-sm font-medium text-muted-foreground">Loading Wealth Collective…</p>
      </div>
    );

  const cycle = data.currentCycle;
  const hasJoinedCollective =
    data.contributedMinorUnits > 0 || data.scheduledContributions.length > 0;
  const showIntroduction = !hasJoinedCollective && !data.earlyExit && !data.maturity;
  const agreementContent = data.agreement?.content ?? '';
  const activeCapital = data.activeCapitalMinorUnits;
  const awaitingDeployment = data.awaitingDeploymentMinorUnits;
  const totalCollective =
    data.maturity?.totalMaturedValueMinorUnits ?? data.totalCollectiveValueMinorUnits;
  const reconciled = data.cycles.filter((item) => item.actualReturnRateBps !== null);

  return (
    <div className="w-full min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {showIntroduction ? (
          <div className="space-y-6">
            <header className="rounded-[2rem] bg-[linear-gradient(135deg,#064b37_0%,#075d42_65%,#306038_100%)] px-6 py-10 text-white sm:px-10 sm:py-14">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Introducing the Collective</p>
              <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">The Playtives Wealth Collective</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">Build disciplined wealth through collective commodity trading and monthly compounding.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!data.nextDeployment || !data.programme}
                  onClick={() => {
                    if (!data.agreement?.accepted) {
                      setAgreementOpen(true);
                      return;
                    }
                    setScheduleOpen(true);
                  }}
                  type="button"
                >
                  Join the Collective <ArrowRight className="size-4" />
                </button>
                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/50 px-5 text-sm font-semibold text-white hover:bg-white/10"
                  onClick={() => setAboutOpen(true)}
                  type="button"
                >
                  How it works / Terms &amp; risks
                </button>
              </div>
            </header>
            <section className="grid gap-3 sm:grid-cols-3">
              <IntroductionFeature icon={Coins} title="Start with your own capital" description="Choose how much you want to begin with." />
              <IntroductionFeature icon={CalendarDays} title="Add to it monthly" description="Set a monthly amount and build consistently." />
              <IntroductionFeature icon={ChartNoAxesCombined} title="Profit compounds" description="Confirmed profit rolls back into the Collective to grow your capital." />
            </section>
            <section className="rounded-2xl border border-emerald-700 bg-[#147251] p-6 text-white shadow-[0_16px_40px_rgb(8_68_49_/_0.16)] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Programme at a glance</p>
              <h2 className="mt-2 text-2xl font-semibold">12-month Collective</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85 sm:text-base">The Collective runs for a fixed 12 months. Members may join while it is active, but capital only begins participating once deployed.</p>
              <div className="mt-6 rounded-xl border border-white/25 bg-white/10 p-4 sm:p-5">
                <p className="text-base font-semibold text-white">
                  {data.programme?.projectedTargetRateBps != null
                    ? `Projected target: ${(data.programme.projectedTargetRateBps / 100).toFixed(2)}% monthly`
                    : 'Projected target has not been set'}
                </p>
                <p className="mt-1 text-sm leading-6 text-white/80">Actual returns depend on trade performance and are not guaranteed.</p>
              </div>
            </section>
          </div>
        ) : (
          <>
        <header className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#064b37_0%,#075d42_65%,#306038_100%)] px-5 py-7 text-white shadow-[0_22px_55px_rgb(8_68_49_/_0.18)] sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-24 -top-40 size-96 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-300 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-950">
                {data.programme?.status === 'ACTIVE' ? 'Active Collective' : 'Coming soon'}
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl text-2xl font-semibold leading-tight sm:text-4xl">
              The Playtives Wealth Collective
            </h1>
            <p className="mt-4 text-sm font-semibold text-white/90">
              Collective progress: {cycle ? `Month ${cycle.number} of 12` : '12-month programme'}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              {data.earlyExit
                ? 'Your Early Exit request is awaiting settlement. Your capital is no longer participating.'
                : activeCapital > 0
                  ? 'Your deployed capital and confirmed profits compound within the Collective until maturity.'
                  : 'Your contribution has been received and is awaiting the next deployment window. Returns begin only once funds are deployed.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-4 text-[.8rem]">
              <span>Total Collective Value <strong className="ml-1 text-white">{formatCollectiveMoney(totalCollective)}</strong></span>
              <span>Active Capital <strong className="ml-1 text-white">{formatCollectiveMoney(activeCapital)}</strong></span>
              <span>Pending Deployment <strong className="ml-1 text-white">{formatCollectiveMoney(awaitingDeployment)}</strong></span>
              <span>Profit Compounded <strong className="ml-1 text-white">{formatCollectiveMoney(data.profitToDateMinorUnits)}</strong></span>
            </div>
          </div>
        </header>

        <button
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand/90 sm:text-base"
          onClick={() => setAboutOpen(true)}
          type="button"
        >
          About Collective <ArrowRight className="size-4 shrink-0" />
        </button>

        <nav
          aria-label="Wealth Collective sections"
          className="flex border-b border-border/70 pt-2"
        >
          {(
            [
              { key: 'overview', label: 'Overview', icon: Layers3 },
              { key: 'performance', label: 'Performance', icon: ChartNoAxesCombined },
              { key: 'updates', label: 'Updates', icon: RefreshCcw },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              aria-current={view === key ? 'page' : undefined}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[2px] border-b-[3px] px-1 py-3 text-xs font-semibold transition sm:gap-2 sm:text-sm ${view === key ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              key={key}
              onClick={() => setView(key)}
              type="button"
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>

        {view === 'overview' && (
          <div className="flex flex-col gap-6">
            {data.agreement && (
              <section className="bg-card order-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                      Member agreement · v{data.agreement.version}
                    </p>
                    <h2 className="mt-1 font-semibold">
                      {data.agreement.accepted ? 'Agreement signed' : 'Review and sign to join'}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {data.agreement.accepted
                        ? 'Your acceptance is recorded.'
                        : 'Read and accept before adding funds.'}
                    </p>
                  </div>
                </div>
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-brand px-4 text-sm font-semibold text-brand hover:bg-brand/5"
                  onClick={() => setAgreementOpen(true)}
                  type="button"
                >
                  {data.agreement.accepted ? 'Read agreement' : 'Read and sign agreement'}
                  <ArrowRight className="size-4" />
                </button>
              </section>
            )}
            <section className="bg-card order-2 rounded-2xl border p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                    Your Monthly Commitment
                  </p>
                  {/* <h2 className="mt-1 text-xl font-semibold">Stay consistent</h2> */}
                </div>
                <CalendarDays className="size-6 text-brand" />
              </div>
              <div className="mt-5 rounded-xl bg-muted/55 p-5">
                <p className="text-sm text-muted-foreground">Monthly commitment</p>
                <p className="mt-1 text-xl font-semibold">
                  {data.wallet.monthlyPlanMinorUnits
                    ? formatCollectiveMoney(data.wallet.monthlyPlanMinorUnits)
                    : 'Not set'}
                </p>
                {data.nextDeployment && (
                  <p className="mt-4 border-t pt-3 text-sm text-muted-foreground">
                    Next: {data.nextDeployment.windowLabel === '1st' ? 'start-day' : 'halfway'} deployment{' '}
                    <strong className="text-foreground">
                      {formatCollectiveDeploymentDate(data.nextDeployment.deploymentAt)}
                    </strong>
                  </p>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                A planned monthly contribution only. No automatic debit is made.
              </p>
              <div className="mt-4">
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold hover:bg-muted sm:text-sm"
                  onClick={() => setAction('monthlyPlan')}
                  type="button"
                >
                  <Pencil className="size-4 shrink-0" /> Set Monthly Commitment
                </button>
              </div>
            </section>
            <section className="bg-card order-0 rounded-2xl border p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                    Your Collective Position
                  </p>
                  <h2 className="mt-2 text-lg font-semibold">
                    {data.maturity ? 'Final Matured Value' : 'Total Collective Value'}
                  </h2>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-brand">
                    {formatCollectiveMoney(totalCollective)}
                  </p>
                  {activeCapital === 0 && awaitingDeployment > 0 && !data.earlyExit && (
                    <p className="mt-2 text-xs font-semibold text-amber-700">Pending deployment</p>
                  )}
                  {data.earlyExit && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      Early Exit {data.earlyExit.status === 'COMPLETED' ? 'completed' : 'requested'}{' '}
                      · further profit participation stopped
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {cycle ? `Month ${String(cycle.number).padStart(2, '0')}` : 'No month'}
                </span>
              </div>
              <div
                aria-label="Active and awaiting deployment funds"
                className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-muted"
              >
                {activeCapital + awaitingDeployment > 0 && (
                  <>
                    <div
                      className="bg-brand"
                      style={{
                        width: `${(activeCapital / Math.max(1, activeCapital + awaitingDeployment)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-amber-400"
                      style={{
                        width: `${(awaitingDeployment / Math.max(1, activeCapital + awaitingDeployment)) * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <CapitalBreakdown
                  label="Capital Contributed"
                  value={formatCollectiveMoney(data.capitalContributedMinorUnits)}
                  detail="Your own contributions"
                />
                <CapitalBreakdown
                  label="Active / Deployed"
                  value={formatCollectiveMoney(activeCapital)}
                  detail="Participating from deployment"
                />
                <CapitalBreakdown
                  label="Awaiting Deployment"
                  value={formatCollectiveMoney(awaitingDeployment)}
                  detail={
                    data.nextDeployment
                      ? `Next expected deployment · ${formatCollectiveDeploymentDate(data.nextDeployment.deploymentAt)}`
                      : 'No funds awaiting deployment'
                  }
                />
                <CapitalBreakdown
                  label={data.earlyExit ? 'Profit forfeited' : 'Profit to Date'}
                  value={formatCollectiveMoney(
                    data.earlyExit?.forfeitedProfitMinorUnits ?? data.profitToDateMinorUnits,
                  )}
                  detail={
                    data.earlyExit
                      ? 'Not included in your Early Exit repayment'
                      : 'Compounds in your position; accessible at maturity under the terms'
                  }
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Next expected deployment</p>
                  <p className="font-semibold">
                    {data.nextDeployment
                      ? formatCollectiveDeploymentDate(data.nextDeployment.deploymentAt)
                      : 'None scheduled'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Available Playtives Wallet: {formatCollectiveMoney(data.playtivesWallet.availableBalanceMinorUnits)}
                  </p>
                </div>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand/90"
                  disabled={
                    !data.nextDeployment || Boolean(data.earlyExit) || Boolean(data.maturity)
                  }
                  onClick={() => {
                    if (!data.agreement) {
                      notify.info('There is no active Wealth Collective programme yet.');
                      return;
                    }
                    if (!data.agreement.accepted) {
                      setAgreementOpen(true);
                      return;
                    }
                    if (!data.nextDeployment) {
                      notify.info('There is no upcoming funding window to schedule into.');
                      return;
                    }
                    setScheduleOpen(true);
                  }}
                  type="button"
                >
                  {hasJoinedCollective ? 'Add to Collective' : 'Join & Fund Collective'}
                  <ArrowRight className="size-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Add funds anytime during the programme. New funds await the next eligible deployment
                and become eligible for actual returns from their deployment date.
              </p>
            </section>
            <section className="bg-card order-1 rounded-2xl border p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  Monthly positions
                </p>
                <h2 className="mt-1 text-lg font-semibold">Your Collective by month</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Contributions to the same month are combined into one position.
                </p>
              </div>
              <div className="mt-3 divide-y">
                {data.cycles
                  .map((month) => ({
                    month,
                    position: data.positions.find((item) => item.cycleId === month._id),
                  }))
                  .filter(
                    ({ month, position: monthPosition }) =>
                      (monthPosition?.activeMinorUnits ?? 0) > 0 ||
                      (monthPosition?.awaitingDeploymentMinorUnits ?? 0) > 0 ||
                      month._id === cycle?._id,
                  )
                  .map(({ month, position: monthPosition }) => {
                    const monthActive = monthPosition?.activeMinorUnits ?? 0;
                    const monthAwaiting = monthPosition?.awaitingDeploymentMinorUnits ?? 0;
                    return (
                      <div
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3"
                        key={month._id}
                      >
                        <div>
                          <p className="text-sm font-semibold">
                            Month {String(month.number).padStart(2, '0')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {monthAwaiting > 0
                              ? monthActive > 0
                                ? 'Active · Awaiting Deployment'
                                : 'Awaiting Deployment'
                              : month.actualReturnRateBps !== null
                                ? 'Completed'
                                : monthActive > 0
                                  ? 'Active'
                                  : 'No funds yet'}
                          </p>
                        </div>
                        <div className="flex gap-4 text-right">
                          {monthActive > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground">Active</p>
                              <p className="text-sm font-semibold">
                                {formatCollectiveMoney(monthActive)}
                              </p>
                            </div>
                          )}
                          {monthAwaiting > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground">Awaiting Deployment</p>
                              <p className="text-sm font-semibold">
                                {formatCollectiveMoney(monthAwaiting)}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground">Month total</p>
                            <p className="text-sm font-semibold text-brand">
                              {formatCollectiveMoney(monthActive + monthAwaiting)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {!data.positions.some(
                  (item) => item.activeMinorUnits > 0 || item.awaitingDeploymentMinorUnits > 0,
                ) && (
                  <p className="py-5 text-sm text-muted-foreground">
                    Your monthly positions will appear here when you join a month.
                  </p>
                )}
              </div>
            </section>
            <section className="order-3 grid grid-cols-2 gap-3" aria-label="Collective details">
              <Fact
                label="Current Collective Month"
                value={cycle ? `${String(cycle.number).padStart(2, '0')} of 12` : 'Not started'}
              />
              <Fact
                label="Next Expected Deployment"
                value={
                  data.nextDeployment
                    ? formatCollectiveDeploymentDate(data.nextDeployment.deploymentAt)
                    : cycle
                      ? 'Final month'
                      : 'Not scheduled'
                }
              />
              <Fact
                label="Collective Maturity Date"
                value={data.programme ? formatCollectiveDate(data.programme.endsAt) : 'Not set'}
              />
              <Fact
                label="Monthly Return Target*"
                value={
                  data.programme?.projectedTargetRateBps == null
                    ? 'Not set'
                    : `${(data.programme.projectedTargetRateBps / 100).toFixed(2)}% monthly`
                }
              />
              <p className="col-span-2 text-xs text-muted-foreground">
                *Target returns are projections and are not guaranteed. Actual performance may vary.
              </p>
            </section>
            <section className="bg-card order-4 rounded-2xl border p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[1.1rem] font-semibold">Latest activity</h2>
                  <p className="text-[.8rem] text-muted-foreground">
                    Recent changes to your position.
                  </p>
                </div>
                <Link
                  className="shrink-0 text-sm font-semibold text-brand hover:underline"
                  href="/collectives/activity"
                >
                  View all
                </Link>
              </div>
              {data.transactions.length ? (
                <div className="mt-4 divide-y">
                  {data.transactions.slice(0, 3).map((item) => (
                    <ActivityRow item={item} key={item._id} />
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                  No Collective activity yet.
                </p>
              )}
            </section>
            {data.maturity && (
              <section className="order-5 rounded-2xl border border-brand/30 bg-brand/5 p-5">
                <h2 className="font-semibold">Matured Collective</h2>
                <p className="mt-2 text-sm">
                  Capital contributed:{' '}
                  {formatCollectiveMoney(data.maturity.capitalContributedMinorUnits)}
                </p>
                <p className="text-sm">
                  Final profit: {formatCollectiveMoney(data.maturity.finalProfitMinorUnits)}
                </p>
                <p className="mt-1 font-semibold">
                  Total matured value:{' '}
                  {formatCollectiveMoney(data.maturity.totalMaturedValueMinorUnits)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Final reconciled value was settled to your Playtives Wallet.
                </p>
              </section>
            )}
          </div>
        )}

        {view === 'performance' && (
          <div className="space-y-5">
            <section className="bg-card rounded-2xl border p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                Actual performance
              </p>
              <h2 className="mt-1 text-xl font-semibold">Monthly results</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Actual results are separate from the projected monthly target of{' '}
                {data.programme?.projectedTargetRateBps == null
                  ? 'not set'
                  : `${(data.programme.projectedTargetRateBps / 100).toFixed(2)}%`}
                . Targets are not guaranteed.
              </p>
              {reconciled.length ? (
                <div className="mt-7 flex min-h-52 items-end gap-4 border-b pb-1">
                  {reconciled.map((item) => (
                    <div className="flex flex-1 flex-col items-center gap-2" key={item._id}>
                      <strong className="text-xs">
                        {((item.actualReturnRateBps ?? 0) / 100).toFixed(2)}%
                      </strong>
                      <div
                        className={`w-full max-w-24 rounded-t-lg ${item.actualReturnRateBps != null && item.actualReturnRateBps < 0 ? 'bg-red-500' : 'bg-brand'}`}
                        style={{
                          height: `${Math.max(12, (Math.abs(item.actualReturnRateBps ?? 0) / Math.max(...reconciled.map((entry) => Math.abs(entry.actualReturnRateBps ?? 0)), 1)) * 160)}px`,
                        }}
                      />
                      <span className="text-xs text-muted-foreground">Month {item.number}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-7 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                  No month has been reconciled yet.
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-8 border-t pt-5">
                <div>
                  <p className="text-sm text-muted-foreground">Capital contributed</p>
                  <p className="mt-1 text-xl font-semibold">
                    {formatCollectiveMoney(data.capitalContributedMinorUnits)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {data.earlyExit ? 'Profit forfeited' : 'Profit to Date'}
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {formatCollectiveMoney(
                      data.earlyExit?.forfeitedProfitMinorUnits ?? data.profitToDateMinorUnits,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Collective Value</p>
                  <p className="mt-1 text-xl font-semibold">
                    {formatCollectiveMoney(data.totalCollectiveValueMinorUnits)}
                  </p>
                </div>
              </div>
            </section>
            <section className="bg-card rounded-2xl border p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[1rem] font-semibold">Month history</h2>
                <Link
                  className="text-sm font-semibold text-brand hover:underline"
                  href="/collectives/cycles"
                >
                  View all
                </Link>
              </div>
              <div className="mt-4 divide-y">
                {data.cycles.slice(0, 4).map((item) => (
                  <div className="flex items-center justify-between gap-4 py-4" key={item._id}>
                    <div>
                      <p className="text-[.9rem] font-semibold">
                        Month {String(item.number).padStart(2, '0')}
                      </p>
                      <p className="text-[.85rem] text-muted-foreground">
                        {item.actualReturnRateBps == null
                          ? formatCollectiveDate(item.endsAt)
                          : 'Reconciled'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-brand">
                        {formatCollectiveMoney(
                          data.positions.find((positionItem) => positionItem.cycleId === item._id)
                            ?.profitMinorUnits ?? 0,
                        )}
                      </p>
                      <p className="text-[.85rem] text-muted-foreground">
                        {item.actualReturnRateBps == null
                          ? 'Pending'
                          : `${(item.actualReturnRateBps / 100).toFixed(2)}% actual`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {view === 'updates' && (
          <section className="bg-card rounded-2xl border p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  Collective updates
                </p>
                <h2 className="mt-1 text-xl font-semibold">Deployment and programme updates</h2>
                <p className="text-sm text-muted-foreground">
                  Upcoming funding windows and confirmed monthly results.
                </p>
              </div>
              <RefreshCcw className="size-6 text-brand" />
            </div>
            <div className="mt-5">
              <CollectiveUpdates cycles={data.cycles} limit={4} updates={data.updates} />
            </div>
            <Link
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              href="/collectives/updates"
            >
              View all updates <ArrowRight className="size-4" />
            </Link>
          </section>
        )}
          </>
        )}
      </div>
      {action && (
        <CollectiveAmountModal
          action={action}
          availableMinorUnits={null}
          initialAmountMinorUnits={
            action === 'monthlyPlan' ? data.wallet.monthlyPlanMinorUnits : null
          }
          onClose={() => setAction(null)}
          onSubmit={submit}
        />
      )}
      {scheduleOpen && data.nextDeployment && (
        <CollectiveScheduleModal
          balanceMinorUnits={data.playtivesWallet.availableBalanceMinorUnits}
          deploymentAt={data.nextDeployment.deploymentAt}
          isFirstContribution={!hasJoinedCollective}
          monthNumber={data.nextDeployment.cycleNumber}
          currentMonthNumber={cycle?.number ?? data.nextDeployment.cycleNumber}
          onClose={() => {
            setScheduleOpen(false);
          }}
          onSubmit={submitSchedule}
        />
      )}
      {aboutOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <section className="max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl sm:w-1/2 sm:max-w-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand">About</p>
                <h2 className="mt-1 text-xl font-semibold">
                  {data.programme?.name ?? 'Wealth Collective'}
                </h2>
              </div>
              <button
                aria-label="Close About Collective"
                className="grid size-9 place-items-center rounded-lg border"
                onClick={() => setAboutOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5">
              <CollectiveContentPreview
                content={
                  data.programme?.aboutContent?.trim() ||
                  'Join the 12-month Playtives Wealth Collective directly from your Playtives Wallet. Your contributions await the next eligible deployment and begin participating when deployed. At each month close, actual results are reconciled and attributed profit compounds into the next month. Capital and profit are accessible at maturity, subject to the Collective terms. Early exit is a separate request and forfeits attributed profit.'
                }
                format={
                  data.programme?.aboutContent?.trim()
                    ? (data.programme.aboutFormat ?? 'TEXT')
                    : 'TEXT'
                }
              />
            </div>
            {data.programme && (
              <p className="mt-4 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                Programme period: {formatCollectiveDate(data.programme.startsAt)} –{' '}
                {formatCollectiveDate(data.programme.endsAt)}
              </p>
            )}
            {data.agreement && (
              <button
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand px-4 text-sm font-semibold text-brand hover:bg-brand/5"
                onClick={() => {
                  setAboutOpen(false);
                  setAgreementOpen(true);
                }}
                type="button"
              >
                Read member agreement <ArrowRight className="size-4 shrink-0" />
              </button>
            )}
            {hasJoinedCollective && !data.earlyExit && !data.maturity && (
              <Link
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-300 px-4 text-center text-sm font-semibold text-red-600 hover:bg-red-50"
                href="/collectives/withdraw"
              >
                Request Early Exit <ArrowRight className="size-4 shrink-0" />
              </Link>
            )}
          </section>
        </div>
      )}
      {agreementOpen && data.agreement && (
        <div
          aria-labelledby="collective-agreement-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
          role="dialog"
        >
          <section className="max-h-[100dvh] w-full overflow-y-auto rounded-t-2xl border bg-background p-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:w-1/2 sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  Member agreement · v{data.agreement.version}
                </p>
                <h2 className="mt-1 text-xl font-semibold" id="collective-agreement-title">
                  {data.agreement.accepted ? 'Your agreement' : 'Review and sign to join'}
                </h2>
              </div>
              <button
                aria-label="Close agreement"
                className="grid size-9 shrink-0 place-items-center rounded-lg border"
                disabled={signingAgreement}
                onClick={() => setAgreementOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            {agreementContent.trim() ? (
              <div className="mt-5">
                <CollectiveContentPreview
                  content={agreementContent}
                  format={data.agreement.format}
                />
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                The administrator has not published the member agreement yet. Month funding is
                unavailable until it is published.
              </p>
            )}
            {!data.agreement.accepted && agreementContent.trim() && (
              <div className="mt-5 space-y-4">
                <label className="flex items-start gap-3 text-sm leading-6">
                  <input
                    checked={agreementChecked}
                    className="mt-1 size-4 accent-brand"
                    onChange={(event) => setAgreementChecked(event.target.checked)}
                    type="checkbox"
                  />
                  <span>I have read and agree to the Wealth Collective Member Agreement.</span>
                </label>
                <div className="flex gap-3">
                  <button
                    className="h-11 flex-1 rounded-lg border text-sm font-semibold"
                    disabled={signingAgreement}
                    onClick={() => setAgreementOpen(false)}
                    type="button"
                  >
                    Close
                  </button>
                  <button
                    className="h-11 flex-1 rounded-lg bg-brand px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={signingAgreement || !agreementChecked}
                    onClick={() => void signAgreement()}
                    type="button"
                  >
                    {signingAgreement ? 'Recording…' : 'Accept agreement'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function IntroductionFeature({
  icon: Icon,
  title,
  description,
}: Readonly<{ icon: LucideIcon; title: string; description: string }>): React.JSX.Element {
  return (
    <article className="rounded-2xl border border-brand/40 bg-brand/[0.04] p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </article>
  );
}

function CapitalBreakdown({
  label,
  value,
  detail,
}: Readonly<{
  label: string;
  value: string;
  detail: string;
}>): React.JSX.Element {
  return (
    <article className="min-w-0 rounded-lg bg-muted/50 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 break-words text-base font-semibold tracking-tight sm:text-lg">
        {value}
      </p>
      <p className="mt-1 text-[.7rem] leading-4 text-muted-foreground">{detail}</p>
    </article>
  );
}
function Fact({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <div className="bg-card rounded-xl border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
function ActivityRow({
  item,
}: Readonly<{ item: CollectiveDashboard['transactions'][number] }>): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 py-4 text-sm">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
          <Coins className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[.8rem] font-semibold">{item.note}</p>
          <p className="text-[.75rem] text-muted-foreground">
            {formatCollectiveDateTime(item.createdAt)}
          </p>
        </div>
      </div>
      <span className="shrink-0 font-semibold text-brand">
        {formatCollectiveActivityAmount(item)}
      </span>
    </div>
  );
}
