
import { supabase } from "@/integrations/supabase/client";

// Language helpers
export const getDefaultLanguage = async () => {
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .eq('is_default', true)
    .single();
  
  if (error) throw error;
  return data;
};

export const getLanguages = async () => {
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .order('is_default', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Theme helpers
export const getThemeSettings = async () => {
  const { data, error } = await supabase
    .from('theme_settings')
    .select('*')
    .limit(1)
    .single();
  
  if (error) throw error;
  return data;
};

// Navigation helpers
export const getNavigation = async (languageId: number) => {
  const { data, error } = await supabase
    .from('navigation_items')
    .select(`
      *,
      navigation_contents!inner(title)
    `)
    .eq('navigation_contents.language_id', languageId)
    .order('order_position');
  
  if (error) throw error;
  return data;
};

// Page helpers
export const getPageBySlug = async (slug: string, languageId: number) => {
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
  
  if (error) throw error;
  return data;
};

// Track helpers
export const getTracks = async (languageId: number) => {
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      *,
      track_contents!inner(*),
      videos(*, video_contents(*)),
      track_featured_images(*)
    `)
    .eq('track_contents.language_id', languageId)
    .eq('status', 'published')
    .order('order_position');
  
  if (error) throw error;
  return data;
};

export const getTrackWithContent = async (trackId: number, languageId: number) => {
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      *,
      track_contents!inner(*),
      track_quotes(*, language_id),
      track_featured_images(*, media_files(*)),
      videos(*, video_contents(*))
    `)
    .eq('id', trackId)
    .eq('track_contents.language_id', languageId)
    .eq('status', 'published')
    .single();
  
  if (error) throw error;
  return data;
};

// Media helpers
export const uploadMedia = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  // Save to media_files table
  const { data, error } = await supabase
    .from('media_files')
    .insert({
      filename: fileName,
      original_name: file.name,
      file_path: publicUrl,
      file_size: file.size,
      mime_type: file.type
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Video helpers
export const getVideosByTrack = async (trackId: number, languageId: number) => {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      video_contents!inner(*)
    `)
    .eq('track_id', trackId)
    .eq('video_contents.language_id', languageId)
    .order('order_position');
  
  if (error) throw error;
  return data;
};

// Gallery helpers
export const getTrackGallery = async (trackId: number) => {
  const { data, error } = await supabase
    .from('image_galleries')
    .select(`
      *,
      gallery_images(*, media_files(*))
    `)
    .eq('track_id', trackId)
    .single();
  
  if (error) throw error;
  return data;
};

export const getTrackQuotes = async (trackId: number, languageId: number) => {
  const { data, error } = await supabase
    .from('track_quotes')
    .select('*')
    .eq('track_id', trackId)
    .eq('language_id', languageId)
    .order('order_position');
  
  if (error) throw error;
  return data;
};

// CTA Button helpers
export const getCTAButtons = async (languageId: number) => {
  const { data, error } = await supabase
    .from('cta_buttons' as any)
    .select(`
      *,
      cta_button_contents!inner(*)
    `)
    .eq('cta_button_contents.language_id', languageId);
  
  if (error) throw error;
  return data;
};

export const getAllCTAButtons = async () => {
  const { data, error } = await supabase
    .from('cta_buttons' as any)
    .select(`
      *,
      cta_button_contents(*)
    `)
    .order('key');
  
  if (error) throw error;
  return data;
};
