
import { supabase } from "@/integrations/supabase/client";

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

export const getTrackCTALabels = (ctaSettings: any, currentLanguage: any) => {
  console.log('getTrackCTALabels called with:', { ctaSettings, currentLanguage });
  
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
