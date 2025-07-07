
import { supabase } from "@/integrations/supabase/client";

export const uploadMedia = async (file: File) => {
  console.log('Uploading media file:', file.name);
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    // Save to media_files table
    const { data, error } = await supabase
      .from('media_files')
      .insert({
        filename: fileName,
        original_name: file.name,
        file_path: publicUrl,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving media file record:', error);
      throw error;
    }
    
    console.log('Media uploaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in uploadMedia:', error);
    throw error;
  }
};

export const getTrackGallery = async (trackId: number) => {
  try {
    console.log('Fetching gallery for track:', trackId);
    const { data, error } = await supabase
      .from('image_galleries')
      .select(`
        *,
        gallery_images(*, media_files(*))
      `)
      .eq('track_id', trackId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching gallery:', error);
      throw error;
    }
    
    console.log('Gallery fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getTrackGallery:', error);
    throw error;
  }
};
