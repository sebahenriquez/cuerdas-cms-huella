-- Create videos table
CREATE TABLE public.videos (
  id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES public.tracks(id) ON DELETE CASCADE,
  vimeo_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create policy for videos
CREATE POLICY "Videos are publicly readable" 
ON public.videos 
FOR SELECT 
USING (true);

-- Create video contents table
CREATE TABLE public.video_contents (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES public.videos(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES public.languages(id),
  title VARCHAR(255),
  description TEXT,
  UNIQUE(video_id, language_id)
);

-- Enable RLS for video_contents
ALTER TABLE public.video_contents ENABLE ROW LEVEL SECURITY;

-- Create policy for video_contents
CREATE POLICY "Video contents are publicly readable" 
ON public.video_contents 
FOR SELECT 
USING (true);

-- Create image galleries table
CREATE TABLE public.image_galleries (
  id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for image_galleries
ALTER TABLE public.image_galleries ENABLE ROW LEVEL SECURITY;

-- Create policy for image_galleries
CREATE POLICY "Image galleries are publicly readable" 
ON public.image_galleries 
FOR SELECT 
USING (true);

-- Create gallery images table
CREATE TABLE public.gallery_images (
  id SERIAL PRIMARY KEY,
  gallery_id INTEGER REFERENCES public.image_galleries(id) ON DELETE CASCADE,
  media_file_id INTEGER REFERENCES public.media_files(id),
  order_position INTEGER DEFAULT 0,
  caption TEXT
);

-- Enable RLS for gallery_images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policy for gallery_images
CREATE POLICY "Gallery images are publicly readable" 
ON public.gallery_images 
FOR SELECT 
USING (true);

-- Create theme settings table
CREATE TABLE public.theme_settings (
  id SERIAL PRIMARY KEY,
  primary_color VARCHAR(7) DEFAULT '#FFFFFF',
  accent_color VARCHAR(7) DEFAULT '#DC2626',
  background_color VARCHAR(7) DEFAULT '#F8F8F8',
  text_color VARCHAR(7) DEFAULT '#212121',
  font_family VARCHAR(100) DEFAULT 'Inter',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for theme_settings
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for theme_settings
CREATE POLICY "Theme settings are publicly readable" 
ON public.theme_settings 
FOR SELECT 
USING (true);

-- Create navigation items table
CREATE TABLE public.navigation_items (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES public.navigation_items(id),
  order_position INTEGER NOT NULL,
  url VARCHAR(255),
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for navigation_items
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- Create policy for navigation_items
CREATE POLICY "Navigation items are publicly readable" 
ON public.navigation_items 
FOR SELECT 
USING (true);

-- Create navigation contents table
CREATE TABLE public.navigation_contents (
  id SERIAL PRIMARY KEY,
  navigation_id INTEGER REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES public.languages(id),
  title VARCHAR(100) NOT NULL,
  UNIQUE(navigation_id, language_id)
);

-- Enable RLS for navigation_contents
ALTER TABLE public.navigation_contents ENABLE ROW LEVEL SECURITY;

-- Create policy for navigation_contents
CREATE POLICY "Navigation contents are publicly readable" 
ON public.navigation_contents 
FOR SELECT 
USING (true);

-- Insert initial theme settings
INSERT INTO public.theme_settings DEFAULT VALUES;

-- Insert initial track titles in Spanish
INSERT INTO public.track_contents (track_id, language_id, title, menu_title) 
SELECT t.id, l.id, 
  CASE t.order_position
    WHEN 1 THEN 'La huella del códice'
    WHEN 2 THEN 'El Canario'
    WHEN 3 THEN 'Sara'
    WHEN 4 THEN 'Bambuco pa Billy'
    WHEN 5 THEN 'Tierra mia'
    WHEN 6 THEN 'Tríptico Americano: I El Mar (Baião)'
    WHEN 7 THEN 'Tríptico Americano: II La Montaña (Huayno)'
    WHEN 8 THEN 'Tríptico Americano: III Los Llanos (Vals - Joropo)'
    WHEN 9 THEN 'Che la Reina / Arroyos y Esteros'
    WHEN 10 THEN 'The Last of Us'
    WHEN 11 THEN 'Baiaozim Calungo'
  END,
  CASE t.order_position
    WHEN 1 THEN 'La huella del códice'
    WHEN 2 THEN 'El Canario'
    WHEN 3 THEN 'Sara'
    WHEN 4 THEN 'Bambuco pa Billy'
    WHEN 5 THEN 'Tierra mia'
    WHEN 6 THEN 'Tríptico Americano I'
    WHEN 7 THEN 'Tríptico Americano II'
    WHEN 8 THEN 'Tríptico Americano III'
    WHEN 9 THEN 'Che la Reina'
    WHEN 10 THEN 'The Last of Us'
    WHEN 11 THEN 'Baiaozim Calungo'
  END
FROM public.tracks t, public.languages l WHERE l.code = 'es';