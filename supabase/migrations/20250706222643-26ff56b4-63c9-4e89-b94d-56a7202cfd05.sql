
-- Crear tabla para almacenar las secciones de contenido de About
CREATE TABLE public.about_sections (
  id SERIAL PRIMARY KEY,
  section_key VARCHAR(50) NOT NULL UNIQUE,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para el contenido multilingüe de las secciones About
CREATE TABLE public.about_section_contents (
  id SERIAL PRIMARY KEY,
  about_section_id INTEGER REFERENCES about_sections(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  subtitle VARCHAR(255),
  metadata JSONB, -- Para almacenar datos adicionales como iconos, números, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(about_section_id, language_id)
);

-- Crear tabla para las tarjetas con íconos (features cards)
CREATE TABLE public.about_feature_cards (
  id SERIAL PRIMARY KEY,
  card_key VARCHAR(50) NOT NULL UNIQUE,
  icon_name VARCHAR(50),
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para el contenido multilingüe de las tarjetas
CREATE TABLE public.about_feature_card_contents (
  id SERIAL PRIMARY KEY,
  feature_card_id INTEGER REFERENCES about_feature_cards(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(feature_card_id, language_id)
);

-- Crear tabla para las estadísticas del proyecto
CREATE TABLE public.about_project_stats (
  id SERIAL PRIMARY KEY,
  stat_key VARCHAR(50) NOT NULL UNIQUE,
  number_value INTEGER,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para el contenido multilingüe de las estadísticas
CREATE TABLE public.about_project_stat_contents (
  id SERIAL PRIMARY KEY,
  project_stat_id INTEGER REFERENCES about_project_stats(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_stat_id, language_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_section_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_feature_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_feature_card_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_project_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_project_stat_contents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lectura pública
CREATE POLICY "About sections are publicly readable" ON public.about_sections FOR SELECT USING (true);
CREATE POLICY "About section contents are publicly readable" ON public.about_section_contents FOR SELECT USING (true);
CREATE POLICY "About feature cards are publicly readable" ON public.about_feature_cards FOR SELECT USING (true);
CREATE POLICY "About feature card contents are publicly readable" ON public.about_feature_card_contents FOR SELECT USING (true);
CREATE POLICY "About project stats are publicly readable" ON public.about_project_stats FOR SELECT USING (true);
CREATE POLICY "About project stat contents are publicly readable" ON public.about_project_stat_contents FOR SELECT USING (true);

-- Políticas RLS para administración CMS
CREATE POLICY "CMS users can manage about sections" ON public.about_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "CMS users can manage about section contents" ON public.about_section_contents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "CMS users can manage about feature cards" ON public.about_feature_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "CMS users can manage about feature card contents" ON public.about_feature_card_contents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "CMS users can manage about project stats" ON public.about_project_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "CMS users can manage about project stat contents" ON public.about_project_stat_contents FOR ALL USING (true) WITH CHECK (true);

-- Insertar datos iniciales para las secciones
INSERT INTO public.about_sections (section_key, order_position) VALUES
('hero', 1),
('general_explanation', 2),
('feature_cards', 3),
('book_introduction', 4),
('project_stats', 5);

-- Insertar las tarjetas de características
INSERT INTO public.about_feature_cards (card_key, icon_name, order_position) VALUES
('book', 'book', 1),
('vinyl', 'vinyl', 2),
('augmented_reality', 'smartphone', 3);

-- Insertar las estadísticas del proyecto
INSERT INTO public.about_project_stats (stat_key, number_value, order_position) VALUES
('instruments', 14, 1),
('artists', 17, 2),
('countries', 7, 3);
