
-- Create a table for call to action buttons
CREATE TABLE public.cta_buttons (
  id INTEGER NOT NULL DEFAULT nextval('cta_buttons_id_seq'::regclass) PRIMARY KEY,
  key VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sequence for cta_buttons
CREATE SEQUENCE IF NOT EXISTS cta_buttons_id_seq;

-- Create a table for call to action button contents (multilingual)
CREATE TABLE public.cta_button_contents (
  id INTEGER NOT NULL DEFAULT nextval('cta_button_contents_id_seq'::regclass) PRIMARY KEY,
  cta_button_id INTEGER REFERENCES public.cta_buttons(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES public.languages(id) ON DELETE CASCADE,
  text VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(cta_button_id, language_id)
);

-- Create sequence for cta_button_contents
CREATE SEQUENCE IF NOT EXISTS cta_button_contents_id_seq;

-- Add Row Level Security (RLS)
ALTER TABLE public.cta_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_button_contents ENABLE ROW LEVEL SECURITY;

-- Create policies for cta_buttons
CREATE POLICY "CTA buttons are publicly readable" 
  ON public.cta_buttons 
  FOR SELECT 
  USING (true);

CREATE POLICY "CMS users can manage CTA buttons" 
  ON public.cta_buttons 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create policies for cta_button_contents
CREATE POLICY "CTA button contents are publicly readable" 
  ON public.cta_button_contents 
  FOR SELECT 
  USING (true);

CREATE POLICY "CMS users can manage CTA button contents" 
  ON public.cta_button_contents 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Insert the two CTA buttons
INSERT INTO public.cta_buttons (key) VALUES 
  ('explore_trail'),
  ('listen_album');

-- Insert default content for both languages (assuming Spanish=1, English=2)
INSERT INTO public.cta_button_contents (cta_button_id, language_id, text) VALUES 
  ((SELECT id FROM public.cta_buttons WHERE key = 'explore_trail'), 1, 'Recorré la Huella'),
  ((SELECT id FROM public.cta_buttons WHERE key = 'explore_trail'), 2, 'Explore the Trail'),
  ((SELECT id FROM public.cta_buttons WHERE key = 'listen_album'), 1, 'Escuchar el Álbum'),
  ((SELECT id FROM public.cta_buttons WHERE key = 'listen_album'), 2, 'Listen to the Album');
