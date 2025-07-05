
-- Add image_url column to track_featured_images table
ALTER TABLE public.track_featured_images 
ADD COLUMN image_url TEXT;

-- Create track_cta_settings table
CREATE TABLE public.track_cta_settings (
  id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES public.tracks(id) ON DELETE CASCADE,
  show_texts BOOLEAN DEFAULT true,
  show_videos BOOLEAN DEFAULT true,
  show_photos BOOLEAN DEFAULT true,
  texts_label_es TEXT DEFAULT 'Textos',
  texts_label_en TEXT DEFAULT 'Texts',
  videos_label_es TEXT DEFAULT 'Videos',
  videos_label_en TEXT DEFAULT 'Videos',
  photos_label_es TEXT DEFAULT 'Fotos',
  photos_label_en TEXT DEFAULT 'Photos',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(track_id)
);

-- Enable RLS on track_cta_settings
ALTER TABLE public.track_cta_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for track_cta_settings
CREATE POLICY "CMS users can manage track CTA settings" 
  ON public.track_cta_settings 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Track CTA settings are publicly readable" 
  ON public.track_cta_settings 
  FOR SELECT 
  USING (true);

-- Create cta_buttons table for home page CTAs
CREATE TABLE public.cta_buttons (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cta_button_contents table for multilingual content
CREATE TABLE public.cta_button_contents (
  id SERIAL PRIMARY KEY,
  cta_button_id INTEGER REFERENCES public.cta_buttons(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES public.languages(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(cta_button_id, language_id)
);

-- Enable RLS on cta_buttons and cta_button_contents
ALTER TABLE public.cta_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_button_contents ENABLE ROW LEVEL SECURITY;

-- Create policies for cta_buttons
CREATE POLICY "CMS users can manage CTA buttons" 
  ON public.cta_buttons 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "CTA buttons are publicly readable" 
  ON public.cta_buttons 
  FOR SELECT 
  USING (true);

-- Create policies for cta_button_contents
CREATE POLICY "CMS users can manage CTA button contents" 
  ON public.cta_button_contents 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "CTA button contents are publicly readable" 
  ON public.cta_button_contents 
  FOR SELECT 
  USING (true);

-- Insert default CTA buttons for home page
INSERT INTO public.cta_buttons (key, url, order_position) VALUES
  ('explore_tracks', '/recorre-la-huella', 1),
  ('listen_tracks', '/escucha-la-huella', 2),
  ('about_project', '/sobre-el-proyecto', 3);
