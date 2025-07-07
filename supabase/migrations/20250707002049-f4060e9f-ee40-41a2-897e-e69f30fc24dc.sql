
-- Set Spanish as non-default language
UPDATE languages SET is_default = false WHERE code = 'es';

-- Set English as the default language
UPDATE languages SET is_default = true WHERE code = 'en';
