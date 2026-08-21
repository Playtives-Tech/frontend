'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OwnershipFlow } from '@/components/ownership/ownership-flow';
import { PageLoadingState } from '@/components/ui/loading-indicator';
import {
  getOpportunity,
  subscribeToOpportunityChanges,
  type Opportunity,
} from '@/lib/opportunities';
export default function OpportunityDetailPage(): React.JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity>();
  const [error, setError] = useState('');
  useEffect(() => {
    const load = () =>
      getOpportunity(slug)
        .then((value) => {
          setOpportunity(value);
          setError('');
        })
        .catch((value: unknown) =>
          setError(value instanceof Error ? value.message : 'Opportunity not found'),
        );
    void load();
    const unsubscribe = subscribeToOpportunityChanges((event) => {
      if (event.slug !== slug) return;
      if (event.type === 'DELETED') router.replace('/discover');
      else void load();
    });
    const poll = window.setInterval(() => void load(), 15_000);
    return () => {
      unsubscribe();
      window.clearInterval(poll);
    };
  }, [router, slug]);
  if (error) return <div className="text-destructive mx-auto max-w-5xl p-10 text-sm">{error}</div>;
  if (!opportunity) return <PageLoadingState label="Loading opportunity" />;
  return <OwnershipFlow opportunity={opportunity} />;
}
