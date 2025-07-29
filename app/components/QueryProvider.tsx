'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// QueryProvider component for React Query configuration with optimized settings
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (replaces cacheTime)
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        // Enable background refetching for better UX
        refetchInterval: false,
        // Network mode optimizations
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
        networkMode: 'online',
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}