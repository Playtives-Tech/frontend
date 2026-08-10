'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { OwnershipFlow } from '@/components/ownership/ownership-flow';
import { getOpportunity, type Opportunity } from '@/lib/opportunities';
export default function OpportunityDetailPage(): React.JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const [opportunity, setOpportunity] = useState<Opportunity>();
  const [error, setError] = useState('');
  useEffect(() => {
    getOpportunity(slug)
      .then(setOpportunity)
      .catch((value: unknown) =>
        setError(value instanceof Error ? value.message : 'Opportunity not found'),
      );
  }, [slug]);
  if (error) return <div className="text-destructive mx-auto max-w-5xl p-10 text-sm">{error}</div>;
  if (!opportunity)
    return (
      <div className="mx-auto max-w-5xl p-10 text-sm text-muted-foreground">
        Loading opportunity…
      </div>
    );
  return <OwnershipFlow opportunity={opportunity} />;
}
