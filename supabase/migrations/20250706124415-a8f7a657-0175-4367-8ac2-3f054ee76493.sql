
-- Crear la página de introducción para "Recorre la Huella"
INSERT INTO pages (slug, template_type, status) 
VALUES ('recorre-la-huella-intro', 'hero', 'published')
ON CONFLICT (slug) DO NOTHING;

-- Obtener el ID de la página recién creada
WITH page_data AS (
  SELECT id FROM pages WHERE slug = 'recorre-la-huella-intro'
)
-- Insertar contenido en español
INSERT INTO page_contents (page_id, language_id, title, content, meta_description, hero_image_url)
SELECT 
  p.id,
  1, -- ID del idioma español
  'Recorre la Huella',
  '<p>Sumérgete en un recorrido interactivo por los diferentes tracks que componen este álbum musical único.</p><p><strong>La Huella de las Cuerdas</strong> es un proyecto integral que incluye:</p><ul><li>Un álbum editado en vinilo con sonoridades únicas</li><li>Un libro con investigaciones profundas vinculadas a cada track</li><li>Fotografías exclusivas de los instrumentos utilizados</li></ul><p>En esta sección podrás navegar digitalmente por todo este contenido, track por track, descubriendo las historias, texturas sonoras y elementos visuales que dan vida a cada pieza musical.</p>',
  'Explora La Huella de las Cuerdas: un proyecto musical integral con álbum en vinilo, investigaciones y fotografías exclusivas.',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'
FROM page_data p
ON CONFLICT (page_id, language_id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  meta_description = EXCLUDED.meta_description,
  hero_image_url = EXCLUDED.hero_image_url;

-- Insertar contenido en inglés
WITH page_data AS (
  SELECT id FROM pages WHERE slug = 'recorre-la-huella-intro'
)
INSERT INTO page_contents (page_id, language_id, title, content, meta_description, hero_image_url)
SELECT 
  p.id,
  2, -- ID del idioma inglés
  'Follow the Trail',
  '<p>Immerse yourself in an interactive journey through the different tracks that make up this unique musical album.</p><p><strong>The Trail of Strings</strong> is a comprehensive project that includes:</p><ul><li>An album released on vinyl with unique soundscapes</li><li>A book with in-depth research linked to each track</li><li>Exclusive photographs of the instruments used</li></ul><p>In this section you can digitally navigate through all this content, track by track, discovering the stories, sound textures and visual elements that bring each musical piece to life.</p>',
  'Explore The Trail of Strings: a comprehensive musical project with vinyl album, research and exclusive photographs.',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'
FROM page_data p
ON CONFLICT (page_id, language_id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  meta_description = EXCLUDED.meta_description,
  hero_image_url = EXCLUDED.hero_image_url;
