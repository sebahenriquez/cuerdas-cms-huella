
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TrackData } from './useTrackData';

export const useTrackSave = (trackId: number, onSuccess?: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveTrack = useMutation({
    mutationFn: async (data: Partial<TrackData>) => {
      console.log('Starting track save operation for trackId:', trackId);
      console.log('Save data:', data);
      
      try {
        let currentTrackId = trackId;

        if (trackId > 0) {
          console.log('Updating existing track...');
          
          // Update track basic info
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
            throw new Error(`Error updating track: ${trackError.message}`);
          }

          console.log('Track basic info updated successfully');
        } else {
          console.log('Creating new track...');
          
          // Create new track
          const { data: newTrack, error: trackError } = await supabase
            .from('tracks')
            .insert({
              order_position: data.order_position || 1,
              audio_url: data.audio_url || '',
              status: data.status || 'published'
            })
            .select()
            .single();

          if (trackError) {
            console.error('Error creating track:', trackError);
            throw new Error(`Error creating track: ${trackError.message}`);
          }

          currentTrackId = newTrack.id;
          console.log('New track created successfully:', newTrack);
        }

        // Update track contents
        if (data.track_contents) {
          console.log('Updating track contents...');
          for (const content of data.track_contents) {
            if (content.id) {
              // Update existing content
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
                throw new Error(`Error updating content: ${error.message}`);
              }
            } else {
              // Insert new content
              const { error } = await supabase
                .from('track_contents')
                .insert({
                  track_id: currentTrackId,
                  title: content.title,
                  menu_title: content.menu_title,
                  description: content.description,
                  long_text_content: content.long_text_content,
                  hero_image_url: content.hero_image_url,
                  language_id: content.language_id
                });
              
              if (error) {
                console.error('Error inserting track content:', error);
                throw new Error(`Error inserting content: ${error.message}`);
              }
            }
          }
          console.log('Track contents updated successfully');
        }

        // Handle CTA settings
        if (data.cta_settings) {
          console.log('Updating CTA settings...');
          
          // Check if CTA settings exist
          const { data: existingCTA, error: fetchError } = await supabase
            .from('track_cta_settings')
            .select('id')
            .eq('track_id', currentTrackId)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching existing CTA settings:', fetchError);
            throw new Error(`Error checking CTA settings: ${fetchError.message}`);
          }

          const ctaData = {
            track_id: currentTrackId,
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
          };

          if (existingCTA) {
            // Update existing CTA settings
            const { error: updateError } = await supabase
              .from('track_cta_settings')
              .update(ctaData)
              .eq('track_id', currentTrackId);

            if (updateError) {
              console.error('Error updating CTA settings:', updateError);
              throw new Error(`Error updating CTA settings: ${updateError.message}`);
            }
          } else {
            // Insert new CTA settings
            const { error: insertError } = await supabase
              .from('track_cta_settings')
              .insert(ctaData);

            if (insertError) {
              console.error('Error inserting CTA settings:', insertError);
              throw new Error(`Error creating CTA settings: ${insertError.message}`);
            }
          }

          console.log('CTA settings saved successfully');
        }

        // Handle videos if provided
        if (data.videos && data.videos.length > 0) {
          console.log('Processing videos...');
          for (const video of data.videos) {
            if (video.id) {
              // Update existing video
              const { error: videoError } = await supabase
                .from('videos')
                .update({
                  vimeo_url: video.vimeo_url,
                  thumbnail_url: video.thumbnail_url,
                  order_position: video.order_position,
                  track_id: currentTrackId
                })
                .eq('id', video.id);

              if (videoError) {
                console.error('Error updating video:', videoError);
                throw new Error(`Error updating video: ${videoError.message}`);
              }

              // Update video contents
              if (video.video_contents) {
                for (const content of video.video_contents) {
                  if (content.id) {
                    const { error } = await supabase
                      .from('video_contents')
                      .update({
                        title: content.title,
                        description: content.description
                      })
                      .eq('id', content.id);
                    
                    if (error) {
                      console.error('Error updating video content:', error);
                      throw new Error(`Error updating video content: ${error.message}`);
                    }
                  } else {
                    const { error } = await supabase
                      .from('video_contents')
                      .insert({
                        video_id: video.id,
                        title: content.title,
                        description: content.description,
                        language_id: content.language_id
                      });
                    
                    if (error) {
                      console.error('Error inserting video content:', error);
                      throw new Error(`Error inserting video content: ${error.message}`);
                    }
                  }
                }
              }
            } else {
              // Create new video
              const { data: newVideo, error: videoError } = await supabase
                .from('videos')
                .insert({
                  vimeo_url: video.vimeo_url,
                  thumbnail_url: video.thumbnail_url,
                  order_position: video.order_position,
                  track_id: currentTrackId
                })
                .select()
                .single();

              if (videoError) {
                console.error('Error creating video:', videoError);
                throw new Error(`Error creating video: ${videoError.message}`);
              }

              // Insert video contents
              if (video.video_contents) {
                for (const content of video.video_contents) {
                  const { error } = await supabase
                    .from('video_contents')
                    .insert({
                      video_id: newVideo.id,
                      title: content.title,
                      description: content.description,
                      language_id: content.language_id
                    });
                  
                  if (error) {
                    console.error('Error inserting video content:', error);
                    throw new Error(`Error inserting video content: ${error.message}`);
                  }
                }
              }
            }
          }
          console.log('Videos processed successfully');
        }

        // Handle photos if provided
        if (data.photos && data.photos.length > 0) {
          console.log('Processing photos...');
          for (const photo of data.photos) {
            if (photo.id) {
              // Update existing photo
              const { error: photoError } = await supabase
                .from('track_featured_images')
                .update({
                  image_url: photo.image_url,
                  caption_es: photo.caption_es,
                  caption_en: photo.caption_en,
                  order_position: photo.order_position,
                  media_file_id: photo.media_file_id
                })
                .eq('id', photo.id);

              if (photoError) {
                console.error('Error updating photo:', photoError);
                throw new Error(`Error updating photo: ${photoError.message}`);
              }
            } else {
              // Create new photo
              const { error: photoError } = await supabase
                .from('track_featured_images')
                .insert({
                  track_id: currentTrackId,
                  image_url: photo.image_url,
                  caption_es: photo.caption_es,
                  caption_en: photo.caption_en,
                  order_position: photo.order_position,
                  media_file_id: photo.media_file_id
                });

              if (photoError) {
                console.error('Error creating photo:', photoError);
                throw new Error(`Error creating photo: ${photoError.message}`);
              }
            }
          }
          console.log('Photos processed successfully');
        }

        console.log('Track save operation completed successfully');
        return { success: true, trackId: currentTrackId };
      } catch (error) {
        console.error('Track save operation failed:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log('Track saved successfully, invalidating caches...');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin-tracks-es'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tracks-en'] });
      queryClient.invalidateQueries({ queryKey: ['track', trackId] });
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      
      toast({
        title: 'Track guardado',
        description: 'Los cambios han sido guardados correctamente.',
      });
      
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Track save mutation error:', error);
      toast({
        title: 'Error al guardar',
        description: error.message || 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
    }
  });

  return { saveTrack };
};
