
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getLanguages } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import TrackSettingsForm from '@/components/admin/track-edit/TrackSettingsForm';
import CTASettingsForm from '@/components/admin/track-edit/CTASettingsForm';
import VideosSection from '@/components/admin/track-edit/VideosSection';
import PhotosSection from '@/components/admin/track-edit/PhotosSection';
import TrackContentTabs from '@/components/admin/track-edit/TrackContentTabs';

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

const AdminTrackEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudioPlayer();
  const trackId = parseInt(id || '0');

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
      
      if (error) throw error;
      return data;
    },
    enabled: trackId > 0
  });

  useEffect(() => {
    if (existingTrack) {
      console.log('Existing track data:', existingTrack);
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
      console.log('Transformed track data:', transformedTrack);
      setTrackData(transformedTrack);
    } else if (languages.length > 0 && trackData.track_contents.length === 0) {
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

  const saveTrack = useMutation({
    mutationFn: async (data: Partial<TrackData>) => {
      console.log('Saving track data:', data);
      
      if (trackId > 0) {
        // Update existing track
        const { error: trackError } = await supabase
          .from('tracks')
          .update({
            order_position: data.order_position,
            audio_url: data.audio_url,
            status: data.status
          })
          .eq('id', trackId);

        if (trackError) throw trackError;

        // Update or insert track contents
        for (const content of data.track_contents || []) {
          if (content.id) {
            const { error } = await supabase
              .from('track_contents')
              .update(content)
              .eq('id', content.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('track_contents')
              .insert({
                ...content,
                track_id: trackId
              });
            if (error) throw error;
          }
        }

        // Handle videos
        if (data.videos) {
          const currentVideoIds = data.videos.filter(v => v.id).map(v => v.id);
          if (currentVideoIds.length > 0) {
            const { error } = await supabase
              .from('videos')
              .delete()
              .eq('track_id', trackId)
              .not('id', 'in', `(${currentVideoIds.join(',')})`);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('videos')
              .delete()
              .eq('track_id', trackId);
            if (error) throw error;
          }

          for (const video of data.videos) {
            if (video.id) {
              const { error } = await supabase
                .from('videos')
                .update({
                  vimeo_url: video.vimeo_url,
                  thumbnail_url: video.thumbnail_url,
                  order_position: video.order_position
                })
                .eq('id', video.id);
              if (error) throw error;

              for (const content of video.video_contents || []) {
                if (content.id) {
                  const { error: contentError } = await supabase
                    .from('video_contents')
                    .update({
                      title: content.title,
                      description: content.description
                    })
                    .eq('id', content.id);
                  if (contentError) throw contentError;
                } else {
                  const { error: contentError } = await supabase
                    .from('video_contents')
                    .insert({
                      video_id: video.id,
                      language_id: content.language_id,
                      title: content.title,
                      description: content.description
                    });
                  if (contentError) throw contentError;
                }
              }
            } else {
              const { data: newVideo, error } = await supabase
                .from('videos')
                .insert({
                  track_id: trackId,
                  vimeo_url: video.vimeo_url,
                  thumbnail_url: video.thumbnail_url,
                  order_position: video.order_position
                })
                .select()
                .single();
              if (error) throw error;

              for (const content of video.video_contents || []) {
                const { error: contentError } = await supabase
                  .from('video_contents')
                  .insert({
                    video_id: newVideo.id,
                    language_id: content.language_id,
                    title: content.title,
                    description: content.description
                  });
                if (contentError) throw contentError;
              }
            }
          }
        }

        // Handle photos with better error handling
        if (data.photos) {
          try {
            const currentPhotoIds = data.photos.filter(p => p.id).map(p => p.id);
            
            if (currentPhotoIds.length > 0) {
              const { error } = await supabase
                .from('track_featured_images')
                .delete()
                .eq('track_id', trackId)
                .not('id', 'in', `(${currentPhotoIds.join(',')})`);
              if (error) {
                console.error('Error deleting old photos:', error);
                throw new Error(`Error al eliminar fotos: ${error.message}`);
              }
            } else {
              const { error } = await supabase
                .from('track_featured_images')
                .delete()
                .eq('track_id', trackId);
              if (error) {
                console.error('Error deleting all photos:', error);
                throw new Error(`Error al eliminar todas las fotos: ${error.message}`);
              }
            }

            for (const photo of data.photos) {
              if (photo.id) {
                const { error } = await supabase
                  .from('track_featured_images')
                  .update({
                    caption_es: photo.caption_es || '',
                    caption_en: photo.caption_en || '',
                    order_position: photo.order_position,
                    image_url: photo.image_url || ''
                  })
                  .eq('id', photo.id);
                if (error) {
                  console.error('Error updating photo:', error);
                  throw new Error(`Error al actualizar foto: ${error.message}`);
                }
              } else {
                const { error } = await supabase
                  .from('track_featured_images')
                  .insert({
                    track_id: trackId,
                    caption_es: photo.caption_es || '',
                    caption_en: photo.caption_en || '',
                    order_position: photo.order_position,
                    image_url: photo.image_url || ''
                  });
                if (error) {
                  console.error('Error inserting photo:', error);
                  throw new Error(`Error al insertar foto: ${error.message}`);
                }
              }
            }
          } catch (photoError) {
            console.error('Photo handling error:', photoError);
            throw photoError;
          }
        }

        // Handle CTA settings with proper UPSERT
        if (data.cta_settings) {
          try {
            const { error } = await supabase
              .from('track_cta_settings')
              .upsert({
                track_id: trackId,
                show_texts: data.cta_settings.show_texts,
                show_videos: data.cta_settings.show_videos,
                show_photos: data.cta_settings.show_photos,
                texts_label_es: data.cta_settings.texts_label_es,
                texts_label_en: data.cta_settings.texts_label_en,
                videos_label_es: data.cta_settings.videos_label_es,
                videos_label_en: data.cta_settings.videos_label_en,
                photos_label_es: data.cta_settings.photos_label_es,
                photos_label_en: data.cta_settings.photos_label_en
              }, {
                onConflict: 'track_id'
              });
            if (error) {
              console.error('Error saving CTA settings:', error);
              throw new Error(`Error al guardar configuración CTA: ${error.message}`);
            }
          } catch (ctaError) {
            console.error('CTA settings error:', ctaError);
            throw ctaError;
          }
        }
      } else {
        const { data: newTrack, error: trackError } = await supabase
          .from('tracks')
          .insert({
            order_position: data.order_position,
            audio_url: data.audio_url,
            status: data.status
          })
          .select()
          .single();

        if (trackError) throw trackError;

        for (const content of data.track_contents || []) {
          const { error } = await supabase
            .from('track_contents')
            .insert({
              ...content,
              track_id: newTrack.id
            });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tracks-es'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tracks-en'] });
      queryClient.invalidateQueries({ queryKey: ['track', trackId] });
      toast({
        title: 'Track guardado',
        description: 'Los cambios han sido guardados correctamente.',
      });
      navigate('/admin/tracks');
    },
    onError: (error: any) => {
      console.error('Error saving track:', error);
      toast({
        title: 'Error al guardar',
        description: error.message || 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
    }
  });

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

  const handleSave = () => {
    console.log('Saving track with data:', trackData);
    saveTrack.mutate(trackData);
  };

  const handlePlayPause = () => {
    if (!trackData.audio_url) {
      toast({
        title: 'Sin audio',
        description: 'Agrega una URL de audio para reproducir el track.',
        variant: 'destructive',
      });
      return;
    }

    const track = {
      id: trackId,
      order_position: trackData.order_position || 1,
      audio_url: trackData.audio_url,
      status: trackData.status || 'published',
      track_contents: trackData.track_contents || []
    };

    if (currentTrack?.id === trackId && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/tracks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tracks
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {trackId > 0 ? 'Editar Track' : 'Nuevo Track'}
            </h1>
            <p className="text-muted-foreground">
              {trackId > 0 ? `Editando Track ${trackData.order_position}` : 'Crear un nuevo track'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {trackData.audio_url && (
            <Button variant="outline" onClick={handlePlayPause}>
              {currentTrack?.id === trackId && isPlaying ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {currentTrack?.id === trackId && isPlaying ? 'Pausar' : 'Reproducir'}
            </Button>
          )}
          <Button onClick={handleSave} disabled={saveTrack.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveTrack.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <TrackSettingsForm
              orderPosition={trackData.order_position || 1}
              audioUrl={trackData.audio_url || ''}
              status={trackData.status || 'published'}
              onOrderPositionChange={(value) => setTrackData(prev => ({ ...prev, order_position: value }))}
              onAudioUrlChange={(value) => setTrackData(prev => ({ ...prev, audio_url: value }))}
              onStatusChange={(value) => setTrackData(prev => ({ ...prev, status: value }))}
            />

            <CTASettingsForm
              ctaSettings={trackData.cta_settings || {
                show_texts: true,
                show_videos: true,
                show_photos: true,
                texts_label_es: 'Textos',
                texts_label_en: 'Texts',
                videos_label_es: 'Videos',
                videos_label_en: 'Videos',
                photos_label_es: 'Fotos',
                photos_label_en: 'Photos'
              }}
              onCTASettingsChange={(settings) => {
                setTrackData(prev => ({
                  ...prev,
                  cta_settings: {
                    ...prev.cta_settings,
                    ...settings
                  }
                }));
              }}
            />

            {trackData.cta_settings?.show_videos && (
              <VideosSection
                videos={trackData.videos || []}
                languages={languages}
                onVideosChange={(videos) => setTrackData(prev => ({ ...prev, videos }))}
                onVideoContentChange={updateVideoContent}
              />
            )}

            {trackData.cta_settings?.show_photos && (
              <PhotosSection
                photos={trackData.photos || []}
                onPhotosChange={(photos) => setTrackData(prev => ({ ...prev, photos }))}
              />
            )}
          </CardContent>
        </Card>

        <TrackContentTabs
          languages={languages}
          trackContents={trackData.track_contents || []}
          onContentChange={updateTrackContent}
        />
      </div>
    </div>
  );
};

export default AdminTrackEdit;
