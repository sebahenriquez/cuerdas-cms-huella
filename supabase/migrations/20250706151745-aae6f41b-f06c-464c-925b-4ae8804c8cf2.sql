
-- Update navigation contents for English language
UPDATE navigation_contents 
SET title = 'Start the Journey' 
WHERE navigation_id = 2 AND language_id = 2;

UPDATE navigation_contents 
SET title = 'Listen to the Album' 
WHERE navigation_id = 3 AND language_id = 2;
