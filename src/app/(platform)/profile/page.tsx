'use client';

import { ProfileDashboard } from '@/components/profile/profile-dashboard';
import { notify } from '@/lib/notify';
import { useAuthStore } from '@/stores/use-auth-store';

export default function ProfilePage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  if (!user) return <></>;

  return (
    <ProfileDashboard
      user={user}
      onSignOut={() => {
        signOut();
        notify.info('You have signed out.');
      }}
    />
  );
}
