import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from './query-keys';
export type OwnershipSummary = Readonly<{ totalValue: number; currency: string }>;
export const ownershipSummaryQuery = () =>
  queryOptions({
    queryKey: queryKeys.ownership.summary(),
    queryFn: () => api<OwnershipSummary>('/ownership/summary'),
  });
