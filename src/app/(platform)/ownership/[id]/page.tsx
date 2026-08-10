import { notFound } from 'next/navigation';
import { OwnershipPositionDetail } from '@/components/ownership/ownership-position-detail';
import { getOpportunity } from '@/lib/opportunities';
import { getOwnedOpportunity } from '@/lib/ownership';

type OwnershipDetailPageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function OwnershipDetailPage({
  params,
}: OwnershipDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const ownership = getOwnedOpportunity(id);
  if (!ownership) notFound();
  const opportunity = await getOpportunity(ownership.opportunitySlug).catch(() => null);
  if (!opportunity) notFound();
  return <OwnershipPositionDetail ownership={ownership} opportunity={opportunity} />;
}
