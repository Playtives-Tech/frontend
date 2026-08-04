import { notFound } from 'next/navigation';
import { OwnershipFlow } from '@/components/ownership/ownership-flow';
import { opportunities } from '@/lib/opportunities';

type OpportunityDetailPageProps = Readonly<{ params: Promise<{ slug: string }> }>;

export default async function OpportunityDetailPage({
  params,
}: OpportunityDetailPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const opportunity = opportunities.find((item) => item.slug === slug);
  if (!opportunity) notFound();
  return <OwnershipFlow opportunity={opportunity} />;
}
