-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Create storage policies for media bucket
CREATE POLICY "Media files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

-- Insert initial pages
INSERT INTO public.pages (slug, template_type) VALUES 
('home', 'home'),
('recorre-la-huella', 'track_journey'),
('escucha-la-huella', 'audio_player'),
('videos', 'videos'),
('acerca-de-berta-rojas', 'standard'),
('ficha-tecnica', 'standard'),
('prensa', 'press');

-- Insert initial page contents in Spanish
INSERT INTO public.page_contents (page_id, language_id, title, content, hero_image_url, meta_description)
SELECT p.id, l.id,
  CASE p.slug
    WHEN 'home' THEN 'La Huella de las Cuerdas'
    WHEN 'recorre-la-huella' THEN 'Recorré la Huella'
    WHEN 'escucha-la-huella' THEN 'Escuchá la Huella'
    WHEN 'videos' THEN 'Videos'
    WHEN 'acerca-de-berta-rojas' THEN 'Acerca de Berta Rojas'
    WHEN 'ficha-tecnica' THEN 'Ficha Técnica'
    WHEN 'prensa' THEN 'Prensa'
  END,
  CASE p.slug
    WHEN 'home' THEN '<p>Un viaje musical por la historia de los instrumentos de cuerda en América Latina...</p>'
    WHEN 'recorre-la-huella' THEN '<p>Sumérgete en la historia de cada track mientras escuchas el álbum. Selecciona una canción del menú y descubre las historias, imágenes y testimonios que inspiraron cada composición.</p>'
    WHEN 'escucha-la-huella' THEN '<p>Reproducir el álbum completo de "La Huella de las Cuerdas"</p>'
    WHEN 'videos' THEN '<p>Videos oficiales del proyecto musical</p>'
    WHEN 'acerca-de-berta-rojas' THEN '<p>Biografía de Berta Rojas, guitarrista clásica paraguaya reconocida mundialmente.</p>'
    WHEN 'ficha-tecnica' THEN '<p>Créditos completos y detalles técnicos del álbum.</p>'
    WHEN 'prensa' THEN '<p>Información para medios de comunicación y material de prensa descargable.</p>'
  END,
  CASE p.slug
    WHEN 'home' THEN 'https://i.ibb.co/Psq17ZKw/Cover.jpg'
    ELSE NULL
  END,
  CASE p.slug
    WHEN 'home' THEN 'La Huella de las Cuerdas - Un viaje musical por América Latina'
    WHEN 'recorre-la-huella' THEN 'Experiencia interactiva del álbum La Huella de las Cuerdas'
    WHEN 'escucha-la-huella' THEN 'Reproductor del álbum La Huella de las Cuerdas'
    WHEN 'videos' THEN 'Videos oficiales de La Huella de las Cuerdas'
    WHEN 'acerca-de-berta-rojas' THEN 'Biografía de Berta Rojas, guitarrista paraguaya'
    WHEN 'ficha-tecnica' THEN 'Créditos técnicos del álbum La Huella de las Cuerdas'
    WHEN 'prensa' THEN 'Información de prensa - La Huella de las Cuerdas'
  END
FROM public.pages p, public.languages l WHERE l.code = 'es';

-- Insert navigation items
INSERT INTO public.navigation_items (order_position, url) VALUES 
(1, '/'),
(2, '/recorre-la-huella'),
(3, '/escucha-la-huella'),
(4, '/videos'),
(5, '/acerca-de-berta-rojas'),
(6, '/ficha-tecnica'),
(7, '/prensa');

-- Insert navigation contents in Spanish
INSERT INTO public.navigation_contents (navigation_id, language_id, title)
SELECT n.id, l.id,
  CASE n.order_position
    WHEN 1 THEN 'Home'
    WHEN 2 THEN 'Recorré la Huella'
    WHEN 3 THEN 'Escuchá la Huella'
    WHEN 4 THEN 'Videos'
    WHEN 5 THEN 'Acerca de Berta Rojas'
    WHEN 6 THEN 'Ficha Técnica'
    WHEN 7 THEN 'Prensa'
  END
FROM public.navigation_items n, public.languages l WHERE l.code = 'es';