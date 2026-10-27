'use client';

import { useParams } from 'next/navigation';
import { LegacyOwnershipDetailPage } from '@/components/ownership/legacy-ownerships';

export default function Page(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  return <LegacyOwnershipDetailPage id={id} />;
}
