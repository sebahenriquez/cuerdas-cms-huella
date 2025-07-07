
import { supabase } from "@/integrations/supabase/client";

export const getVideosByTrack = async (trackId: number, languageId: number) => {
  try {
    console.log('Fetching videos for track:', trackId, 'language:', languageId);
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        video_contents!inner(*)
      `)
      .eq('track_id', trackId)
      .eq('video_contents.language_id', languageId)
      .order('order_position');
    
    if (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
    
    console.log('Videos fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getVideosByTrack:', error);
    throw error;
  }
};
