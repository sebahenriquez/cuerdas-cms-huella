
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getLanguages } from '@/lib/supabase-helpers';

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
    id: trackId,
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

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages
  });

  const { data: existingTrack, isLoading, error } = useQuery({
    queryKey: ['track', trackId],
    queryFn: async () => {
      console.log('Fetching track data for ID:', trackId);
      
      // Primero verificar si el track existe
      const { data: trackExists, error: trackError } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', trackId)
        .maybeSingle();
      
      if (trackError) {
        console.error('Error checking if track exists:', trackError);
        throw trackError;
      }
      
      if (!trackExists) {
        console.log('Track does not exist, will create new one');
        return null;
      }
      
      // Si existe, obtener todos los datos relacionados
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
        console.error('Error fetching track data:', error);
        throw error;
      }
      
      console.log('Successfully fetched track data:', data);
      return data;
    },
    enabled: trackId > 0,
    retry: 1
  });

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
    console.log('useTrackData useEffect triggered with:', { 
      existingTrack: existingTrack ? 'found' : 'not found', 
      languages: languages.length,
      trackId,
      error: error?.message
    });
    
    if (languages.length > 0) {
      if (existingTrack) {
        console.log('Processing existing track data:', existingTrack);
        
        // Asegurar contenido para todos los idiomas
        const completeTrackContents = ensureContentForAllLanguages(
          existingTrack.track_contents || [], 
          languages
        );
        
        const transformedTrack = {
          id: existingTrack.id,
          order_position: existingTrack.order_position,
          audio_url: existingTrack.audio_url || '',
          status: existingTrack.status || 'published',
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
      } else {
        // Para tracks que no existen o nuevos, inicializar con contenido vacío
        console.log('Initializing track with empty content for all languages');
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
          id: trackId,
          track_contents: emptyContents
        }));
      }
    }
  }, [existingTrack, languages, trackId, error]);

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
