import { api } from '@/lib/api';

export type PortfolioPosition = Readonly<{
  id: string;
  kind: 'CO_FUNDING' | 'CO_OWNERSHIP' | 'FULL_OWNERSHIP' | 'COLLECTIVE';
  title: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  statusLabel: string;
  capitalMinorUnits: number;
  originalCapitalMinorUnits: number;
  pendingMinorUnits: number;
  confirmedReturnMinorUnits: number;
  projectedReturnMinorUnits: number | null;
  returnType:
    | 'MONTHLY_INCOME'
    | 'YEARLY_INCOME'
    | 'AT_MATURITY'
    | 'VARIABLE_PROFIT_SHARE'
    | 'COMPOUNDED'
    | 'NO_CURRENT_INCOME';
  sector: string | null;
  imageUrl: string | null;
  maturityAt: string | null;
  completedAt: string | null;
  href: string;
}>;

export type Portfolio = Readonly<{
  productivePortfolioMinorUnits: number;
  pendingCapitalMinorUnits: number;
  pendingDeploymentMinorUnits: number;
  pendingSettlementMinorUnits: number;
  availableWalletMinorUnits: number;
  confirmedReturnsMinorUnits: number;
  activePositionCount: number;
  wealthBuilderScore: Readonly<{
    score: number;
    maximum: number;
    band: string;
    explanation: string;
    components: Readonly<
      Record<
        'active' | 'repeat' | 'consistency' | 'longevity' | 'goal',
        Readonly<{ points: number; maximum: number }>
      >
    >;
  }>;
  allocation: ReadonlyArray<
    Readonly<{ kind: PortfolioPosition['kind']; amountMinorUnits: number }>
  >;
  sectors: ReadonlyArray<Readonly<{ sector: string; amountMinorUnits: number }>>;
  returnTypes: ReadonlyArray<
    Readonly<{ type: PortfolioPosition['returnType']; activePositions: number }>
  >;
  returnsHistory: ReadonlyArray<
    Readonly<{
      title: string;
      amountMinorUnits: number;
      occurredAt: string;
      kind: 'DISTRIBUTION' | 'ROLLOVER' | 'MATURITY';
    }>
  >;
  upcoming: ReadonlyArray<
    Readonly<{ title: string; expectedAt: string; href: string; label: string }>
  >;
  positions: ReadonlyArray<PortfolioPosition>;
}>;

export function getPortfolio(): Promise<Portfolio> {
  return api<Portfolio>('/v1/member/portfolio', { cache: 'no-store' });
}
