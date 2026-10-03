import { api } from '@/lib/api';

export type CollectiveWallet = Readonly<{
  id: string;
  monthlyPlanMinorUnits: number | null;
  monthlyPlanMethod: 'MANUAL' | 'AUTOMATIC';
  monthlyPlanPreferredDebitDay: number | null;
  monthlyPlanNextDebitAt: string | null;
  monthlyPlanLastAttemptAt: string | null;
  monthlyPlanLastStatus: 'PROCESSING' | 'SUCCESSFUL' | 'INSUFFICIENT_FUNDS' | 'FAILED' | null;
  monthlyPlanLastFailureReason: string | null;
  monthlyPlanReminderDay: number | null;
  monthlyPlanNextReminderAt: string | null;
  monthlyPlanLastReminderAt: string | null;
  currency: 'NGN';
}>;
export type CollectiveContributionPlanInput = Readonly<{
  amountMinorUnits: number | null;
  method: 'MANUAL' | 'AUTOMATIC';
  preferredDebitDay?: number;
  automaticDebitAuthorized?: true;
  preferredReminderDay?: number;
}>;
export type CollectiveCycle = Readonly<{
  _id: string;
  number: number;
  startsAt: string;
  endsAt: string;
  firstWindowOpensAt?: string | null;
  firstWindowClosesAt: string | null;
  secondWindowOpensAt: string | null;
  secondWindowClosesAt: string | null;
  status: 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'RECONCILED';
  actualReturnRateBps: number | null;
}>;
export type CollectiveProgramme = Readonly<{
  _id: string;
  name: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  startsAt: string;
  endsAt: string;
  timezone: string;
  projectedTargetRateBps: number | null;
  settlementTimeframe: string;
  aboutFormat?: 'TEXT' | 'MARKDOWN' | 'HTML';
  aboutContent?: string;
  agreementFormat?: 'TEXT' | 'MARKDOWN' | 'HTML';
  agreementContent?: string;
  agreementVersion?: number;
}>;
export type CollectiveTransaction = Readonly<{
  _id: string;
  type: string;
  amountMinorUnits: number;
  note: string;
  createdAt: string;
}>;
export type CollectiveScheduledContribution = Readonly<{
  id: string;
  cycleId: string;
  amountMinorUnits: number;
  deploymentAt: string;
  windowClosesAt: string;
  windowLabel: '1st' | '16th';
  status: 'RESERVING' | 'SCHEDULED' | 'PROCESSING' | 'PROCESSED' | 'EXITED' | 'EXPIRED';
}>;
export type CollectiveUpdate = Readonly<{
  _id: string;
  title: string;
  body: string;
  publishedAt: string;
}>;
export type CollectiveDashboard = Readonly<{
  wallet: CollectiveWallet;
  playtivesWallet: Readonly<{ availableBalanceMinorUnits: number; currency: 'NGN' }>;
  programme: CollectiveProgramme | null;
  currentCycle: CollectiveCycle | null;
  nextCycle: CollectiveCycle | null;
  nextDeployment: Readonly<{
    cycleId: string;
    cycleNumber: number;
    deploymentAt: string;
    windowClosesAt: string;
    windowLabel: '1st' | '16th';
  }> | null;
  scheduledContributions: CollectiveScheduledContribution[];
  cycles: CollectiveCycle[];
  positions: ReadonlyArray<{
    cycleId: string;
    cycleNumber: number;
    capitalMinorUnits: number;
    activeMinorUnits: number;
    awaitingDeploymentMinorUnits: number;
    nextDeploymentAt: string | null;
    addedMinorUnits: number;
    profitMinorUnits: number;
  }>;
  confirmedProfitMinorUnits: number;
  capitalContributedMinorUnits: number;
  activeCapitalMinorUnits: number;
  awaitingDeploymentMinorUnits: number;
  profitToDateMinorUnits: number;
  totalCollectiveValueMinorUnits: number;
  maturity: Readonly<{
    capitalContributedMinorUnits: number;
    finalProfitMinorUnits: number;
    totalMaturedValueMinorUnits: number;
    settledToPlaytivesWallet: boolean;
  }> | null;
  earlyExit: Readonly<{
    id: string;
    status: 'REQUESTED' | 'COMPLETED';
    capitalMinorUnits: number;
    forfeitedProfitMinorUnits: number;
    settlementTimeframe: string;
    eligibleSettlementAt: string | null;
    requestedAt: string;
    completedAt: string | null;
  }> | null;
  transactions: CollectiveTransaction[];
  updates: CollectiveUpdate[];
  contributedMinorUnits: number;
  currentCycleContributionMinorUnits: number;
  agreement: Readonly<{
    format: 'TEXT' | 'MARKDOWN' | 'HTML';
    content: string;
    version: number;
    accepted: boolean;
    acceptedAt: string | null;
  }> | null;
  socialProof?: Readonly<{
    memberCount: number;
  }>;
}>;

