import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Code, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Template {
  type: string;
  name: string;
  description: string;
  html_structure: string;
  css_styles: string;
}

const defaultTemplates: Template[] = [
  {
    type: 'standard',
    name: 'Estándar',
    description: 'Plantilla básica con layout estándar',
    html_structure: `<div class="template-standard">
  <header class="template-header">
    {{title}}
  </header>
  <main class="template-content">
    {{content}}
  </main>
  <aside class="template-sidebar">
    {{sidebar}}
  </aside>
</div>`,
    css_styles: `.template-standard {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.template-header {
  grid-column: 1 / -1;
  margin-bottom: 2rem;
}

.template-content {
  line-height: 1.6;
}

.template-sidebar {
  padding: 1rem;
  background: var(--muted);
  border-radius: 0.5rem;
}`
  },
  {
    type: 'hero',
    name: 'Hero',
    description: 'Plantilla con sección hero prominente',
    html_structure: `<div class="template-hero">
  <section class="hero-section">
    <div class="hero-background">
      {{hero_image}}
    </div>
    <div class="hero-content">
      <h1 class="hero-title">{{title}}</h1>
      <p class="hero-subtitle">{{subtitle}}</p>
    </div>
  </section>
  <main class="hero-main">
    {{content}}
  </main>
</div>`,
    css_styles: `.template-hero {
  width: 100%;
}

.hero-section {
  position: relative;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
  padding: 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
}

.hero-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
}`
  },
  {
    type: 'landing',
    name: 'Landing Page',
    description: 'Plantilla optimizada para landing pages',
    html_structure: `<div class="template-landing">
  <section class="landing-hero">
    <div class="landing-hero-content">
      <h1 class="landing-title">{{title}}</h1>
      <p class="landing-description">{{description}}</p>
      <div class="landing-cta">
        {{cta_button}}
      </div>
    </div>
  </section>
  
  <section class="landing-features">
    <div class="features-grid">
      {{features}}
    </div>
  </section>
  
  <section class="landing-content">
    {{content}}
  </section>
</div>`,
    css_styles: `.template-landing {
  width: 100%;
}

.landing-hero {
  background: linear-gradient(135deg, var(--primary), var(--primary-glow));
  color: white;
  padding: 6rem 2rem;
  text-align: center;
}

.landing-hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.landing-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.landing-description {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.landing-cta {
  margin-top: 2rem;
}

.landing-features {
  padding: 4rem 2rem;
  background: var(--muted);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.landing-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
}`
  }
];

const AdminTemplates: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(defaultTemplates[0]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const { data: templates = defaultTemplates } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .like('key', 'template_%');
      
      if (error) throw error;
      
      // Convert settings back to template format
      const templateMap: Record<string, Partial<Template>> = {};
      data.forEach(setting => {
        const [, type, field] = setting.key.split('_');
        if (!templateMap[type]) templateMap[type] = { type };
        templateMap[type][field as keyof Template] = setting.value;
      });
      
      // Merge with defaults
      return defaultTemplates.map(defaultTemplate => ({
        ...defaultTemplate,
        ...templateMap[defaultTemplate.type]
      }));
    }
  });

  const saveTemplate = useMutation({
    mutationFn: async (template: Template) => {
      const settings = [
        { key: `template_${template.type}_name`, value: template.name },
        { key: `template_${template.type}_description`, value: template.description },
        { key: `template_${template.type}_html_structure`, value: template.html_structure },
        { key: `template_${template.type}_css_styles`, value: template.css_styles }
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            language_id: null
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      toast({
        title: 'Plantilla guardada',
        description: 'Los cambios han sido guardados correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
      console.error('Error saving template:', error);
    }
  });

  const updateTemplate = (field: keyof Template, value: string) => {
    setSelectedTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    saveTemplate.mutate(selectedTemplate);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editor de Plantillas</h1>
          <p className="text-muted-foreground">
            Edita las plantillas HTML y CSS del sitio
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? <Code className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isPreviewMode ? 'Editar' : 'Vista Previa'}
          </Button>
          <Button onClick={handleSave} disabled={saveTemplate.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveTemplate.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Plantillas</CardTitle>
            <CardDescription>Selecciona una plantilla para editar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((template) => (
              <Button
                key={template.type}
                variant={selectedTemplate.type === template.type ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="text-left">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {template.description}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Editando: {selectedTemplate.name}</CardTitle>
            <CardDescription>{selectedTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {!isPreviewMode ? (
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="html">Estructura HTML</TabsTrigger>
                  <TabsTrigger value="css">Estilos CSS</TabsTrigger>
                </TabsList>
                
                <TabsContent value="html" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Estructura HTML
                    </label>
                    <Textarea
                      value={selectedTemplate.html_structure}
                      onChange={(e) => updateTemplate('html_structure', e.target.value)}
                      placeholder="Estructura HTML de la plantilla"
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Usa variables como {'{{title}}'}, {'{{content}}'}, etc. para contenido dinámico
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="css" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Estilos CSS
                    </label>
                    <Textarea
                      value={selectedTemplate.css_styles}
                      onChange={(e) => updateTemplate('css_styles', e.target.value)}
                      placeholder="Estilos CSS de la plantilla"
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Usa variables CSS como var(--primary), var(--background), etc.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vista Previa</h3>
                <div className="border rounded-lg p-4 bg-background">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: selectedTemplate.html_structure
                        .replace(/\{\{title\}\}/g, 'Título de Ejemplo')
                        .replace(/\{\{content\}\}/g, '<p>Contenido de ejemplo para la plantilla. Este texto muestra cómo se vería el contenido real en esta plantilla.</p>')
                        .replace(/\{\{.*?\}\}/g, 'Contenido...')
                    }}
                  />
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">CSS Aplicado:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {selectedTemplate.css_styles}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTemplates;