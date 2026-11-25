'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OwnershipFlow } from '@/components/ownership/ownership-flow';
import { OpportunityInterestFlow } from '@/components/opportunities/collective-interest-flow';
import { PageLoadingState } from '@/components/ui/loading-indicator';
import { trackEvent } from '@/lib/product-analytics';
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
  const viewed = useRef('');
  useEffect(() => {
    if (!opportunity) return;
    const key = `${opportunity._id}:${opportunity.memberStatus}`;
    if (viewed.current === key) return;
    viewed.current = key;
    trackEvent('opportunity_viewed', { opportunity_id: opportunity._id, product_type: opportunity.opportunityStructure, sector: opportunity.category });
    if (opportunity.memberStatus === 'FULLY_FUNDED') trackEvent('opportunity_fully_funded_viewed', { opportunity_id: opportunity._id });
  }, [opportunity]);
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
  return opportunity.interestModeEnabled ? (
    <OpportunityInterestFlow opportunity={opportunity} />
  ) : (
    <OwnershipFlow opportunity={opportunity} />
  );
}
