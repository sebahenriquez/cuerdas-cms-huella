-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS gallery_photos_id_seq;
CREATE SEQUENCE IF NOT EXISTS photos_page_settings_id_seq;

-- Create table for main gallery photos (independent from track photos)
CREATE TABLE public.gallery_photos (
  id INTEGER NOT NULL DEFAULT nextval('gallery_photos_id_seq'::regclass) PRIMARY KEY,
  image_url TEXT NOT NULL,
  order_position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery photos
CREATE POLICY "Gallery photos are publicly readable" 
ON public.gallery_photos 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "CMS users can manage gallery photos" 
ON public.gallery_photos 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_gallery_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gallery_photos_updated_at
BEFORE UPDATE ON public.gallery_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_gallery_photos_updated_at();

-- Create table for photos page settings (download link and other content)
CREATE TABLE public.photos_page_settings (
  id INTEGER NOT NULL DEFAULT nextval('photos_page_settings_id_seq'::regclass) PRIMARY KEY,
  language_id INTEGER NOT NULL,
  download_url TEXT,
  download_button_text TEXT,
  page_title TEXT DEFAULT 'Berta Rojas',
  credit_text TEXT DEFAULT 'Photos: Guillermo Fridman',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(language_id)
);

-- Enable Row Level Security
ALTER TABLE public.photos_page_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for photos page settings
CREATE POLICY "Photos page settings are publicly readable" 
ON public.photos_page_settings 
FOR SELECT 
USING (true);

CREATE POLICY "CMS users can manage photos page settings" 
ON public.photos_page_settings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add foreign key constraint
ALTER TABLE public.photos_page_settings 
ADD CONSTRAINT photos_page_settings_language_id_fkey 
FOREIGN KEY (language_id) REFERENCES public.languages(id);

-- Insert initial photos
INSERT INTO public.gallery_photos (image_url, order_position) VALUES
('https://i.ibb.co/xq2nNPh8/Berta-Rojas-1.jpg', 1),
('https://i.ibb.co/dsFRZgSt/Berta-Rojas-2.jpg', 2),
('https://i.ibb.co/JjNQFnZt/Berta-Rojas-3.jpg', 3),
('https://i.ibb.co/VYrkv6Fj/Berta-Rojas-4.jpg', 4),
('https://i.ibb.co/1J9zWGZb/Berta-Rojas-5.jpg', 5);

-- Insert initial settings for both languages
INSERT INTO public.photos_page_settings (language_id, download_button_text, page_title, credit_text) VALUES
(1, 'Download high-resolution press photos here', 'Berta Rojas', 'Photos: Guillermo Fridman'),
(2, 'Descargue aquí fotos de prensa en alta resolución', 'Berta Rojas', 'Photos: Guillermo Fridman');