-- Create languages table
CREATE TABLE public.languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for CMS authentication
CREATE TABLE public.cms_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for cms_users
ALTER TABLE public.cms_users ENABLE ROW LEVEL SECURITY;

-- Create policies for cms_users
CREATE POLICY "CMS users can view their own data" 
ON public.cms_users 
FOR SELECT 
USING (auth.uid()::text = id::text);

-- Create site settings table
CREATE TABLE public.site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  language_id INTEGER REFERENCES public.languages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(key, language_id)
);

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for site_settings (public read access for frontend)
CREATE POLICY "Site settings are publicly readable" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Create pages table
CREATE TABLE public.pages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  template_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for pages
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create policy for pages
CREATE POLICY "Published pages are publicly readable" 
ON public.pages 
FOR SELECT 
USING (status = 'published');

-- Create page contents table
CREATE TABLE public.page_contents (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES public.pages(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES public.languages(id),
  title VARCHAR(255),
  content TEXT,
  hero_image_url VARCHAR(500),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_id, language_id)
);

-- Enable RLS for page_contents
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;

-- Create policy for page_contents
CREATE POLICY "Page contents are publicly readable" 
ON public.page_contents 
FOR SELECT 
USING (true);

-- Insert initial languages
INSERT INTO public.languages (code, name, is_default) VALUES 
('es', 'Español', true),
('en', 'English', false);

-- Insert initial CMS user with hashed password
-- Password will be 'S3b+4321' (to be hashed properly in the application)
INSERT INTO public.cms_users (email, password_hash, role) VALUES 
('adminS@lahuellaDelAsCuerdas.com', '$2b$10$placeholder_hash_will_be_set_by_app', 'admin');