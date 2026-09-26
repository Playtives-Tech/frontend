import { CommunityMembershipNotice } from '@/components/auth/community-membership-notice';

export default function CommunityMembershipPage(): React.JSX.Element {
  return (
    <main className="app-background grid min-h-dvh place-items-center px-5 py-10">
      <CommunityMembershipNotice />
    </main>
  );
}
