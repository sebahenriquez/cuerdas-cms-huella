import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getLanguages } from '@/lib/supabase-helpers';

interface PageContent {
  id?: number;
  title: string;
  content: string;
  meta_description: string;
  hero_image_url: string;
  language_id: number;
}

interface PageData {
  id: number;
  slug: string;
  template_type: string;
  status: string;
  page_contents: PageContent[];
}

const AdminPageEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pageId = parseInt(id || '0');

  const [pageData, setPageData] = useState<Partial<PageData>>({
    slug: '',
    template_type: 'standard',
    status: 'published',
    page_contents: []
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages
  });

  const { data: existingPage, isLoading } = useQuery({
    queryKey: ['page', pageId],
    queryFn: async () => {
      if (pageId === 0) return null;
      
      const { data, error } = await supabase
        .from('pages')
        .select(`
          *,
          page_contents(*)
        `)
        .eq('id', pageId)
        .single();
      
      if (error) throw error;
      return data as PageData;
    },
    enabled: pageId > 0
  });

  useEffect(() => {
    if (existingPage) {
      setPageData(existingPage);
    } else if (languages.length > 0 && pageData.page_contents.length === 0) {
      // Initialize empty content for all languages
      setPageData(prev => ({
        ...prev,
        page_contents: languages.map(lang => ({
          title: '',
          content: '',
          meta_description: '',
          hero_image_url: '',
          language_id: lang.id
        }))
      }));
    }
  }, [existingPage, languages]);

  const savePage = useMutation({
    mutationFn: async (data: Partial<PageData>) => {
      if (pageId > 0) {
        // Update existing page
        const { error: pageError } = await supabase
          .from('pages')
          .update({
            slug: data.slug,
            template_type: data.template_type,
            status: data.status
          })
          .eq('id', pageId);

        if (pageError) throw pageError;

        // Update or insert page contents
        for (const content of data.page_contents || []) {
          if (content.id) {
            const { error } = await supabase
              .from('page_contents')
              .update(content)
              .eq('id', content.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('page_contents')
              .insert({
                ...content,
                page_id: pageId
              });
            if (error) throw error;
          }
        }
      } else {
        // Create new page
        const { data: newPage, error: pageError } = await supabase
          .from('pages')
          .insert({
            slug: data.slug,
            template_type: data.template_type,
            status: data.status
          })
          .select()
          .single();

        if (pageError) throw pageError;

        // Insert page contents
        for (const content of data.page_contents || []) {
          const { error } = await supabase
            .from('page_contents')
            .insert({
              ...content,
              page_id: newPage.id
            });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      // Invalidate all possible caches that could contain this page data
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', pageId] });
      queryClient.invalidateQueries({ queryKey: ['page'] }); // Invalidate all page queries
      queryClient.invalidateQueries({ queryKey: ['pages'] }); // Invalidate pages queries
      
      toast({
        title: 'Página guardada',
        description: 'Los cambios han sido guardados correctamente.',
      });
      navigate('/admin/pages');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
      console.error('Error saving page:', error);
    }
  });

  const updatePageContent = (languageId: number, field: keyof PageContent, value: string) => {
    setPageData(prev => ({
      ...prev,
      page_contents: prev.page_contents?.map(content =>
        content.language_id === languageId
          ? { ...content, [field]: value }
          : content
      ) || []
    }));
  };

  const handleSave = () => {
    savePage.mutate(pageData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/pages')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Páginas
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {pageId > 0 ? 'Editar Página' : 'Nueva Página'}
            </h1>
            <p className="text-muted-foreground">
              {pageId > 0 ? `Editando: ${pageData.slug}` : 'Crear una nueva página'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={savePage.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {savePage.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Configuración general de la página</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="slug">URL/Slug</Label>
              <Input
                id="slug"
                value={pageData.slug || ''}
                onChange={(e) => setPageData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="mi-pagina"
              />
            </div>
            
            <div>
              <Label htmlFor="template">Tipo de Plantilla</Label>
              <Select
                value={pageData.template_type || ''}
                onValueChange={(value) => setPageData(prev => ({ ...prev, template_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Estándar</SelectItem>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="landing">Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={pageData.status || ''}
                onValueChange={(value) => setPageData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Contenido</CardTitle>
            <CardDescription>Edita el contenido en diferentes idiomas</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={languages[0]?.code} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                {languages.map((language) => (
                  <TabsTrigger key={language.id} value={language.code}>
                    {language.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {languages.map((language) => {
                const content = pageData.page_contents?.find(c => c.language_id === language.id);
                
                return (
                  <TabsContent key={language.id} value={language.code} className="space-y-4">
                    <div>
                      <Label htmlFor={`title-${language.id}`}>Título</Label>
                      <Input
                        id={`title-${language.id}`}
                        value={content?.title || ''}
                        onChange={(e) => updatePageContent(language.id, 'title', e.target.value)}
                        placeholder="Título de la página"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`content-${language.id}`}>Contenido</Label>
                      <RichTextEditor
                        content={content?.content || ''}
                        onChange={(value) => updatePageContent(language.id, 'content', value)}
                        placeholder="Contenido de la página"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`meta-${language.id}`}>Meta Descripción</Label>
                      <Textarea
                        id={`meta-${language.id}`}
                        value={content?.meta_description || ''}
                        onChange={(e) => updatePageContent(language.id, 'meta_description', e.target.value)}
                        placeholder="Descripción para SEO"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`hero-${language.id}`}>Imagen Hero (URL)</Label>
                      <Input
                        id={`hero-${language.id}`}
                        value={content?.hero_image_url || ''}
                        onChange={(e) => updatePageContent(language.id, 'hero_image_url', e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPageEdit;