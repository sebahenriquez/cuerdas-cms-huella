
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
      
      // Verificar si el track existe
      const { data: existingTrack } = await supabase
        .from('tracks')
        .select('id')
        .eq('id', trackId)
        .maybeSingle();
      
      const isUpdate = !!existingTrack;
      console.log(`${isUpdate ? 'Updating' : 'Creating'} track ${trackId}`);
      
      if (isUpdate) {
        // Update existing track
        const { error: trackError } = await supabase
          .from('tracks')
          .update({
            order_position: data.order_position,
            audio_url: data.audio_url,
            status: data.status
          })
          .eq('id', trackId);

        if (trackError) {
          console.error('Error updating track:', trackError);
          throw new Error(`Error al actualizar track: ${trackError.message}`);
        }
      } else {
        // Create new track with specific ID
        const { error: trackError } = await supabase
          .from('tracks')
          .insert({
            id: trackId,
            order_position: data.order_position,
            audio_url: data.audio_url,
            status: data.status
          });

        if (trackError) {
          console.error('Error creating track:', trackError);
          throw new Error(`Error al crear track: ${trackError.message}`);
        }
      }

      // Update or insert track contents
      if (data.track_contents) {
        for (const content of data.track_contents) {
          if (content.id) {
            const { error } = await supabase
              .from('track_contents')
              .update({
                title: content.title,
                menu_title: content.menu_title,
                description: content.description,
                long_text_content: content.long_text_content,
                hero_image_url: content.hero_image_url
              })
              .eq('id', content.id);
            if (error) {
              console.error('Error updating track content:', error);
              throw new Error(`Error al actualizar contenido: ${error.message}`);
            }
          } else {
            // Insert new content
            const { error } = await supabase
              .from('track_contents')
              .insert({
                track_id: trackId,
                language_id: content.language_id,
                title: content.title,
                menu_title: content.menu_title,
                description: content.description,
                long_text_content: content.long_text_content,
                hero_image_url: content.hero_image_url
              });
            if (error) {
              console.error('Error inserting track content:', error);
              throw new Error(`Error al insertar contenido: ${error.message}`);
            }
          }
        }
      }

      // Handle CTA settings
      if (data.cta_settings) {
        console.log('Saving CTA settings:', data.cta_settings);
        
        const { data: existingCTA, error: fetchError } = await supabase
          .from('track_cta_settings')
          .select('id')
          .eq('track_id', trackId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching existing CTA settings:', fetchError);
          throw new Error(`Error al verificar configuración CTA: ${fetchError.message}`);
        }

        if (existingCTA) {
          // Update existing CTA settings
          const { error: updateError } = await supabase
            .from('track_cta_settings')
            .update({
              show_texts: data.cta_settings.show_texts,
              show_videos: data.cta_settings.show_videos,
              show_photos: data.cta_settings.show_photos,
              texts_label_es: data.cta_settings.texts_label_es,
              texts_label_en: data.cta_settings.texts_label_en,
              videos_label_es: data.cta_settings.videos_label_es,
              videos_label_en: data.cta_settings.videos_label_en,
              photos_label_es: data.cta_settings.photos_label_es,
              photos_label_en: data.cta_settings.photos_label_en,
              updated_at: new Date().toISOString()
            })
            .eq('track_id', trackId);

          if (updateError) {
            console.error('Error updating CTA settings:', updateError);
            throw new Error(`Error al actualizar configuración CTA: ${updateError.message}`);
          }
        } else {
          // Insert new CTA settings
          const { error: insertError } = await supabase
            .from('track_cta_settings')
            .insert({
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
            });

          if (insertError) {
            console.error('Error inserting CTA settings:', insertError);
            throw new Error(`Error al crear configuración CTA: ${insertError.message}`);
          }
        }

        console.log('CTA settings saved successfully');
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
          if (error) {
            console.error('Error deleting old videos:', error);
            throw new Error(`Error al eliminar videos: ${error.message}`);
          }
        } else {
          const { error } = await supabase
            .from('videos')
            .delete()
            .eq('track_id', trackId);
          if (error) {
            console.error('Error deleting all videos:', error);
            throw new Error(`Error al eliminar todos los videos: ${error.message}`);
          }
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
            if (error) {
              console.error('Error updating video:', error);
              throw new Error(`Error al actualizar video: ${error.message}`);
            }

            for (const content of video.video_contents || []) {
              if (content.id) {
                const { error: contentError } = await supabase
                  .from('video_contents')
                  .update({
                    title: content.title,
                    description: content.description
                  })
                  .eq('id', content.id);
                if (contentError) {
                  console.error('Error updating video content:', contentError);
                  throw new Error(`Error al actualizar contenido de video: ${contentError.message}`);
                }
              } else {
                const { error: contentError } = await supabase
                  .from('video_contents')
                  .insert({
                    video_id: video.id,
                    language_id: content.language_id,
                    title: content.title,
                    description: content.description
                  });
                if (contentError) {
                  console.error('Error inserting video content:', contentError);
                  throw new Error(`Error al insertar contenido de video: ${contentError.message}`);
                }
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
            if (error) {
              console.error('Error inserting video:', error);
              throw new Error(`Error al insertar video: ${error.message}`);
            }

            for (const content of video.video_contents || []) {
              const { error: contentError } = await supabase
                .from('video_contents')
                .insert({
                  video_id: newVideo.id,
                  language_id: content.language_id,
                  title: content.title,
                  description: content.description
                });
              if (contentError) {
                console.error('Error inserting video content:', contentError);
                throw new Error(`Error al insertar contenido de video: ${contentError.message}`);
              }
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

      console.log('Track saved successfully');
    },
    onSuccess: () => {
      // Invalidate all relevant queries to force refresh
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
