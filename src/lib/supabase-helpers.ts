
import { supabase } from "@/integrations/supabase/client";

// Language helpers
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

// Theme helpers
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

// Navigation helpers
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

// Page helpers
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
  console.log('Uploading media file:', file.name);
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

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

    if (error) {
      console.error('Error saving media file record:', error);
      throw error;
    }
    
    console.log('Media uploaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in uploadMedia:', error);
    throw error;
  }
};

// Video helpers
export const getVideosByTrack = async (trackId: number, languageId: number) => {
  try {
    console.log('Fetching videos for track:', trackId, 'language:', languageId);
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        video_contents!inner(*)
      `)
      .eq('track_id', trackId)
      .eq('video_contents.language_id', languageId)
      .order('order_position');
    
    if (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
    
    console.log('Videos fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getVideosByTrack:', error);
    throw error;
  }
};

// Gallery helpers
export const getTrackGallery = async (trackId: number) => {
  try {
    console.log('Fetching gallery for track:', trackId);
    const { data, error } = await supabase
      .from('image_galleries')
      .select(`
        *,
        gallery_images(*, media_files(*))
      `)
      .eq('track_id', trackId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching gallery:', error);
      throw error;
    }
    
    console.log('Gallery fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getTrackGallery:', error);
    throw error;
  }
};

export const getTrackQuotes = async (trackId: number, languageId: number) => {
  try {
    console.log('Fetching quotes for track:', trackId, 'language:', languageId);
    const { data, error } = await supabase
      .from('track_quotes')
      .select('*')
      .eq('track_id', trackId)
      .eq('language_id', languageId)
      .order('order_position');
    
    if (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }
    
    console.log('Quotes fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getTrackQuotes:', error);
    throw error;
  }
};

// CTA Button helpers
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

// Track CTA Settings helpers
export const getTrackCTASettings = async (trackId: number) => {
  try {
    console.log('Fetching CTA settings for track:', trackId);
    const { data, error } = await supabase
      .from('track_cta_settings')
      .select('*')
      .eq('track_id', trackId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching track CTA settings:', error);
      throw error;
    }
    
    console.log('Track CTA settings fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getTrackCTASettings:', error);
    throw error;
  }
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
