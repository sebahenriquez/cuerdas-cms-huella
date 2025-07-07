
import { supabase } from "@/integrations/supabase/client";

export const getCTAButtons = async (languageId: number) => {
  try {
    console.log('Fetching CTA buttons for language:', languageId);
    const { data, error } = await supabase
      .from('cta_buttons')
      .select(`
        *,
        cta_button_contents(*)
      `)
      .order('order_position');
    
    if (error) {
      console.error('Error fetching CTA buttons:', error);
      throw error;
    }
    
    // Filter contents by language_id on the client side
    const filteredData = data?.map((button: any) => ({
      ...button,
      cta_button_contents: button.cta_button_contents?.filter((content: any) => content.language_id === languageId) || []
    }));
    
    console.log('CTA buttons fetched successfully:', filteredData);
    return filteredData;
  } catch (error) {
    console.error('Error in getCTAButtons:', error);
    throw error;
  }
};

export const getAllCTAButtons = async () => {
  try {
    console.log('Fetching all CTA buttons...');
    const { data, error } = await supabase
      .from('cta_buttons')
      .select(`
        *,
        cta_button_contents(*)
      `)
      .order('key');
    
    if (error) {
      console.error('Error fetching all CTA buttons:', error);
      throw error;
    }
    
    console.log('All CTA buttons fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getAllCTAButtons:', error);
    throw error;
  }
};
