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

// Acquisition records will be populated by the acquisition API when that separate scope is built.
export const ownedOpportunities: readonly OwnedOpportunity[] = [];

export const ownershipTotal = ownedOpportunities
  .filter((item) => item.status === 'active')
  .reduce((total, item) => total + item.contribution, 0);

export function getOwnedOpportunity(id: string): OwnedOpportunity | undefined {
  return ownedOpportunities.find((item) => item.id === id);
}
