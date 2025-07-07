
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useSimpleQuery<T>(
  query: () => Promise<T>,
  deps: any[] = []
): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await query();
        
        if (isMounted) {
          setState({
            data: result,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Query error:', error);
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
}
