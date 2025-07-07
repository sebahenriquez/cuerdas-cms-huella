
-- Insert video for track 9
INSERT INTO public.videos (track_id, vimeo_url, order_position) 
VALUES (9, 'https://youtu.be/eUGUnVs9LMs', 1);

-- Insert video for track 10
INSERT INTO public.videos (track_id, vimeo_url, order_position) 
VALUES (10, 'https://www.youtube.com/watch?v=OM0o6p7cRCc', 1);

-- Get the video IDs that were just inserted to add content for both languages
DO $$
DECLARE
    video_9_id INTEGER;
    video_10_id INTEGER;
BEGIN
    -- Get the video ID for track 9
    SELECT id INTO video_9_id FROM public.videos WHERE track_id = 9 AND vimeo_url = 'https://youtu.be/eUGUnVs9LMs';
    
    -- Get the video ID for track 10
    SELECT id INTO video_10_id FROM public.videos WHERE track_id = 10 AND vimeo_url = 'https://www.youtube.com/watch?v=OM0o6p7cRCc';
    
    -- Insert video content for track 9 (both languages)
    INSERT INTO public.video_contents (video_id, language_id, title, description) VALUES
    (video_9_id, 1, 'Track 9 Video', 'Video content for track 9'),
    (video_9_id, 2, 'Video Track 9', 'Contenido de video para track 9');
    
    -- Insert video content for track 10 (both languages)
    INSERT INTO public.video_contents (video_id, language_id, title, description) VALUES
    (video_10_id, 1, 'Track 10 Video', 'Video content for track 10'),
    (video_10_id, 2, 'Video Track 10', 'Contenido de video para track 10');
END $$;
