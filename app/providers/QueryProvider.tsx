// @ts-nocheck
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { logger } from '../utils/logger';

// Conditional import for React Query DevTools (only in development)
let ReactQueryDevtools: any = null;
if (__DEV__) {
  try {
    ReactQueryDevtools = require('@tanstack/react-query-devtools').ReactQueryDevtools;
  } catch (error) {
    // DevTools not installed - this is fine for production
    logger.debug('React Query DevTools not available - skipping import');
  }
}

// Enhanced React Query configuration with best practices (v5 compatible)
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Performance optimizations
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
        gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (v5 renamed from cacheTime)
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors or validation errors
          if (error?.code === 'AUTH_ERROR' || error?.code === 'VALIDATION_ERROR') {
            return false;
          }

          // Retry up to 3 times
          return failureCount < 3;
        },
        retryDelay: attemptIndex => Math.min(1000 * Math.pow(2, attemptIndex), 30000),

        // Network optimization
        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        refetchOnReconnect: true, // Refetch when network reconnects
        refetchOnMount: true, // Refetch when component mounts

        // Suspense mode for better UX
        suspense: false, // Disable suspense mode for now

        // Background refetching
        refetchInterval: false, // Disable automatic refetching
      },

      mutations: {
        // Mutation configuration
        retry: (failureCount, error: any) => {
          // Don't retry mutations on auth errors
          if (error?.code === 'AUTH_ERROR') {
            return false;
          }

          // Retry mutations up to 2 times
          return failureCount < 2;
        },

        retryDelay: attemptIndex => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
      },
    },
  });
};

// Create query client instance
const queryClient = createQueryClient();

// Set up global error handlers (v5 compatible way)
queryClient.getQueryCache().subscribe((event) => {
  if (event?.type === 'error') {
    logger.error('Global query cache error:', event?.error);
  }
});

queryClient.getMutationCache().subscribe((event) => {
  if (event?.type === 'success') {
    logger.debug('Global mutation success:', {
      mutationKey: event?.mutation?.options?.mutationKey,
      variables: event?.mutation?.state?.variables,
    });
  }
  if (event?.type === 'error') {
    logger.error('Global mutation error:', event?.error);
  }
});

// Global error handlers are now set up via cache subscriptions above

// Detect TanStack Query version for compatibility
const detectQueryVersion = () => {
  try {
    const queryCache = queryClient.getQueryCache();

    // Check for v5 specific methods
    if (queryCache && typeof queryCache.size === 'number') {
      return 'v5';
    }

    // Check for v4 specific methods
    if (queryCache && typeof queryCache.getAll === 'function') {
      return 'v4';
    }

    return 'unknown';
  } catch (error) {
    logger.warn('Could not detect TanStack Query version:', error);
    return 'unknown';
  }
};

// Simplified UI-only QueryProvider (no backend connection checks)
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryVersion = useRef(detectQueryVersion());

  // Performance monitoring - TanStack Query v5 compatible
  useEffect(() => {
    if (__DEV__) {
      logger.debug(`🔍 TanStack Query version detected: ${queryVersion.current}`);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* React Query DevTools - only in development and when available */}
      {__DEV__ && ReactQueryDevtools && typeof ReactQueryDevtools === 'function' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

// Export query client for direct access when needed
export { queryClient };
