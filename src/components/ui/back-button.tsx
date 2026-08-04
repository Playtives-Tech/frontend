'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton({ label = 'Back' }: Readonly<{ label?: string }>): React.JSX.Element {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted"
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}
