
import { supabase } from '@/integrations/supabase/client';

export interface Language {
  id: number;
  name: string;
  code: string;
  is_default: boolean;
}

export const languageService = {
  async getAll(): Promise<Language[]> {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
};
