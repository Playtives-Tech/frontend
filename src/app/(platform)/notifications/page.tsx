import { Bell } from 'lucide-react';
import { EmptyPage } from '@/components/navigation/empty-page';
export default function NotificationsPage(): React.JSX.Element {
  return (
    <EmptyPage
      eyebrow="Updates"
      title="Notifications"
      description="Important activity, investment updates, and account messages will appear here."
      icon={Bell}
    />
  );
}
