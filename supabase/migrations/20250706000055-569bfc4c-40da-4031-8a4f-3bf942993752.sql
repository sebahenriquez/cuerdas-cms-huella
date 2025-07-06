
-- Agregar campos para controlar la visibilidad de cada sección por track
ALTER TABLE track_cta_settings 
ADD COLUMN IF NOT EXISTS show_texts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_videos boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_photos boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS texts_label_es text DEFAULT 'Textos',
ADD COLUMN IF NOT EXISTS texts_label_en text DEFAULT 'Texts',
ADD COLUMN IF NOT EXISTS videos_label_es text DEFAULT 'Videos',
ADD COLUMN IF NOT EXISTS videos_label_en text DEFAULT 'Videos',
ADD COLUMN IF NOT EXISTS photos_label_es text DEFAULT 'Fotos',
ADD COLUMN IF NOT EXISTS photos_label_en text DEFAULT 'Photos';

-- Crear índice único para track_id si no existe
CREATE UNIQUE INDEX IF NOT EXISTS track_cta_settings_track_id_unique 
ON track_cta_settings(track_id);

-- Insertar configuración por defecto para tracks existentes que no tengan configuración CTA
INSERT INTO track_cta_settings (track_id, show_texts, show_videos, show_photos, texts_label_es, texts_label_en, videos_label_es, videos_label_en, photos_label_es, photos_label_en)
SELECT 
  t.id,
  true,
  true, 
  true,
  'Textos',
  'Texts',
  'Videos',
  'Videos',
  'Fotos',
  'Photos'
FROM tracks t
WHERE NOT EXISTS (
  SELECT 1 FROM track_cta_settings tcs WHERE tcs.track_id = t.id
);
