'use client';

import {
  IconArrowRight as ArrowRight,
  IconCalendar as CalendarDays,
  IconChartLine as ChartNoAxesCombined,
  IconCircleCheck as CheckCircle2,
  IconCoins as Coins,
  IconFlag as Flag,
  IconInfoCircle as Info,
  IconStack3 as Layers3,
  IconLoader2 as LoaderCircle,
  IconPencil as Pencil,
  IconRefresh as RefreshCcw,
  IconRepeat as Repeat2,
  IconTarget as Target,
  IconHourglass as Timer,
  IconChartLine as TrendingUp,
  IconUsers as Users,
  IconX as X,
} from '@tabler/icons-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import type { TablerIcon } from '@tabler/icons-react';
import { useCallback, useEffect, useId, useState } from 'react';
import { notify } from '@/lib/notify';
import { trackEvent } from '@/lib/product-analytics';
import { showMilestone } from '@/components/ui/milestone-popup';
import {
  acceptCollectiveAgreement,
  getCollectiveDashboard,
  getCollectiveLeaderboard,
  scheduleCollectiveContribution,
  updateCollectiveContributionPlan,
  updateCollectiveGoal,
  updateCollectiveLeaderboard,
  type CollectiveContributionPlanInput,
  type CollectiveDashboard,
  type CollectiveLeaderboard,
} from '@/lib/services/collectives-service';
import { CollectiveAmountModal, type CollectiveAmountAction } from './collective-amount-modal';
import { CollectiveScheduleModal } from './collective-schedule-modal';
import { CollectiveLeaderboardList } from './collective-leaderboard-list';
import { CollectiveContentPreview } from './collective-content-preview';
import { CollectiveUpdates } from './collective-updates';
import {
  formatCollectiveDate,
  formatCollectiveDateTime,
  formatCollectiveDeploymentDate,
  formatCollectiveMoney,
  formatCollectiveActivityAmount,
} from './collective-ui';

type View = 'overview' | 'progress' | 'performance' | 'updates';

