-- Create tracks table
CREATE TABLE public.tracks (
  id SERIAL PRIMARY KEY,
  order_position INTEGER NOT NULL,
  audio_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for tracks
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Create policy for tracks
CREATE POLICY "Published tracks are publicly readable" 
ON public.tracks 
FOR SELECT 
USING (status = 'published');

-- Create track contents table
CREATE TABLE public.track_contents (
  id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES public.tracks(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES public.languages(id),
  title VARCHAR(255),
  menu_title VARCHAR(255),
  description TEXT,
  hero_image_url VARCHAR(500),
  content_blocks JSONB,
  long_text_content TEXT,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(track_id, language_id)
);

-- Enable RLS for track_contents
ALTER TABLE public.track_contents ENABLE ROW LEVEL SECURITY;

-- Create policy for track_contents
CREATE POLICY "Track contents are publicly readable" 
ON public.track_contents 
FOR SELECT 
USING (true);

-- Create track quotes table
CREATE TABLE public.track_quotes (
  id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES public.tracks(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES public.languages(id),
  quote_text TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(255),
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for track_quotes
ALTER TABLE public.track_quotes ENABLE ROW LEVEL SECURITY;

-- Create policy for track_quotes
CREATE POLICY "Track quotes are publicly readable" 
ON public.track_quotes 
FOR SELECT 
USING (true);

-- Create media files table
CREATE TABLE public.media_files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  alt_text VARCHAR(255),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for media_files
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Create policy for media_files
CREATE POLICY "Media files are publicly readable" 
ON public.media_files 
FOR SELECT 
USING (true);

-- Create track featured images table
CREATE TABLE public.track_featured_images (
  id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES public.tracks(id) ON DELETE CASCADE,
  media_file_id INTEGER REFERENCES public.media_files(id),
  order_position INTEGER DEFAULT 0,
  caption_es TEXT,
  caption_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for track_featured_images
ALTER TABLE public.track_featured_images ENABLE ROW LEVEL SECURITY;

-- Create policy for track_featured_images
CREATE POLICY "Track featured images are publicly readable" 
ON public.track_featured_images 
FOR SELECT 
USING (true);

-- Insert initial tracks with audio URLs
INSERT INTO public.tracks (order_position, audio_url) VALUES 
(1, 'https://sebastianhenriquez.com.ar/huella/01.mp3'),
(2, 'https://sebastianhenriquez.com.ar/huella/02.mp3'),
(3, 'https://sebastianhenriquez.com.ar/huella/03.mp3'),
(4, 'https://sebastianhenriquez.com.ar/huella/04.mp3'),
(5, 'https://sebastianhenriquez.com.ar/huella/05.mp3'),
(6, 'https://sebastianhenriquez.com.ar/huella/06.mp3'),
(7, 'https://sebastianhenriquez.com.ar/huella/07.mp3'),
(8, 'https://sebastianhenriquez.com.ar/huella/08.mp3'),
(9, 'https://sebastianhenriquez.com.ar/huella/09.mp3'),
(10, 'https://sebastianhenriquez.com.ar/huella/10.mp3'),
(11, 'https://sebastianhenriquez.com.ar/huella/11.mp3');