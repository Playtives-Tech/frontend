import { opportunities } from './opportunities';

export type OwnedOpportunity = Readonly<{
  id: string;
  opportunitySlug: string;
  cycle: string;
  positions: number;
  contribution: number;
  roi: string;
  progress: number;
  expectedCompletion: string;
  status: 'active' | 'completed';
  distribution: number;
}>;

export const ownedOpportunities: readonly OwnedOpportunity[] = [
  {
    id: 'own-palm-05',
    opportunitySlug: opportunities[0].slug,
    cycle: 'Cycle 05',
    positions: 2,
    contribution: 15_000_000,
    roi: '18.4%',
    progress: 68,
    expectedCompletion: '18 Sep 2026',
    status: 'active',
    distribution: 0,
  },
  {
    id: 'own-student-01',
    opportunitySlug: opportunities[2].slug,
    cycle: 'Development',
    positions: 1,
    contribution: 8_200_000,
    roi: '15.2%',
    progress: 35,
    expectedCompletion: '12 Jan 2027',
    status: 'active',
    distribution: 0,
  },
  {
    id: 'own-logistics-03',
    opportunitySlug: opportunities[1].slug,
    cycle: 'Operating',
    positions: 1,
    contribution: 7_800_000,
    roi: '16.8%',
    progress: 52,
    expectedCompletion: '03 Nov 2026',
    status: 'active',
    distribution: 0,
  },
  {
    id: 'own-palm-04',
    opportunitySlug: opportunities[0].slug,
    cycle: 'Cycle 04',
    positions: 1,
    contribution: 7_500_000,
    roi: '18.4%',
    progress: 100,
    expectedCompletion: 'Completed 14 Jul 2026',
    status: 'completed',
    distribution: 1_125_000,
  },
] as const;

export const ownershipTotal = ownedOpportunities
  .filter((item) => item.status === 'active')
  .reduce((total, item) => total + item.contribution, 0);

export function getOwnedOpportunity(id: string): OwnedOpportunity | undefined {
  return ownedOpportunities.find((item) => item.id === id);
}
