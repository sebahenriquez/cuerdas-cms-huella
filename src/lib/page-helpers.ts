
import { supabase } from "@/integrations/supabase/client";

export const getPageBySlug = async (slug: string, languageId: number) => {
  try {
    console.log('Fetching page by slug:', slug, 'for language:', languageId);
    const { data, error } = await supabase
      .from('pages')
      .select(`
        *,
        page_contents!inner(*)
      `)
      .eq('slug', slug)
      .eq('page_contents.language_id', languageId)
      .eq('status', 'published')
      .single();
    
    if (error) {
      console.error('Error fetching page by slug:', error);
      throw error;
    }
    
    console.log('Page fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getPageBySlug:', error);
    throw error;
  }
};

export const getThemeSettings = async () => {
  try {
    console.log('Fetching theme settings...');
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching theme settings:', error);
      throw error;
    }
    
    console.log('Theme settings fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getThemeSettings:', error);
    throw error;
  }
};
