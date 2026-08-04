'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-16 max-w-3xl" />
      <Skeleton className="h-6 max-w-xl" />
    </main>
  );
}
