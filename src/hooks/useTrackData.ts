
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

  const { data: existingTrack, isLoading } = useQuery({
    queryKey: ['track', trackId],
    queryFn: async () => {
      if (trackId === 0) return null;
      
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
        console.error('Error fetching track:', error);
        throw error;
      }
      
      console.log('Fetched track data:', data);
      return data;
    },
    enabled: trackId > 0
  });

  useEffect(() => {
    if (existingTrack) {
      console.log('Processing existing track data:', existingTrack);
      console.log('CTA settings from DB:', existingTrack.track_cta_settings);
      
      const transformedTrack = {
        ...existingTrack,
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
      
      console.log('Transformed track data:', transformedTrack);
      console.log('Final CTA settings:', transformedTrack.cta_settings);
      
      setTrackData(transformedTrack);
    } else if (languages.length > 0 && trackData.track_contents.length === 0) {
      // Initialize new track with default content for all languages
      setTrackData(prev => ({
        ...prev,
        track_contents: languages.map(lang => ({
          title: '',
          menu_title: '',
          description: '',
          long_text_content: '',
          hero_image_url: '',
          language_id: lang.id
        }))
      }));
    }
  }, [existingTrack, languages]);

  const updateTrackContent = (languageId: number, field: keyof TrackContent, value: string) => {
    console.log(`Updating content for language ${languageId}, field ${field}:`, value);
    setTrackData(prev => ({
      ...prev,
      track_contents: prev.track_contents?.map(content =>
        content.language_id === languageId
          ? { ...content, [field]: value }
          : content
      ) || []
    }));
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
    updateTrackContent,
    updateVideoContent
  };
};

export type { TrackData, TrackContent, VideoContent, VideoData, PhotoData, TrackCTASettings, Language };
