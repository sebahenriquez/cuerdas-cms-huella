-- Create navigation items for the website menu
INSERT INTO navigation_items (id, url, order_position, icon) VALUES 
(1, '/', 1, 'home'),
(2, '/recorre-la-huella', 2, 'music'),
(3, '/escucha-la-huella', 3, 'headphones'),
(4, '/sobre-el-proyecto', 4, 'info'),
(5, '/contacto', 5, 'mail')
ON CONFLICT (id) DO UPDATE SET 
  url = EXCLUDED.url,
  order_position = EXCLUDED.order_position,
  icon = EXCLUDED.icon;

-- Create navigation contents in Spanish
INSERT INTO navigation_contents (navigation_id, language_id, title) VALUES 
(1, 1, 'Inicio'),
(2, 1, 'Recorre la Huella'),
(3, 1, 'Escucha la Huella'),
(4, 1, 'Sobre el Proyecto'),
(5, 1, 'Contacto')
ON CONFLICT (navigation_id, language_id) DO UPDATE SET 
  title = EXCLUDED.title;

-- Create navigation contents in English
INSERT INTO navigation_contents (navigation_id, language_id, title) VALUES 
(1, 2, 'Home'),
(2, 2, 'Follow the Trail'),
(3, 2, 'Listen to the Trail'),
(4, 2, 'About the Project'),
(5, 2, 'Contact')
ON CONFLICT (navigation_id, language_id) DO UPDATE SET 
  title = EXCLUDED.title;