
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

      // Validate required data
      if (!data.order_position || !data.status) {
        throw new Error('Datos requeridos faltantes: posición y estado son obligatorios');
      }

      try {
        if (trackId > 0) {
          // Update existing track
          console.log('Updating existing track...');
          
          const { error: trackError } = await supabase
            .from('tracks')
            .update({
              order_position: data.order_position,
              audio_url: data.audio_url || '',
              status: data.status
            })
            .eq('id', trackId);

          if (trackError) {
            console.error('Error updating track:', trackError);
            throw new Error(`Error actualizando track: ${trackError.message}`);
          }

          // Update track contents
          if (data.track_contents && data.track_contents.length > 0) {
            console.log('Updating track contents...');
            
            for (const content of data.track_contents) {
              if (content.id) {
                // Update existing content
                const { error } = await supabase
                  .from('track_contents')
                  .update({
                    title: content.title || '',
                    menu_title: content.menu_title || '',
                    description: content.description || '',
                    long_text_content: content.long_text_content || '',
                    hero_image_url: content.hero_image_url || ''
                  })
                  .eq('id', content.id);
                
                if (error) {
                  console.error('Error updating track content:', error);
                  throw new Error(`Error actualizando contenido: ${error.message}`);
                }
              } else {
                // Insert new content
                const { error } = await supabase
                  .from('track_contents')
                  .insert({
                    track_id: trackId,
                    language_id: content.language_id,
                    title: content.title || '',
                    menu_title: content.menu_title || '',
                    description: content.description || '',
                    long_text_content: content.long_text_content || '',
                    hero_image_url: content.hero_image_url || ''
                  });
                
                if (error) {
                  console.error('Error inserting track content:', error);
                  throw new Error(`Error insertando contenido: ${error.message}`);
                }
              }
            }
          }

          // Handle CTA settings
          if (data.cta_settings) {
            console.log('Updating CTA settings...');
            
            const { data: existingCTA } = await supabase
              .from('track_cta_settings')
              .select('id')
              .eq('track_id', trackId)
              .maybeSingle();

            const ctaData = {
              show_texts: data.cta_settings.show_texts ?? true,
              show_videos: data.cta_settings.show_videos ?? true,
              show_photos: data.cta_settings.show_photos ?? true,
              texts_label_es: data.cta_settings.texts_label_es || 'Textos',
              texts_label_en: data.cta_settings.texts_label_en || 'Texts',
              videos_label_es: data.cta_settings.videos_label_es || 'Videos',
              videos_label_en: data.cta_settings.videos_label_en || 'Videos',
              photos_label_es: data.cta_settings.photos_label_es || 'Fotos',
              photos_label_en: data.cta_settings.photos_label_en || 'Photos'
            };

            if (existingCTA) {
              const { error } = await supabase
                .from('track_cta_settings')
                .update(ctaData)
                .eq('track_id', trackId);
              
              if (error) throw new Error(`Error actualizando configuración CTA: ${error.message}`);
            } else {
              const { error } = await supabase
                .from('track_cta_settings')
                .insert({ ...ctaData, track_id: trackId });
              
              if (error) throw new Error(`Error creando configuración CTA: ${error.message}`);
            }
          }

        } else {
          // Create new track
          console.log('Creating new track...');
          
          const { data: newTrack, error: trackError } = await supabase
            .from('tracks')
            .insert({
              order_position: data.order_position,
              audio_url: data.audio_url || '',
              status: data.status
            })
            .select()
            .single();

          if (trackError) {
            console.error('Error creating track:', trackError);
            throw new Error(`Error creando track: ${trackError.message}`);
          }

          console.log('New track created:', newTrack);
        }

        console.log('Track save operation completed successfully');
      } catch (error) {
        console.error('Track save operation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Track saved successfully');
      
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
