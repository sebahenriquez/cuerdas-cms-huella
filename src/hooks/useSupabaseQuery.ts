
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface SupabaseQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  queryFn: () => Promise<T>;
}

export const useSupabaseQuery = <T>(options: SupabaseQueryOptions<T>) => {
  return useQuery({
    ...options,
    retry: (failureCount, error: any) => {
      // Don't retry on certain Supabase errors
      if (error?.code === 'PGRST116' || error?.code === '42P01') {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};
