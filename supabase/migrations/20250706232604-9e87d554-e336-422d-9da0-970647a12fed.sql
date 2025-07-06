
-- Add press menu items to navigation
INSERT INTO navigation_items (id, url, order_position, icon) VALUES 
(6, '/prensa', 6, 'download')
ON CONFLICT (id) DO UPDATE SET 
  url = EXCLUDED.url,
  order_position = EXCLUDED.order_position,
  icon = EXCLUDED.icon;

-- Add press menu contents in Spanish
INSERT INTO navigation_contents (navigation_id, language_id, title) VALUES 
(6, 1, 'Prensa')
ON CONFLICT (navigation_id, language_id) DO UPDATE SET 
  title = EXCLUDED.title;

-- Add press menu contents in English  
INSERT INTO navigation_contents (navigation_id, language_id, title) VALUES 
(6, 2, 'Press')
ON CONFLICT (navigation_id, language_id) DO UPDATE SET 
  title = EXCLUDED.title;
