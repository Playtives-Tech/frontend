'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { WelcomeToast } from './welcome-toast';
import { useProfileStore } from '@/stores/use-profile-store';
import { useAuthStore } from '@/stores/use-auth-store';
type AppProvidersProps = Readonly<{ children: ReactNode }>;
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false, retry: 1 },
      mutations: { retry: 0 },
    },
  });
}
export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    void useProfileStore.persist.rehydrate();
    void useAuthStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <WelcomeToast />
      <Toaster />
    </QueryClientProvider>
  );
}
