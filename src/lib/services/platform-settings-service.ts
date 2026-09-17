import { api } from '@/lib/api';

export type MaintenanceStatus = Readonly<{
  enabled: boolean;
  message: string;
  updatedAt: string | null;
}>;

export function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  return api<MaintenanceStatus>('/v1/platform/maintenance', { cache: 'no-store' });
}
