import { supabase } from "@/integrations/supabase/client";

// Language helpers
export const getDefaultLanguage = async () => {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('is_default', true)
      .single();
    
    if (error) {
      console.error('Error fetching default language:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getDefaultLanguage:', error);
    throw error;
  }
};

export const getLanguages = async () => {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('is_default', { ascending: false });
    
    if (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error in getLanguages:', error);
    throw error;
  }
};

// Theme helpers
export const getThemeSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching theme settings:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getThemeSettings:', error);
    throw error;
  }
};

// Navigation helpers
export const getNavigation = async (languageId: number) => {
  try {
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
      
      if (isSpanish && (item.url === '/contacto' || item.url === '/ficha-tecnica' || item.url === '/prensa')) {
        return false;
      }
      
      if (isEnglish && item.url === '/contacto') {
        return false;
      }
      
      return true;
    });

    return filteredData || [];
  } catch (error) {
    console.error('Error in getNavigation:', error);
    return [];
  }
};

// Page helpers
export const getPageBySlug = async (slug: string, languageId: number) => {
  try {
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
    return data;
  } catch (error) {
    console.error('Error in getPageBySlug:', error);
    throw error;
  }
};

// Track helpers
export const getTracks = async (languageId: number) => {
  try {
    console.log(`Getting tracks for language ${languageId}`);
    
    const { data, error } = await supabase
      .from('tracks')
      .select(`
        *,
        track_contents!inner(*),
        videos(*, video_contents(*)),
        track_featured_images(*),
        track_cta_settings(*)
      `)
      .eq('track_contents.language_id', languageId)
      .eq('status', 'published')
      .order('order_position');
    
    if (error) {
      console.error('Error fetching tracks:', error);
      throw error;
    }
    
    console.log('Fetched tracks data:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getTracks:', error);
    throw error;
  }
};

export const getTrackWithContent = async (trackId: number, languageId: number) => {
  try {
    console.log(`Getting track ${trackId} for language ${languageId}`);
    
    const { data, error } = await supabase
      .from('tracks')
      .select(`
        *,
        track_contents(*),
        track_quotes(*),
        track_featured_images(*),
        track_cta_settings(*),
        videos(*, video_contents(*))
      `)
      .eq('id', trackId)
      .eq('status', 'published')
      .single();
    
    if (error) {
      console.error('Error fetching track:', error);
      throw error;
    }

    // Filter content by language
    const filteredData = {
      ...data,
      track_contents: data.track_contents?.filter(content => content.language_id === languageId) || [],
      track_quotes: data.track_quotes?.filter(quote => quote.language_id === languageId) || [],
      videos: data.videos?.map(video => ({
        ...video,
        video_contents: video.video_contents?.filter(content => content.language_id === languageId) || []
      })) || []
    };
    
    console.log('Filtered track data:', filteredData);
    return filteredData;
  } catch (error) {
    console.error('Error in getTrackWithContent:', error);
    throw error;
  }
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
    .from('cta_buttons')
    .select(`
      *,
      cta_button_contents(*)
    `)
    .order('order_position');
  
  if (error) throw error;
  
  // Filter contents by language_id on the client side
  const filteredData = data?.map((button: any) => ({
    ...button,
    cta_button_contents: button.cta_button_contents?.filter((content: any) => content.language_id === languageId) || []
  }));
  
  return filteredData;
};

export const getAllCTAButtons = async () => {
  const { data, error } = await supabase
    .from('cta_buttons')
    .select(`
      *,
      cta_button_contents(*)
    `)
    .order('key');
  
  if (error) throw error;
  return data;
};

// Track CTA Settings helpers
export const getTrackCTASettings = async (trackId: number) => {
  const { data, error } = await supabase
    .from('track_cta_settings')
    .select('*')
    .eq('track_id', trackId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
  return data;
};

// Helper function to get track CTA labels in the correct language
export const getTrackCTALabels = (ctaSettings: any, currentLanguage: any) => {
  console.log('getTrackCTALabels called with:', { ctaSettings, currentLanguage });
  
  // Provide default values if ctaSettings or currentLanguage are missing
  if (!ctaSettings || !currentLanguage) {
    console.log('Missing ctaSettings or currentLanguage, using defaults');
    return {
      textsLabel: currentLanguage?.code === 'en' ? 'Texts' : 'Textos',
      videosLabel: 'Videos', 
      photosLabel: currentLanguage?.code === 'en' ? 'Photos' : 'Fotos'
    };
  }

  const isEnglish = currentLanguage.code === 'en';
  
  const labels = {
    textsLabel: isEnglish ? (ctaSettings.texts_label_en || 'Texts') : (ctaSettings.texts_label_es || 'Textos'),
    videosLabel: isEnglish ? (ctaSettings.videos_label_en || 'Videos') : (ctaSettings.videos_label_es || 'Videos'),
    photosLabel: isEnglish ? (ctaSettings.photos_label_en || 'Photos') : (ctaSettings.photos_label_es || 'Fotos')
  };
  
  console.log('Returning labels:', labels);
  return labels;
};
