
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getLanguages } from '@/lib/supabase-helpers';
import { useSupabaseQuery } from './useSupabaseQuery';

interface Language {
  id: number;
  name: string;
  code: string;
}

interface TrackContent {
  id?: number;
  title: string;
  menu_title: string;
  description: string;
  long_text_content: string;
  hero_image_url: string;
  language_id: number;
}

interface VideoContent {
  id?: number;
  title: string;
  description: string;
  language_id: number;
}

interface VideoData {
  id?: number;
  vimeo_url: string;
  thumbnail_url?: string;
  order_position: number;
  video_contents?: VideoContent[];
}

interface PhotoData {
  id?: number;
  media_file_id?: number;
  caption_es: string;
  caption_en: string;
  order_position: number;
  image_url?: string;
}

interface TrackCTASettings {
  show_texts: boolean;
  show_videos: boolean;
  show_photos: boolean;
  texts_label_es?: string;
  texts_label_en?: string;
  videos_label_es?: string;
  videos_label_en?: string;
  photos_label_es?: string;
  photos_label_en?: string;
}

interface TrackData {
  id: number;
  order_position: number;
  audio_url: string;
  status: string;
  track_contents: TrackContent[];
  videos?: VideoData[];
  photos?: PhotoData[];
  track_featured_images?: any[];
  cta_settings?: TrackCTASettings;
}

