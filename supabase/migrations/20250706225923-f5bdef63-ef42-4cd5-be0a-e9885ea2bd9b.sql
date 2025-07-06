
-- Create a table for press kit settings
CREATE TABLE press_kit_settings (
  id SERIAL PRIMARY KEY,
  language_id INTEGER REFERENCES languages(id),
  download_url TEXT,
  button_label TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE press_kit_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Press kit settings are publicly readable" 
  ON press_kit_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "CMS users can manage press kit settings" 
  ON press_kit_settings 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Insert default content for both languages
INSERT INTO press_kit_settings (language_id, download_url, button_label, description)
SELECT l.id, 
       'https://example.com/press-kit', 
       CASE WHEN l.code = 'es' THEN 'Kit de Prensa' ELSE 'Press Kit' END,
       CASE WHEN l.code = 'es' THEN 'Descargue el kit de prensa' ELSE 'Download the press kit' END
FROM languages l;
