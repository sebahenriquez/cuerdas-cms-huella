
import { supabase } from '@/integrations/supabase/client';

export interface TrackData {
  id: number;
  order_position: number;
  audio_url: string;
  status: string;
  track_contents: TrackContent[];
}

export interface TrackContent {
  id?: number;
  title: string;
  menu_title: string;
  description: string;
  long_text_content: string;
  hero_image_url: string;
  language_id: number;
}

export const trackService = {
  async getAll(): Promise<TrackData[]> {
    const { data, error } = await supabase
      .from('tracks')
      .select(`
        *,
        track_contents(*)
      `)
      .order('order_position');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<TrackData | null> {
    const { data, error } = await supabase
      .from('tracks')
      .select(`
        *,
        track_contents(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(trackData: Omit<TrackData, 'id'>): Promise<TrackData> {
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .insert({
        order_position: trackData.order_position,
        audio_url: trackData.audio_url,
        status: trackData.status
      })
      .select()
      .single();

    if (trackError) throw trackError;

    // Insert track contents
    if (trackData.track_contents.length > 0) {
      const { error: contentError } = await supabase
        .from('track_contents')
        .insert(
          trackData.track_contents.map(content => ({
            ...content,
            track_id: track.id
          }))
        );

      if (contentError) throw contentError;
    }

    return await this.getById(track.id);
  },

  async update(id: number, trackData: Partial<TrackData>): Promise<void> {
    // Update track basic info
    const { error: trackError } = await supabase
      .from('tracks')
      .update({
        order_position: trackData.order_position,
        audio_url: trackData.audio_url,
        status: trackData.status
      })
      .eq('id', id);

    if (trackError) throw trackError;

    // Update track contents
    if (trackData.track_contents) {
      for (const content of trackData.track_contents) {
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
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('track_contents')
            .insert({
              ...content,
              track_id: id
            });
          
          if (error) throw error;
        }
      }
    }
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
