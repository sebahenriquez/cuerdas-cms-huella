
import { supabase } from "@/integrations/supabase/client";

export const getNavigation = async (languageId: number) => {
  try {
    console.log('Fetching navigation for language:', languageId);
    const { data, error } = await supabase
      .from('navigation_items')
      .select(`
        *,
        navigation_contents!inner(
          title,
          language_id
        )
      `)
      .eq('navigation_contents.language_id', languageId)
      .order('order_position');

    if (error) {
      console.error('Error fetching navigation:', error);
      return [];
    }

    // Filter out specific items based on language
    const filteredData = data?.filter(item => {
      const isSpanish = languageId === 1;
      const isEnglish = languageId === 2;
      
      if (isSpanish && (item.url === '/contacto' || item.url === '/ficha-tecnica')) {
        return false;
      }
      
      if (isEnglish && item.url === '/contacto') {
        return false;
      }
      
      return true;
    });

    console.log('Navigation fetched successfully:', filteredData);
    return filteredData || [];
  } catch (error) {
    console.error('Error in getNavigation:', error);
    return [];
  }
};
