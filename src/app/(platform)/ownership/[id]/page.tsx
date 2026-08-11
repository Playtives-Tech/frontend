'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OwnershipPositionDetail } from '@/components/ownership/ownership-position-detail';
import {
  getMaturityPayouts,
  getOwnership,
  type MemberMaturityPayout,
  type Ownership,
} from '@/lib/services/ownership-service';

export default function OwnershipDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [ownership, setOwnership] = useState<Ownership>();
  const [error, setError] = useState('');
  const [payout, setPayout] = useState<MemberMaturityPayout>();
  useEffect(() => {
    void Promise.all([getOwnership(id), getMaturityPayouts()])
      .then(([record, payouts]) => {
        setOwnership(record);
        setPayout(payouts.find((item) => item.ownershipId === id));
      })
      .catch((value: unknown) =>
        setError(value instanceof Error ? value.message : 'Ownership not found'),
      );
  }, [id]);
  if (error) return <div className="text-destructive mx-auto max-w-5xl p-10 text-sm">{error}</div>;
  if (!ownership)
    return (
      <div className="mx-auto max-w-5xl p-10 text-sm text-muted-foreground">Loading ownership…</div>
    );
  return <OwnershipPositionDetail ownership={ownership} payout={payout} />;
}
