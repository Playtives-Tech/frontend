import { api } from '@/lib/api';

export type MemberNotification = Readonly<{
  _id: string;
  title: string;
  message: string;
  reason: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
}>;

export type MemberNotificationPage = Readonly<{
  items: MemberNotification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

export const notificationService = {
  list: () => api<MemberNotificationPage>('/v1/notifications?limit=50'),
  unreadCount: () => api<{ count: number }>('/v1/notifications/unread-count'),
  markRead: (notificationId: string) =>
    api<MemberNotification>(`/v1/notifications/${notificationId}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    api<{ updatedCount: number }>('/v1/notifications/read-all', { method: 'PATCH' }),
};
