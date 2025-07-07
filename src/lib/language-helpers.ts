
import { supabase } from "@/integrations/supabase/client";

export const getDefaultLanguage = async () => {
  try {
    console.log('Fetching default language...');
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('is_default', true)
      .single();
    
    if (error) {
      console.error('Error fetching default language:', error);
      if (error.code === 'PGRST116') {
        // No default language found, try to get first language
        const { data: firstLang, error: firstError } = await supabase
          .from('languages')
          .select('*')
          .limit(1)
          .single();
        
        if (firstError) {
          throw firstError;
        }
        return firstLang;
      }
      throw error;
    }
    
    console.log('Default language fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getDefaultLanguage:', error);
    throw error;
  }
};

export const getLanguages = async () => {
  try {
    console.log('Fetching all languages...');
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('is_default', { ascending: false });
    
    if (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
    
    console.log('Languages fetched successfully:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getLanguages:', error);
    throw error;
  }
};
