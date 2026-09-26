import { api } from '@/lib/api';

export type ParticipationAccessRequest = Readonly<{
  _id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type ParticipationAccessStatus = Readonly<{
  memberStatus: 'community' | 'pending' | 'active';
  approved: boolean;
  request: ParticipationAccessRequest | null;
}>;

export function getParticipationAccess(): Promise<ParticipationAccessStatus> {
  return api('/v1/member/participation-access', { cache: 'no-store' });
}

export function requestParticipationAccess(message?: string): Promise<ParticipationAccessRequest> {
  return api('/v1/member/participation-access/requests', {
    method: 'POST',
    body: JSON.stringify({ message: message?.trim() || undefined }),
  });
}
