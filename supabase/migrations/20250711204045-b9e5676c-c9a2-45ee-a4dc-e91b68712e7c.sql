-- Add fields for second button (full bios) to press_kit_settings table
ALTER TABLE press_kit_settings 
ADD COLUMN full_bios_url TEXT,
ADD COLUMN full_bios_button_label TEXT;

-- Update existing records with default values for both languages
UPDATE press_kit_settings 
SET 
  full_bios_url = 'https://example.com/full-bios',
  full_bios_button_label = CASE 
    WHEN (SELECT code FROM languages WHERE id = press_kit_settings.language_id) = 'es' 
    THEN 'Descargue las bios completas'
    ELSE 'Download the Full Bios of the Artists'
  END;