'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage(): React.JSX.Element {
  const router = useRouter();
  useEffect(() => router.replace('/'), [router]);
  return <main className="app-background min-h-dvh" />;
}
