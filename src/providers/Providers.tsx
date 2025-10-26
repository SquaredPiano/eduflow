'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { Auth0Provider as Auth0ClientProvider } from '@/providers/Auth0Provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0ClientProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Auth0ClientProvider>
  );
}
