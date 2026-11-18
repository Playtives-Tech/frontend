import { api } from '@/lib/api';

export type WealthGoal = {
  monthlyTargetMinorUnits: number | null;
  targetPortfolioMinorUnits: number | null;
  assumptionMonthlyPercent: number;
  updatedAt: string | null;
};

export function getWealthGoal(): Promise<WealthGoal> {
  return api<WealthGoal>('/v1/member/wealth-goal');
}

export function saveWealthGoal(monthlyTargetMinorUnits: number): Promise<WealthGoal> {
  return api<WealthGoal>('/v1/member/wealth-goal', {
    method: 'PATCH',
    body: JSON.stringify({ monthlyTargetMinorUnits }),
  });
}
