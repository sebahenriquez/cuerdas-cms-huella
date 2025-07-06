
import { supabase } from "@/integrations/supabase/client";

// About sections helpers
export const getAboutSections = async (languageId: number) => {
  const { data, error } = await supabase
    .from('about_sections')
    .select(`
      *,
      about_section_contents!inner(*)
    `)
    .eq('about_section_contents.language_id', languageId)
    .eq('is_active', true)
    .order('order_position');
  
  if (error) throw error;
  return data;
};

export const getAboutSectionContent = async (sectionKey: string, languageId: number) => {
  const { data, error } = await supabase
    .from('about_sections')
    .select(`
      *,
      about_section_contents!inner(*)
    `)
    .eq('section_key', sectionKey)
    .eq('about_section_contents.language_id', languageId)
    .eq('is_active', true)
    .single();
  
  if (error) throw error;
  return data;
};

// Feature cards helpers
export const getAboutFeatureCards = async (languageId: number) => {
  const { data, error } = await supabase
    .from('about_feature_cards')
    .select(`
      *,
      about_feature_card_contents!inner(*)
    `)
    .eq('about_feature_card_contents.language_id', languageId)
    .eq('is_active', true)
    .order('order_position');
  
  if (error) throw error;
  return data;
};

// Project stats helpers
export const getAboutProjectStats = async (languageId: number) => {
  const { data, error } = await supabase
    .from('about_project_stats')
    .select(`
      *,
      about_project_stat_contents!inner(*)
    `)
    .eq('about_project_stat_contents.language_id', languageId)
    .eq('is_active', true)
    .order('order_position');
  
  if (error) throw error;
  return data;
};

// Admin helpers for CMS
export const getAllAboutSections = async () => {
  const { data, error } = await supabase
    .from('about_sections')
    .select(`
      *,
      about_section_contents(*)
    `)
    .order('order_position');
  
  if (error) throw error;
  return data;
};

export const getAllAboutFeatureCards = async () => {
  const { data, error } = await supabase
    .from('about_feature_cards')
    .select(`
      *,
      about_feature_card_contents(*)
    `)
    .order('order_position');
  
  if (error) throw error;
  return data;
};

export const getAllAboutProjectStats = async () => {
  const { data, error } = await supabase
    .from('about_project_stats')
    .select(`
      *,
      about_project_stat_contents(*)
    `)
    .order('order_position');
  
  if (error) throw error;
  return data;
};
