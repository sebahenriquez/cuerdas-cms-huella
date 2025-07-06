
-- Insertar botón CTA para "Comenzar el Recorrido"
INSERT INTO public.cta_buttons (key, url, order_position) VALUES
  ('start_journey', '/recorre-la-huella', 4)
ON CONFLICT (key) DO NOTHING;

-- Insertar contenido en español
INSERT INTO public.cta_button_contents (cta_button_id, language_id, label)
SELECT 
  (SELECT id FROM public.cta_buttons WHERE key = 'start_journey'),
  1, -- ID del idioma español
  'Comenzar el Recorrido'
ON CONFLICT (cta_button_id, language_id) DO UPDATE SET
  label = EXCLUDED.label;

-- Insertar contenido en inglés
INSERT INTO public.cta_button_contents (cta_button_id, language_id, label)
SELECT 
  (SELECT id FROM public.cta_buttons WHERE key = 'start_journey'),
  2, -- ID del idioma inglés
  'Start the Journey'
ON CONFLICT (cta_button_id, language_id) DO UPDATE SET
  label = EXCLUDED.label;
