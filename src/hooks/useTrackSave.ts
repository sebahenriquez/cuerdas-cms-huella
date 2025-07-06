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

          // Update track contents
          if (data.track_contents) {
            console.log('Updating track contents...');
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
                  throw new Error(`Error updating content: ${error.message}`);
                }
              } else {
                const { error } = await supabase
                  .from('track_contents')
                  .insert({
                    ...content,
                    track_id: trackId
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
              .eq('track_id', trackId)
              .maybeSingle();

            if (fetchError) {
              console.error('Error fetching existing CTA settings:', fetchError);
              throw new Error(`Error checking CTA settings: ${fetchError.message}`);
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
                throw new Error(`Error updating CTA settings: ${updateError.message}`);
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
                throw new Error(`Error creating CTA settings: ${insertError.message}`);
              }
            }

            console.log('CTA settings saved successfully');
          }

          // Handle videos (simplified for now)
          if (data.videos) {
            console.log('Processing videos...');
            // Implementation for videos handling
          }

          // Handle photos (simplified for now)
          if (data.photos) {
            console.log('Processing photos...');
            // Implementation for photos handling
          }

        } else {
          console.log('Creating new track...');
          // Handle new track creation
          const { data: newTrack, error: trackError } = await supabase
            .from('tracks')
            .insert({
              order_position: data.order_position,
              audio_url: data.audio_url,
              status: data.status
            })
            .select()
            .single();

          if (trackError) {
            console.error('Error creating track:', trackError);
            throw new Error(`Error creating track: ${trackError.message}`);
          }

          console.log('New track created successfully:', newTrack);
        }

        console.log('Track save operation completed successfully');
      } catch (error) {
        console.error('Track save operation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Track saved successfully, invalidating caches...');
      
      // Invalidate relevant queries
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