export const useTrackData = (trackId: number) => {
  const [trackData, setTrackData] = useState<Partial<TrackData>>({
    order_position: 1,
    audio_url: '',
    status: 'published',
    track_contents: [],
    videos: [],
    photos: [],
    cta_settings: {
      show_texts: true,
      show_videos: true,
      show_photos: true,
      texts_label_es: 'Textos',
      texts_label_en: 'Texts',
      videos_label_es: 'Videos',
      videos_label_en: 'Videos',
      photos_label_es: 'Fotos',
      photos_label_en: 'Photos'
    }
  });

  const { data: languages = [] } = useSupabaseQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      console.log('Fetching languages...');
      try {
        const languages = await getLanguages();
        console.log('Languages fetched successfully:', languages);
        return languages;
      } catch (error) {
        console.error('Error fetching languages:', error);
        throw error;
      }
    }
  });

  const { data: existingTrack, isLoading, error } = useSupabaseQuery({
    queryKey: ['track', trackId],
    queryFn: async () => {
      if (trackId === 0) return null;
      
      console.log('Fetching track data for ID:', trackId);
      
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select(`
            *,
            track_contents(*),
            videos(*, video_contents(*)),
            track_featured_images(*),
            track_cta_settings(*)
          `)
          .eq('id', trackId)
          .single();
        
        if (error) {
          console.error('Supabase error fetching track:', error);
          throw new Error(`Error fetching track: ${error.message}`);
        }
        
        console.log('Track data fetched successfully:', data);
        return data;
      } catch (error) {
        console.error('Error in track fetch query:', error);
        throw error;
      }
    },
    enabled: trackId > 0
  });

  // Log any query errors
  useEffect(() => {
    if (error) {
      console.error('Track data query error:', error);
    }
  }, [error]);

  // Función para asegurar contenido para todos los idiomas
  const ensureContentForAllLanguages = (existingContents: TrackContent[], languages: Language[]) => {
    console.log('Ensuring content for all languages:', { existingContents, languages });
    
    const contentMap = new Map();
    
    // Mapear contenido existente por language_id
    existingContents.forEach(content => {
      contentMap.set(content.language_id, content);
    });
    
    // Asegurar que hay contenido para cada idioma
    const completeContents = languages.map(language => {
      const existingContent = contentMap.get(language.id);
      if (existingContent) {
        console.log(`Found existing content for language ${language.id}:`, existingContent);
        return existingContent;
      } else {
        console.log(`Creating empty content for language ${language.id}`);
        return {
          title: '',
          menu_title: '',
          description: '',
          long_text_content: '',
          hero_image_url: '',
          language_id: language.id
        };
      }
    });
    
    console.log('Complete contents result:', completeContents);
    return completeContents;
  };

  useEffect(() => {
    console.log('useEffect triggered with:', { existingTrack, languages });
    
    if (existingTrack && languages.length > 0) {
      console.log('Processing existing track data:', existingTrack);
      
      // Asegurar contenido para todos los idiomas
      const completeTrackContents = ensureContentForAllLanguages(
        existingTrack.track_contents || [], 
        languages
      );
      
      const transformedTrack = {
        ...existingTrack,
        track_contents: completeTrackContents,
        videos: existingTrack.videos?.map(video => ({
          ...video,
          video_contents: video.video_contents || languages.map(lang => ({
            title: '',
            description: '',
            language_id: lang.id
          }))
        })) || [],
        photos: existingTrack.track_featured_images?.map((photo, index) => ({
          ...photo,
          image_url: photo.image_url || '',
          order_position: photo.order_position || index + 1
        })) || [],
        cta_settings: existingTrack.track_cta_settings?.[0] ? {
          show_texts: existingTrack.track_cta_settings[0].show_texts ?? true,
          show_videos: existingTrack.track_cta_settings[0].show_videos ?? true,
          show_photos: existingTrack.track_cta_settings[0].show_photos ?? true,
          texts_label_es: existingTrack.track_cta_settings[0].texts_label_es || 'Textos',
          texts_label_en: existingTrack.track_cta_settings[0].texts_label_en || 'Texts',
          videos_label_es: existingTrack.track_cta_settings[0].videos_label_es || 'Videos',
          videos_label_en: existingTrack.track_cta_settings[0].videos_label_en || 'Videos',
          photos_label_es: existingTrack.track_cta_settings[0].photos_label_es || 'Fotos',
          photos_label_en: existingTrack.track_cta_settings[0].photos_label_en || 'Photos'
        } : {
          show_texts: true,
          show_videos: true,
          show_photos: true,
          texts_label_es: 'Textos',
          texts_label_en: 'Texts',
          videos_label_es: 'Videos',
          videos_label_en: 'Videos',
          photos_label_es: 'Fotos',
          photos_label_en: 'Photos'
        }
      };
      
      console.log('Final transformed track data:', transformedTrack);
      setTrackData(transformedTrack);
    } else if (!existingTrack && languages.length > 0 && trackId > 0) {
      console.log('Initializing new track with empty content for all languages');
      const emptyContents = languages.map(lang => ({
        title: '',
        menu_title: '',
        description: '',
        long_text_content: '',
        hero_image_url: '',
        language_id: lang.id
      }));
      
      setTrackData(prev => ({
        ...prev,
        track_contents: emptyContents
      }));
    }
  }, [existingTrack, languages, trackId]);

  const updateTrackContent = (languageId: number, field: keyof TrackContent, value: string) => {
    console.log(`Updating content for language ${languageId}, field ${field}:`, value);
    
    setTrackData(prev => {
      const updatedContents = prev.track_contents?.map(content =>
        content.language_id === languageId
          ? { ...content, [field]: value }
          : content
      ) || [];
      
      // Si no existe contenido para este idioma, crearlo
      if (!updatedContents.find(c => c.language_id === languageId)) {
        console.log(`Creating new content entry for language ${languageId}`);
        updatedContents.push({
          title: '',
          menu_title: '',
          description: '',
          long_text_content: '',
          hero_image_url: '',
          language_id: languageId,
          [field]: value
        });
      }
      
      console.log('Updated track contents:', updatedContents);
      
      return {
        ...prev,
        track_contents: updatedContents
      };
    });
  };

  const updateVideoContent = (videoIndex: number, languageId: number, field: keyof VideoContent, value: string) => {
    setTrackData(prev => ({
      ...prev,
      videos: prev.videos?.map((video, index) => 
        index === videoIndex ? {
          ...video,
          video_contents: video.video_contents?.map(content => 
            content.language_id === languageId 
              ? { ...content, [field]: value }
              : content
          )
        } : video
      )
    }));
  };

  return {
    trackData,
    setTrackData,
    languages,
    isLoading,
    error,
    updateTrackContent,
    updateVideoContent
  };
};

export type { TrackData, TrackContent, VideoContent, VideoData, PhotoData, TrackCTASettings, Language };
