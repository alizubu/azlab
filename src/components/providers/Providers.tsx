'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(19, 19, 26, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#f8fafc',
            backdropFilter: 'blur(20px)',
          },
        }}
        richColors
      />
    </QueryClientProvider>
  );
}
