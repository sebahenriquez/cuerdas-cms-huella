
import { useState, useEffect } from 'react';
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

  // Fetch languages
  const { data: languages = [], isLoading: languagesLoading, error: languagesError } = useSupabaseQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      console.log('Fetching languages...');
      const languages = await getLanguages();
      console.log('Languages fetched:', languages);
      return languages;
    }
  });

  // Fetch track data only if trackId > 0
  const { data: existingTrack, isLoading: trackLoading, error: trackError } = useSupabaseQuery({
    queryKey: ['track', trackId],
    queryFn: async () => {
      console.log('Fetching track data for ID:', trackId);
      
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
      
      console.log('Track data fetched:', data);
      return data;
    },
    enabled: trackId > 0
  });

  // Combine loading states
  const isLoading = languagesLoading || trackLoading;
  const error = languagesError || trackError;

  // Function to ensure content for all languages
  const ensureContentForAllLanguages = (existingContents: TrackContent[], languages: Language[]) => {
    console.log('Ensuring content for all languages');
    
    return languages.map(language => {
      const existingContent = existingContents.find(content => content.language_id === language.id);
      if (existingContent) {
        return existingContent;
      }
      
      return {
        title: '',
        menu_title: '',
        description: '',
        long_text_content: '',
        hero_image_url: '',
        language_id: language.id
      };
    });
  };

  // Update track data when dependencies change
  useEffect(() => {
    if (languages.length === 0) return;

    if (existingTrack) {
      console.log('Processing existing track data');
      
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
        cta_settings: existingTrack.track_cta_settings?.[0] || {
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
      
      console.log('Setting transformed track data:', transformedTrack);
      setTrackData(transformedTrack);
    } else if (trackId === 0) {
      console.log('Initializing new track');
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
      const updatedContents = [...(prev.track_contents || [])];
      const contentIndex = updatedContents.findIndex(c => c.language_id === languageId);
      
      if (contentIndex >= 0) {
        updatedContents[contentIndex] = {
          ...updatedContents[contentIndex],
          [field]: value
        };
      } else {
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
