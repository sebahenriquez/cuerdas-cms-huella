-- Agregar nuevo botón "Mirá el libro" / "Flip through the book" al menú principal
INSERT INTO navigation_items (url, icon, order_position, parent_id)
VALUES ('https://issuu.com/celesteprieto/docs/lhdlc_', 'book-open', 3.5, NULL);

-- Obtener el ID del item recién creado
DO $$
DECLARE
    book_nav_id INTEGER;
BEGIN
    SELECT id INTO book_nav_id FROM navigation_items WHERE url = 'https://issuu.com/celesteprieto/docs/lhdlc_';
    
    -- Agregar contenido en español
    INSERT INTO navigation_contents (navigation_id, language_id, title)
    VALUES (book_nav_id, 1, 'Mirá el libro');
    
    -- Agregar contenido en inglés
    INSERT INTO navigation_contents (navigation_id, language_id, title)
    VALUES (book_nav_id, 2, 'Flip through the book');
END $$;