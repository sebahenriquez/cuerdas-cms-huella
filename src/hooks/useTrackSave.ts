
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TrackData } from './useTrackData';

export const useTrackSave = (trackId: number, onSuccess?: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

        // Handle photos
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
      onSuccess?.();
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

  return { saveTrack };
};
