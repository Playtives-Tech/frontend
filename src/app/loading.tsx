'use client';

import { PageLoadingState } from '@/components/ui/loading-indicator';

export default function Loading(): React.JSX.Element {
  return <PageLoadingState label="Loading" description="Getting the next screen ready." />;
}
