-- Add navigation item for Fotos page after Prensa
INSERT INTO public.navigation_items (url, order_position) VALUES ('/fotos', 6);

-- Get the navigation item ID for the Fotos page
-- Add navigation contents for both languages
INSERT INTO public.navigation_contents (navigation_id, language_id, title) VALUES
((SELECT id FROM navigation_items WHERE url = '/fotos'), 1, 'Fotos'),
((SELECT id FROM navigation_items WHERE url = '/fotos'), 2, 'Photos');

-- Create the Fotos page
INSERT INTO public.pages (slug, template_type, status) VALUES ('fotos', 'photos', 'published');

-- Add page contents for both languages
INSERT INTO public.page_contents (page_id, language_id, title, content, meta_description, hero_image_url) VALUES
((SELECT id FROM pages WHERE slug = 'fotos'), 1, 'Berta Rojas', 'Descargue aquí fotos de prensa en alta resolución', 'Galería de fotos de Berta Rojas', 'https://i.ibb.co/b5ZP5v2w/Huellas-27-05-201.jpg'),
((SELECT id FROM pages WHERE slug = 'fotos'), 2, 'Berta Rojas', 'Download high-resolution press photos here', 'Berta Rojas photo gallery', 'https://i.ibb.co/b5ZP5v2w/Huellas-27-05-201.jpg');