
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface SupabaseQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  queryFn: () => Promise<T>;
}

export const useSupabaseQuery = <T>(options: SupabaseQueryOptions<T>) => {
  return useQuery({
    ...options,
    retry: (failureCount, error: any) => {
      console.log('Query retry attempt:', failureCount, 'Error:', error);
      
      // Don't retry on certain Supabase errors
      if (error?.code === 'PGRST116' || error?.code === '42P01') {
        console.log('Not retrying due to specific error code:', error.code);
        return false;
      }
      
      // Don't retry on authentication errors
      if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
        console.log('Not retrying due to auth error');
        return false;
      }
      
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000)
  });
};