export function WealthCollectiveDashboard(): React.JSX.Element {
  useEffect(() => { trackEvent('collective_viewed'); }, []);
  const [data, setData] = useState<CollectiveDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('overview');
  const [action, setAction] = useState<CollectiveAmountAction | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [goalEditing, setGoalEditing] = useState(false);
  const [goalAmount, setGoalAmount] = useState('');
  const [goalTargetAt, setGoalTargetAt] = useState('');
  const [goalSaving, setGoalSaving] = useState(false);
  const [leaderboard, setLeaderboard] = useState<CollectiveLeaderboard | null>(null);
  const [leaderboardIdentity, setLeaderboardIdentity] = useState<
    'INITIAL' | 'NICKNAME' | 'ANONYMOUS'
  >('INITIAL');
  const [leaderboardNickname, setLeaderboardNickname] = useState('');
  const [leaderboardSaving, setLeaderboardSaving] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [joinUnavailableReason, setJoinUnavailableReason] = useState<string | null>(null);
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
  useEffect(() => {
    if (view !== 'progress') return;
    void getCollectiveLeaderboard()
      .then(setLeaderboard)
      .catch(() => setLeaderboard(null));
  }, [view, data?.wallet.leaderboardOptIn]);
  useEffect(() => {
    if (!data?.wallet) return;
    setLeaderboardIdentity(data.wallet.leaderboardIdentity ?? 'INITIAL');
    setLeaderboardNickname(data.wallet.leaderboardNickname ?? '');
  }, [data?.wallet.id]);
  const submit = async (input: CollectiveContributionPlanInput): Promise<boolean> => {
    if (!data || !action) return false;
    try {
      await updateCollectiveContributionPlan(input);
      notify.success(
        input.amountMinorUnits === null
          ? 'Contribution plan removed.'
          : input.method === 'AUTOMATIC'
            ? 'Monthly contribution plan saved. Automatic debits are enabled.'
            : 'Contribution plan saved. No automatic debit is enabled.',
      );
      load();
      return true;
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : 'Please try again.');
      return false;
    }
  };
  const submitSchedule = async (input: {
    amountMinorUnits: number;
    monthlyContributionPlan?: CollectiveContributionPlanInput;
  }): Promise<boolean> => {
    if (!data?.nextDeployment) return false;
    const firstContribution =
      data.contributedMinorUnits === 0 && data.scheduledContributions.length === 0;
    try {
      const contribution = await scheduleCollectiveContribution(
        input.amountMinorUnits,
        data.nextDeployment,
        input.monthlyContributionPlan,
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
      showMilestone({
        id: contribution.id,
        title: firstContribution ? 'Welcome to the Collective!' : 'Added to your Collective!',
        message:
          contribution.status === 'PROCESSED'
            ? 'Your funds are active.'
            : 'Your funds are awaiting deployment.',
        actionUrl: '/collectives',
        actionLabel: 'View Collective',
      });
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
  const projectedMonthlyRate = data.programme?.projectedTargetRateBps ?? null;
  const projectedMonthlyPercent = projectedMonthlyRate === null ? null : projectedMonthlyRate / 100;
  const compoundedIllustrationPercent =
    projectedMonthlyPercent === null
      ? null
      : (Math.pow(1 + projectedMonthlyPercent / 100, 12) - 1) * 100;
  const participatingMemberCount = data.socialProof?.memberCount ?? 0;
  const openContributionFlow = (): void => {
    if (data.earlyExit) {
      setJoinUnavailableReason('This Collective position has been exited, so new contributions are unavailable.');
      return;
    }
    if (data.maturity) {
      setJoinUnavailableReason('This Collective has matured and is no longer accepting contributions.');
      return;
    }
    if (!data.programme) {
      setJoinUnavailableReason('There is no active Wealth Collective programme to join right now.');
      return;
    }
    if (!data.nextDeployment) {
      setJoinUnavailableReason('There is no upcoming funding window for new contributions right now.');
      return;
    }
    if (!data.agreement) {
      setJoinUnavailableReason('The Collective agreement is not available yet. Please check back later.');
      return;
    }
    if (!data.agreement.accepted) {
      setAgreementOpen(true);
      return;
    }
    setScheduleOpen(true);
  };

  return (
    <div className="w-full min-w-0 px-2 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {showIntroduction ? (
          <div className="space-y-6">
            <header className="rounded-[2rem] bg-[linear-gradient(135deg,#064b37_0%,#075d42_65%,#306038_100%)] px-6 py-10 text-white sm:px-10 sm:py-14">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                Introducing the Collective
              </p>
              <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
                The Playtives Wealth Collective
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-[.85rem]">
                Build disciplined wealth through monthly compounding. Commit to a monthly amount for
                12 months. Your capital is deployed into commodity trades in multiple cycles.
                Projected profit compounds monthly.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand hover:bg-white/90 ${!data.nextDeployment || !data.programme ? 'opacity-60' : ''}`}
                  aria-disabled={!data.nextDeployment || !data.programme}
                  onClick={openContributionFlow}
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
            <section aria-label="Key programme metrics">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ProgrammeMetric
                  icon={TrendingUp}
                  label="Projected target*"
                  value={
                    projectedMonthlyPercent === null
                      ? 'Not set'
                      : `${formatPercentage(projectedMonthlyPercent)} monthly`
                  }
                />
                <ProgrammeMetric
                  icon={ChartNoAxesCombined}
                  label="12-month compounded illustration*"
                  value={
                    compoundedIllustrationPercent === null
                      ? 'Not available'
                      : `~${compoundedIllustrationPercent.toFixed(1)}%`
                  }
                />
                <ProgrammeMetric
                  icon={Timer}
                  label="Fixed Collective lifecycle"
                  value="12 months"
                />
                <ProgrammeMetric
                  icon={Repeat2}
                  label="Profits roll into next month active trades"
                  value="Compounded"
                />
              </div>
              {projectedMonthlyPercent !== null && compoundedIllustrationPercent !== null && (
                <p className="mt-5 max-w-5xl text-[.72rem] leading-5 text-muted-foreground">
                  *{formatPercentage(projectedMonthlyPercent)} monthly is a projected target. ~
                  {compoundedIllustrationPercent.toFixed(1)}% illustrates what{' '}
                  {formatPercentage(projectedMonthlyPercent)} monthly compounding would produce over
                  12 months if achieved consistently. Actual performance depends on trade results
                  and may be higher or lower.
                </p>
              )}
            </section>
            {participatingMemberCount > 0 && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-brand/20 bg-brand/[0.04] px-4 py-3 text-sm font-semibold text-brand">
                <Users aria-hidden="true" className="size-4" />
                {participatingMemberCount.toLocaleString('en-NG')}{' '}
                {participatingMemberCount === 1 ? 'member' : 'members'} participating
              </div>
            )}
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                How it works
              </p>
              <h2 className="mt-1 text-xl font-semibold">A simple way to build consistently</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <IntroductionFeature
                  number="1"
                  title="Start with your capital"
                  description="Choose how much you want to begin with."
                />
                <IntroductionFeature
                  number="2"
                  title="Add to it monthly"
                  description="Set a monthly amount and build consistently."
                />
                <IntroductionFeature
                  number="3"
                  title="Profit compounds"
                  description="Accrued monthly profit adds to your capital throughout fund lifecycle"
                />
              </div>
            </section>
            <section className="rounded-2xl border bg-muted/[0.28] p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                Programme details &amp; risks
              </p>
              <h2 className="mt-2 text-lg font-semibold">
                Built around one fixed Collective lifecycle
              </h2>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-3">
                <p>Members may join while the 12-month Collective is active.</p>
                <p>
                  Capital begins participating only after it is deployed into an eligible cycle.
                </p>
                <p>
                  Target returns are projections. Actual results may be higher or lower and are not
                  guaranteed.
                </p>
              </div>
              <button
                className={`mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand/90 ${!data.nextDeployment || !data.programme ? 'opacity-60' : ''}`}
                aria-disabled={!data.nextDeployment || !data.programme}
                onClick={openContributionFlow}
                type="button"
              >
                Join the Collective <ArrowRight className="size-4" />
              </button>
            </section>
          </div>
        ) : (
          <>
            <header className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#064b37_0%,#075d42_65%,#306038_100%)] px-5 py-7 text-white shadow-[0_22px_55px_rgb(8_68_49_/_0.18)] sm:px-8 sm:py-9">
              <div className="pointer-events-none absolute -right-24 -top-40 size-96 rounded-full bg-white/10" />
              <div className="relative">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-300 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-emerald-950">
                    {data.programme?.status === 'ACTIVE' ? 'Active Collective' : 'Coming soon'}
                  </span>
                  {participatingMemberCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90">
                      <Users aria-hidden="true" className="size-3.5" />
                      {participatingMemberCount.toLocaleString('en-NG')}{' '}
                      {participatingMemberCount === 1 ? 'member' : 'members'} participating
                    </span>
                  )}
                </div>
                <h1 className="mt-5 max-w-3xl text-2xl font-semibold leading-tight sm:text-3xl">
                  The Playtives Wealth Collective
                </h1>
                <p className="mt-4 text-sm font-semibold text-white/90">
                  Collective progress:{' '}
                  {cycle ? `Month ${cycle.number} of 12` : '12-month programme'}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                  {collectiveStatusMessage(data, activeCapital, awaitingDeployment)}
                </p>
                <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/20 pt-4">
                  <div>
                    <p className="text-xs text-white/65">Next expected deployment</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {data.nextDeployment
                        ? formatCollectiveDeploymentDate(data.nextDeployment.deploymentAt)
                        : 'None scheduled'}
                    </p>
                  </div>
                  <button
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={
                      !data.nextDeployment || Boolean(data.earlyExit) || Boolean(data.maturity)
                    }
                    onClick={openContributionFlow}
                    type="button"
                  >
                    Add to Collective <ArrowRight className="size-4" />
                  </button>
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
                  { key: 'progress', label: 'Progress', icon: TrendingUp },
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
                  {key === 'updates' && data.unreadUpdateCount > 0 ? (
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-red-600 text-[10px] font-bold leading-none text-white">
                      {data.unreadUpdateCount > 9 ? '9+' : data.unreadUpdateCount}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>

            {(view === 'overview' || view === 'progress') && (
              <div
                className={
                  view === 'progress'
                    ? 'flex flex-col gap-6 [&>:not(.progress-section)]:hidden'
                    : 'flex flex-col gap-6 [&>.progress-section]:hidden'
                }
              >
                <section className="progress-section bg-card rounded-2xl border p-5 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                    Your Collective progress
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">Goals, consistency and milestones</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Track your contribution habits and choose whether to join the optional monthly
                    leaderboard.
                  </p>
                </section>
                {data.agreement && (
                  <section className="bg-card order-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5">
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
                        Contribution Plan
                      </p>
                      {/* <h2 className="mt-1 text-xl font-semibold">Stay consistent</h2> */}
                    </div>
                    <CalendarDays className="size-6 text-brand" />
                  </div>
                  <div className="mt-5 rounded-xl bg-muted/55 p-5">
                    <p className="text-sm text-muted-foreground">
                      Planned {data.wallet.planFrequency?.toLowerCase() ?? 'monthly'} contribution
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {data.wallet.monthlyPlanMinorUnits
                        ? formatCollectiveMoney(data.wallet.monthlyPlanMinorUnits)
                        : 'Not set'}
                    </p>
                    {data.wallet.monthlyPlanMinorUnits ? (
                      <div className="mt-4 space-y-2 border-t pt-3 text-sm">
                        <p className="flex flex-wrap justify-between gap-2">
                          <span className="text-muted-foreground">Method</span>
                          <strong>
                            {data.wallet.monthlyPlanMethod === 'AUTOMATIC'
                              ? 'Automatic from Playtives Wallet'
                              : 'Manual'}
                          </strong>
                        </p>
                        {data.wallet.monthlyPlanMethod === 'AUTOMATIC' &&
                          data.wallet.monthlyPlanNextDebitAt && (
                            <p className="flex flex-wrap justify-between gap-2">
                              <span className="text-muted-foreground">
                                Next planned contribution
                              </span>
                              <strong>
                                {formatCollectiveDate(data.wallet.monthlyPlanNextDebitAt)}
                              </strong>
                            </p>
                          )}
                        {data.wallet.monthlyPlanMethod === 'MANUAL' &&
                          data.wallet.monthlyPlanNextReminderAt && (
                            <p className="flex flex-wrap justify-between gap-2">
                              <span className="text-muted-foreground">Next email reminder</span>
                              <strong>
                                {formatCollectiveDate(data.wallet.monthlyPlanNextReminderAt)}
                              </strong>
                            </p>
                          )}
                      </div>
                    ) : null}
                  </div>
                  {!data.wallet.monthlyPlanMinorUnits && (
                    <div className="mt-3 rounded-xl border border-brand/25 bg-brand/5 p-3">
                      <p className="text-sm font-semibold text-brand">Add a Contribution Plan</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        You joined before contribution plans were introduced. Setting one is
                        optional and does not change your existing Collective position.
                      </p>
                    </div>
                  )}
                  {data.wallet.monthlyPlanLastStatus === 'INSUFFICIENT_FUNDS' && (
                    <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                      Your last automatic contribution was skipped because your Playtives Wallet
                      balance was insufficient. No debit was made.
                    </p>
                  )}
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    {data.wallet.monthlyPlanMinorUnits
                      ? data.wallet.monthlyPlanMethod === 'AUTOMATIC'
                        ? 'Monthly Auto Wallet attempts your selected amount on the chosen date.'
                        : 'Your plan is an intention. Contribute when you choose; no wallet debit is made.'
                      : 'Set an optional daily, weekly, monthly, or flexible contribution intention.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-7 text-xs font-semibold text-white sm:text-sm"
                      onClick={openContributionFlow}
                      type="button"
                    >
                      Add funds <ArrowRight className="size-4" />
                    </button>
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-7 text-xs font-semibold hover:bg-muted sm:text-sm"
                      onClick={() => setAction('monthlyPlan')}
                      type="button"
                    >
                      <Pencil className="size-4 shrink-0" />{' '}
                      {data.wallet.monthlyPlanMinorUnits ? 'Edit plan' : 'Set plan'}
                    </button>
                  </div>
                </section>
                <section className="progress-section bg-card order-2 rounded-2xl border p-5 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                    Personal Collective goal
                  </p>
                  {data.wallet.collectiveGoalMinorUnits ? (
                    <>
                      <p className="mt-3 text-xl font-semibold">
                        {formatCollectiveMoney(data.wallet.collectiveGoalMinorUnits)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {data.wallet.collectiveGoalTargetAt
                          ? `Target ${formatCollectiveDate(data.wallet.collectiveGoalTargetAt)}`
                          : 'By programme maturity'}
                      </p>
                      <div
                        className="mt-4 h-2 rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Collective goal progress"
                        aria-valuenow={data.engagement?.goalProgressPercent ?? 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${data.engagement?.goalProgressPercent ?? 0}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {data.engagement?.goalProgressPercent ?? 0}% of your goal reached
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Set an optional target for your Collective position. This does not change your
                      platform Wealth Goal or move money.
                    </p>
                  )}
                  <button
                      type="button"
                      className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                      onClick={() => {
                        setGoalAmount(
                          data.wallet.collectiveGoalMinorUnits
                            ? String(data.wallet.collectiveGoalMinorUnits / 100)
                            : '',
                        );
                        setGoalTargetAt(data.wallet.collectiveGoalTargetAt?.slice(0, 10) ?? '');
                        setGoalEditing(true);
                      }}
                    >
                      <Target className="size-4" aria-hidden="true" />
                      {data.wallet.collectiveGoalMinorUnits ? 'Edit goal' : 'Set my Collective target'}
                  </button>
                </section>
                {data.engagement && (
                  <section className="progress-section bg-card order-2 rounded-2xl border p-5 sm:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                          <ChartNoAxesCombined className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                          <h2 className="text-sm font-semibold text-foreground">Your contribution habit</h2>
                          <p className="text-xs text-muted-foreground">Built from accepted Collective contributions</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        {data.engagement.scoreBand}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Repeat2 className="size-4 text-brand" aria-hidden="true" />
                          Current streak
                        </p>
                        <p className="mt-2 text-xl font-semibold">
                          {data.engagement.streak} {data.engagement.streakUnit}
                          {data.engagement.streak === 1 ? '' : 's'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Consecutive contribution periods</p>
                      </div>
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="size-4 text-brand" aria-hidden="true" />
                          Collective Habit Score
                        </p>
                        <p className="mt-2 text-xl font-semibold">
                          {data.engagement.score} <span className="text-sm font-normal text-muted-foreground">/ 1000</span>
                        </p>
                        <div
                          className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand/10"
                          role="progressbar"
                          aria-label="Collective Habit Score"
                          aria-valuenow={data.engagement.score}
                          aria-valuemin={0}
                          aria-valuemax={1000}
                        >
                          <div className="h-full rounded-full bg-brand" style={{ width: `${data.engagement.score / 10}%` }} />
                        </div>
                      </div>
                    </div>
                    <details className="mt-4 rounded-xl border bg-background p-4 text-sm">
                      <summary className="cursor-pointer font-semibold text-brand">How your score works</summary>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        Four signals make up your score. If you have not set a contribution plan or Collective goal, that signal is left out and the others are reweighted.
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="flex gap-2"><Repeat2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" /><p><strong>Consistency · 40%</strong><br /><span className="text-xs text-muted-foreground">Periods with a contribution in the last 30 days, 12 weeks, or 6 months, based on your plan.</span></p></div>
                        <div className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" /><p><strong>Plan adherence · 30%</strong><br /><span className="text-xs text-muted-foreground">How much of your planned amount you contributed each period, capped at 100%.</span></p></div>
                        <div className="flex gap-2"><Timer className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" /><p><strong>Longevity · 15%</strong><br /><span className="text-xs text-muted-foreground">Time since your first accepted contribution, reaching full credit after 180 days.</span></p></div>
                        <div className="flex gap-2"><Flag className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" /><p><strong>Goal progress · 15%</strong><br /><span className="text-xs text-muted-foreground">Your current Collective value against your optional Collective goal.</span></p></div>
                      </div>
                      <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">This reflects contribution habits, not a credit score or a forecast of returns.</p>
                    </details>
                  </section>
                )}
                <section className="progress-section bg-card order-2 rounded-2xl border p-5 sm:p-7">
                  <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                    Monthly consistency leaderboard
                  </h2>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Optional and private by default. Points reflect distinct days with accepted
                    contributions this month, never the amount contributed. No balance or return is
                    shown.
                  </p>
                  {data.wallet.leaderboardOptIn ? (
                    <div className="mt-4 space-y-3">
                      <label className="block text-sm font-medium">
                        Public name
                        <select
                          className="mt-1 h-11 w-full rounded-lg border bg-background px-3"
                          value={leaderboardIdentity}
                          onChange={(event) =>
                            setLeaderboardIdentity(event.target.value as typeof leaderboardIdentity)
                          }
                        >
                          <option value="INITIAL">First name and initial</option>
                          <option value="NICKNAME">Nickname</option>
                          <option value="ANONYMOUS">Anonymous Builder</option>
                        </select>
                      </label>
                      {leaderboardIdentity === 'NICKNAME' && (
                        <label className="block text-sm font-medium">
                          Nickname
                          <input
                            className="mt-1 h-11 w-full rounded-lg border px-3"
                            maxLength={24}
                            value={leaderboardNickname}
                            onChange={(event) => setLeaderboardNickname(event.target.value)}
                          />
                        </label>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={leaderboardSaving}
                          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          onClick={() => {
                            setLeaderboardSaving(true);
                            void updateCollectiveLeaderboard({
                              optIn: true,
                              identity: leaderboardIdentity,
                              nickname: leaderboardNickname,
                            })
                              .then(() => {
                                load();
                                void getCollectiveLeaderboard().then(setLeaderboard);
                                notify.success('Leaderboard name saved.');
                              })
                              .catch((cause: unknown) =>
                                notify.error(
                                  cause instanceof Error
                                    ? cause.message
                                    : 'Could not save leaderboard preference.',
                                ),
                              )
                              .finally(() => setLeaderboardSaving(false));
                          }}
                        >
                          Save public name
                        </button>
                        <button
                          type="button"
                          disabled={leaderboardSaving}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50"
                          onClick={() => {
                            setLeaderboardSaving(true);
                            void updateCollectiveLeaderboard({
                              optIn: false,
                              identity: leaderboardIdentity,
                            })
                              .then(() => {
                                load();
                                void getCollectiveLeaderboard().then(setLeaderboard);
                                notify.success('You left the leaderboard.');
                              })
                              .catch((cause: unknown) =>
                                notify.error(
                                  cause instanceof Error
                                    ? cause.message
                                    : 'Could not leave leaderboard.',
                                ),
                              )
                              .finally(() => setLeaderboardSaving(false));
                          }}
                        >
                          Leave leaderboard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={leaderboardSaving}
                      className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      onClick={() => {
                        setLeaderboardSaving(true);
                        void updateCollectiveLeaderboard({ optIn: true, identity: 'INITIAL' })
                          .then(() => {
                            load();
                            void getCollectiveLeaderboard().then(setLeaderboard);
                            notify.success('You joined the leaderboard.');
                          })
                          .catch((cause: unknown) =>
                            notify.error(
                              cause instanceof Error
                                ? cause.message
                                : 'Could not join leaderboard.',
                            ),
                          )
                          .finally(() => setLeaderboardSaving(false));
                      }}
                    >
                      Join leaderboard
                    </button>
                  )}
                  {leaderboard && leaderboard.entries.length > 0 && (
                    <CollectiveLeaderboardList entries={leaderboard.entries} />
                  )}
                  {leaderboard && (
                    <Link href="/collectives/leaderboard" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
                      View full leaderboard <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  )}
                  {leaderboard && leaderboard.entries.length === 0 && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      No opted-in members have earned points this month yet.
                    </p>
                  )}
                </section>
                {!!data.engagement?.milestones?.length && (
                  <section className="progress-section bg-card order-2 rounded-2xl border p-5 sm:p-7">
                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                      Your milestones
                    </h2>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Based on recorded contributions and deployments. No wallet credit is made for
                      a milestone.
                    </p>
                    <ul className="mt-4 space-y-3">
                      {data.engagement.milestones.map((milestone) => (
                        <li
                          key={milestone.id}
                          className="flex items-center justify-between gap-3 rounded-xl border p-3"
                        >
                          <span className="text-sm font-medium">{milestone.title}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatCollectiveDate(milestone.earnedAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {!!data.socialProof?.activeThisMonthCount && (
                  <section className="progress-section bg-card order-2 rounded-2xl border p-5 sm:p-7">
                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                      Building together
                    </h2>
                    <p className="mt-3 text-xl font-semibold">
                      {data.socialProof.activeThisMonthCount.toLocaleString('en-NG')} members
                      contributed this month
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Based on recorded Collective contributions and scheduled funds. Individual
                      amounts remain private.
                    </p>
                  </section>
                )}
                <section className="bg-card order-0 rounded-2xl border p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                        Your Collective Position
                      </p>
                      <h2 className="mt-3 text-[.9rem] font-semibold">
                        {data.maturity ? 'Final Matured Value' : 'Total Collective Value'}
                      </h2>
                      <p className="mt-1 text-2xl font-semibold tracking-tight text-brand">
                        {formatCollectiveMoney(totalCollective)}
                      </p>
                      {activeCapital === 0 && awaitingDeployment > 0 && !data.earlyExit && (
                        <p className="mt-2 text-xs font-semibold text-amber-700">
                          Awaiting Deployment
                        </p>
                      )}
                      {data.earlyExit && (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          Early Exit{' '}
                          {data.earlyExit.status === 'COMPLETED' ? 'completed' : 'requested'} ·
                          further profit participation stopped
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
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                          : 'Your allocated, reconciled profit. Compounded amounts earn in later trades; held amounts do not. Neither is spendable in your wallet before maturity.'
                      }
                    />
                    <CapitalBreakdown
                      label="Next Expected Deployment"
                      value={
                        data.nextDeployment
                          ? formatCollectiveDeploymentDate(data.nextDeployment.deploymentAt)
                          : 'None scheduled'
                      }
                      detail="Next eligible deployment for new funds"
                    />
                    <CapitalBreakdown
                      label="Available Playtives Wallet"
                      value={formatCollectiveMoney(data.playtivesWallet.availableBalanceMinorUnits)}
                      detail="Available to add to your Collective position"
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                    <p className="min-w-0 flex-1 text-[.75rem] leading-4 text-muted-foreground">
                      Add funds anytime. New funds await the next eligible deployment and become
                      eligible for actual returns from their deployment date.
                    </p>
                    <button
                      className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand/90 sm:w-auto"
                      aria-disabled={!data.nextDeployment || Boolean(data.earlyExit) || Boolean(data.maturity)}
                      onClick={openContributionFlow}
                      type="button"
                    >
                      {hasJoinedCollective ? 'Add to Collective' : 'Join & Fund Collective'}
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </section>
                <section className="bg-card order-1 rounded-2xl border p-4 sm:p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                      Monthly positions
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      Your Collective by month{' '}
                      <SectionHelp label="Your Collective by month">
                        Each row shows your capital for that month and, once reconciled, your own
                        attributed profit. The programme-wide return is not automatically the amount
                        you personally earned.
                      </SectionHelp>
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Contributions to the same month are combined. Reconciled profit below is your
                      own allocation, not the programme-wide result or a wallet payment.
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
                          ((monthPosition?.profitMinorUnits ?? 0) !== 0 &&
                            month.status === 'RECONCILED') ||
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
                              {month.status === 'RECONCILED' &&
                                ((monthPosition?.activeMinorUnits ?? 0) > 0 ||
                                  (monthPosition?.profitMinorUnits ?? 0) !== 0) && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Your profit</p>
                                    <p className="text-sm font-semibold text-brand">
                                      {formatCollectiveMoney(monthPosition?.profitMinorUnits ?? 0)}
                                    </p>
                                  </div>
                                )}
                              {monthAwaiting > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Awaiting Deployment
                                  </p>
                                  <p className="text-sm font-semibold">
                                    {formatCollectiveMoney(monthAwaiting)}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-muted-foreground">Capital in month</p>
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
                    *Target returns are projections and are not guaranteed. Actual performance may
                    vary.
                  </p>
                </section>
                <section className="bg-card order-5 rounded-2xl border p-5 sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[1.1rem] font-semibold">
                        Latest activity{' '}
                        <SectionHelp label="Latest activity">
                          Recent Collective ledger entries for your account, such as funding, profit
                          attribution, and rollovers. An attributed profit entry is not a wallet
                          payout.
                        </SectionHelp>
                      </h2>
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
                  <section className="order-6 rounded-2xl border border-brand/30 bg-brand/5 p-5">
                    <h2 className="font-semibold">
                      Matured Collective{' '}
                      <SectionHelp label="Matured Collective">
                        After the final month is reconciled, your invested balance and any held
                        profit are settled to your Playtives Wallet.
                      </SectionHelp>
                    </h2>
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
                  <h2 className="mt-1 text-xl font-semibold">
                    Monthly results{' '}
                    <SectionHelp label="Monthly results">
                      The chart shows programme return rates. Your personal amount depends on how
                      much capital you had deployed and how long it was eligible; see Your profit in
                      each monthly position.
                    </SectionHelp>
                  </h2>
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
                    <h2 className="text-[1rem] font-semibold">
                      Month history{' '}
                      <SectionHelp label="Month history">
                        The amounts here are profit allocated to your account for each month, not
                        total profit across all members or spendable wallet funds.
                      </SectionHelp>
                    </h2>
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
                              data.positions.find(
                                (positionItem) => positionItem.cycleId === item._id,
                              )?.profitMinorUnits ?? 0,
                            )}
                          </p>
                          <p className="text-[.85rem] text-muted-foreground">
                            {item.actualReturnRateBps == null
                              ? 'Awaiting result'
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
                    <h2 className="mt-1 text-xl font-semibold">
                      Published updates{' '}
                      <SectionHelp label="Published updates">
                        Announcements from the Playtives team. They do not change your capital,
                        profit, or wallet balance.
                      </SectionHelp>
                    </h2>
                    {/* <p className="text-sm text-muted-foreground">
                      Upcoming funding windows and confirmed monthly results.
                    </p> */}
                  </div>
                  <RefreshCcw className="size-6 text-brand" />
                </div>
                <div className="mt-5">
                  <CollectiveUpdates
                    limit={4}
                    updates={data.updates}
                    onRead={(updateId) =>
                      setData((current) =>
                        current
                          ? {
                              ...current,
                              unreadUpdateCount: Math.max(0, current.unreadUpdateCount - 1),
                              updates: current.updates.map((item) =>
                                item._id === updateId ? { ...item, isRead: true } : item,
                              ),
                            }
                          : current,
                      )
                    }
                  />
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
      {goalEditing && (
        <div
          aria-labelledby="collective-goal-title"
          aria-modal="true"
          className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <section className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand">Wealth Collective</p>
                <h2 className="mt-1 text-xl font-semibold" id="collective-goal-title">
                  {data.wallet.collectiveGoalMinorUnits ? 'Edit your Collective goal' : 'Set your Collective goal'}
                </h2>
              </div>
              <button
                aria-label="Close goal"
                className="grid size-9 place-items-center rounded-lg border"
                disabled={goalSaving}
                onClick={() => setGoalEditing(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              This optional target tracks your Collective progress. It does not move money or change your platform Wealth Goal.
            </p>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium">
                Target amount (₦)
                <input
                  autoFocus
                  className="mt-1 h-11 w-full rounded-lg border px-3"
                  type="number"
                  min="1"
                  value={goalAmount}
                  onChange={(event) => setGoalAmount(event.target.value)}
                />
              </label>
              <label className="block text-sm font-medium">
                Target date (optional)
                <input
                  className="mt-1 h-11 w-full rounded-lg border px-3"
                  type="date"
                  value={goalTargetAt}
                  onChange={(event) => setGoalTargetAt(event.target.value)}
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={goalSaving}
                className="min-h-11 rounded-lg bg-brand px-5 text-sm font-semibold text-white disabled:opacity-50"
                onClick={() => {
                  const targetMinorUnits = Math.round(Number(goalAmount) * 100);
                  if (!Number.isSafeInteger(targetMinorUnits) || targetMinorUnits <= 0) {
                    notify.error('Enter a valid goal amount.');
                    return;
                  }
                  setGoalSaving(true);
                  void updateCollectiveGoal({ targetMinorUnits, targetAt: goalTargetAt || null })
                    .then(() => {
                      setGoalEditing(false);
                      load();
                      notify.success('Collective goal saved.');
                    })
                    .catch((cause: unknown) =>
                      notify.error(cause instanceof Error ? cause.message : 'Could not save goal.'),
                    )
                    .finally(() => setGoalSaving(false));
                }}
              >
                {goalSaving ? 'Saving…' : 'Save goal'}
              </button>
              <button
                type="button"
                disabled={goalSaving}
                className="min-h-11 rounded-lg border px-5 text-sm font-semibold"
                onClick={() => setGoalEditing(false)}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}
      {action && (
        <CollectiveAmountModal
          action={action}
          availableMinorUnits={null}
          initialAmountMinorUnits={
            action === 'monthlyPlan' ? data.wallet.monthlyPlanMinorUnits : null
          }
          initialMethod={data.wallet.monthlyPlanMethod}
          initialPreferredDebitDay={data.wallet.monthlyPlanPreferredDebitDay}
          initialPreferredReminderDay={data.wallet.monthlyPlanReminderDay}
          initialFrequency={data.wallet.planFrequency}
          initialPreferredReminderWeekday={data.wallet.planReminderWeekday}
          initialPreferredReminderHour={data.wallet.planReminderHour}
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
      {joinUnavailableReason ? (
        <div role="presentation" className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setJoinUnavailableReason(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="join-unavailable-title" className="w-full max-w-sm rounded-2xl bg-background p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="join-unavailable-title" className="text-lg font-semibold">Unable to join right now</h2>
              <button type="button" aria-label="Close" onClick={() => setJoinUnavailableReason(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{joinUnavailableReason}</p>
            <button type="button" onClick={() => setJoinUnavailableReason(null)} className="mt-5 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white">Got it</button>
          </section>
        </div>
      ) : null}
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
  number,
  title,
  description,
}: Readonly<{ number: string; title: string; description: string }>): React.JSX.Element {
  return (
    <article className="rounded-2xl border border-brand/25 bg-brand/[0.025] p-4">
      <span className="grid size-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">
        {number}
      </span>
      <h2 className="mt-2 font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
    </article>
  );
}

function ProgrammeMetric({
  icon: Icon,
  label,
  value,
}: Readonly<{ icon: TablerIcon; label: string; value: string }>): React.JSX.Element {
  return (
    <article className="min-w-0 rounded-2xl border border-brand/30 bg-brand/[0.12] p-2 shadow-[0_10px_30px_rgb(8_68_49_/_0.04)] sm:p-3">
      <Icon aria-hidden="true" className="size-5 text-brand" />
      <p className="mt-3 whitespace-nowrap text-base font-semibold leading-tight tracking-tight text-brand sm:text-[.9rem]">
        {value}
      </p>
      <p className="mt-1 text-xs leading-4 text-muted-foreground">{label}</p>
    </article>
  );
}

function formatPercentage(value: number): string {
  return `${value
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')}%`;
}

function collectiveStatusMessage(
  data: CollectiveDashboard,
  activeCapital: number,
  awaitingDeployment: number,
): string {
  if (data.earlyExit)
    return `Your Early Exit request is awaiting month-end settlement${data.earlyExit.eligibleSettlementAt ? ` on ${formatCollectiveDate(data.earlyExit.eligibleSettlementAt)}` : ''}. Your capital is no longer participating, and all profit and accrued returns are forfeited.`;
  if (data.maturity)
    return 'Your Collective has matured and the final reconciled value has been settled.';
  if (activeCapital > 0 && awaitingDeployment > 0)
    return `${formatCollectiveMoney(activeCapital)} is currently deployed, with ${formatCollectiveMoney(awaitingDeployment)} awaiting the next deployment.`;
  if (activeCapital > 0)
    return `${formatCollectiveMoney(activeCapital)} of your capital is currently deployed and participating in the Collective.`;
  if (awaitingDeployment > 0)
    return `Your ${formatCollectiveMoney(awaitingDeployment)} contribution is awaiting deployment. Returns begin once your funds are deployed.`;
  return 'Your Collective position is ready. Add funds to participate in the next eligible deployment.';
}

function SectionHelp({
  label,
  children,
}: Readonly<{ label: string; children: string }>): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [open]);
  return (
    <>
      <button
        aria-expanded={open}
        aria-label={`Information about ${label}`}
        className="inline-flex size-6 items-center justify-center rounded-full align-middle text-muted-foreground hover:bg-brand/10 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Info aria-hidden="true" className="size-4" />
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
            onMouseDown={() => setOpen(false)}
            role="presentation"
          >
            <div
              aria-labelledby={titleId}
              aria-modal="true"
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold" id={titleId}>
                  {label}
                </h2>
                <button
                  aria-label="Close information"
                  autoFocus
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>
              <p className="mt-4 text-sm font-normal leading-7 text-slate-700">{children}</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

const factHelp: Record<string, string> = {
  'Current Collective Month':
    'The scheduled programme month currently in progress. It does not mean every member has funds deployed in that month.',
  'Next Expected Deployment':
    'The next eligible time new funds may start participating. Funds do not earn before they are deployed.',
  'Collective Maturity Date':
    'The scheduled end of the programme. Final settlement follows reconciliation and then credits member wallets.',
  'Monthly Return Target*':
    'An illustrative target, not a guaranteed result. Actual reconciled returns can differ.',
};

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
    <article className="min-w-0 rounded-lg bg-muted/50 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-xs font-medium leading-5 text-muted-foreground">{label}</p>
        <SectionHelp label={label}>{detail}</SectionHelp>
      </div>
      <p className="mt-1 break-words text-base font-bold tracking-tight sm:text-[1.05rem] lg:text-lg">
        {value}
      </p>
    </article>
  );
}
function Fact({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <div className="bg-card rounded-xl border p-3">
      <p className="text-xs text-muted-foreground">
        {label} {factHelp[label] && <SectionHelp label={label}>{factHelp[label]}</SectionHelp>}
      </p>
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
