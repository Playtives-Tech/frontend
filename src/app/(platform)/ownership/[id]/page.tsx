'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OwnershipPositionDetail } from '@/components/ownership/ownership-position-detail';
import { getOwnership, type Ownership } from '@/lib/services/ownership-service';

export default function OwnershipDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [ownership, setOwnership] = useState<Ownership>();
  const [error, setError] = useState('');
  useEffect(() => { void getOwnership(id).then(setOwnership).catch((value: unknown) => setError(value instanceof Error ? value.message : 'Ownership not found')); }, [id]);
  if (error) return <div className="mx-auto max-w-5xl p-10 text-sm text-destructive">{error}</div>;
  if (!ownership) return <div className="mx-auto max-w-5xl p-10 text-sm text-muted-foreground">Loading ownership…</div>;
  return <OwnershipPositionDetail ownership={ownership} />;
}