export type CollectivePortfolioPosition = Readonly<{
  title: string;
  cycleNumber: number | null;
  totalCycles: number;
  status: 'AWAITING_DEPLOYMENT' | 'ACTIVE' | 'COMPLETED';
  activeCapitalMinorUnits: number;
  awaitingDeploymentMinorUnits: number;
  profitToDateMinorUnits: number;
  displayValueMinorUnits: number;
  projectedTargetRateBps: number | null;
}>;

export function getCollectivePortfolioPosition(
  dashboard: CollectiveDashboard,
): CollectivePortfolioPosition | null {
  const hasParticipation =
    dashboard.contributedMinorUnits > 0 ||
    dashboard.scheduledContributions.length > 0 ||
    dashboard.maturity !== null;

  if (!hasParticipation || dashboard.earlyExit) return null;

  const latestPosition = [...dashboard.positions]
    .reverse()
    .find((position) => position.activeMinorUnits > 0 || position.awaitingDeploymentMinorUnits > 0);
  const cycleNumber = dashboard.currentCycle?.number ?? latestPosition?.cycleNumber ?? null;
  const completed = dashboard.maturity !== null;
  const status = completed
    ? 'COMPLETED'
    : dashboard.activeCapitalMinorUnits > 0
      ? 'ACTIVE'
      : 'AWAITING_DEPLOYMENT';

  return {
    title: dashboard.programme?.name || 'The Playtives Wealth Collective',
    cycleNumber,
    totalCycles: dashboard.cycles.length || 12,
    status,
    activeCapitalMinorUnits: dashboard.activeCapitalMinorUnits,
    awaitingDeploymentMinorUnits: dashboard.awaitingDeploymentMinorUnits,
    profitToDateMinorUnits: dashboard.profitToDateMinorUnits,
    displayValueMinorUnits: completed
      ? (dashboard.maturity?.totalMaturedValueMinorUnits ?? 0)
      : dashboard.totalCollectiveValueMinorUnits,
    projectedTargetRateBps: dashboard.programme?.projectedTargetRateBps ?? null,
  };
}

const key = (): string => crypto.randomUUID();
export function getCollectiveDashboard(): Promise<CollectiveDashboard> {
  return api('/v1/collectives/dashboard', { cache: 'no-store' });
}
export function acceptCollectiveAgreement(input: {
  version: number;
  accepted: true;
}): Promise<{ accepted: boolean; version: number }> {
  return api('/v1/collectives/agreement/accept', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
export function getCollectiveActivity(): Promise<CollectiveTransaction[]> {
  return api('/v1/collectives/activity', { cache: 'no-store' });
}
export function setCollectiveMonthlyCommitment(
  amountMinorUnits: number,
): Promise<CollectiveWallet> {
  return api('/v1/collectives/monthly-commitment', {
    method: 'PATCH',
    body: JSON.stringify({ amountMinorUnits }),
  });
}
export function updateCollectiveContributionPlan(
  input: CollectiveContributionPlanInput,
): Promise<CollectiveWallet> {
  return api('/v1/collectives/contribution-plan', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
export function scheduleCollectiveContribution(
  amountMinorUnits: number,
  deployment: NonNullable<CollectiveDashboard['nextDeployment']>,
  monthlyContributionPlan?: CollectiveContributionPlanInput,
): Promise<CollectiveScheduledContribution> {
  return api('/v1/collectives/scheduled-contributions', {
    method: 'POST',
    headers: { 'Idempotency-Key': key() },
    body: JSON.stringify({
      amountMinorUnits,
      cycleId: deployment.cycleId,
      deploymentAt: deployment.deploymentAt,
      windowLabel: deployment.windowLabel,
      ...(monthlyContributionPlan ? { monthlyContributionPlan } : {}),
    }),
  });
}
export function requestCollectiveEarlyExit(): Promise<CollectiveDashboard['earlyExit']> {
  return api('/v1/collectives/early-exit', {
    method: 'POST',
    headers: { 'Idempotency-Key': key() },
    body: JSON.stringify({ acknowledged: true }),
  });
}
export function getAdminCollectiveProgramme(): Promise<{
  programme: CollectiveProgramme;
  cycles: CollectiveCycle[];
}> {
  return api('/v1/admin/collectives/programme', { cache: 'no-store' });
}
export function createCollectiveProgramme(input: {
  name: string;
  startsAt: string;
  firstWindowClosesAt?: string;
  secondWindowClosesAt?: string;
}): Promise<{ programme: CollectiveProgramme; cycles: CollectiveCycle[] }> {
  return api('/v1/admin/collectives/programme', { method: 'POST', body: JSON.stringify(input) });
}
export function reconcileCollectiveCycle(
  cycleId: string,
  actualReturnRateBps: number,
): Promise<CollectiveCycle> {
  return api(`/v1/admin/collectives/cycles/${cycleId}/reconcile`, {
    method: 'POST',
    body: JSON.stringify({ actualReturnRateBps }),
  });
}
