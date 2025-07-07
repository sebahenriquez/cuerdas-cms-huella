
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useSimpleQuery } from '@/hooks/useSimpleQuery';
import { pageService, PageData, PageContent } from '@/lib/admin/page-service';
import { languageService } from '@/lib/admin/language-service';
import LoadingSpinner from '@/components/admin/common/LoadingSpinner';
import ErrorDisplay from '@/components/admin/common/ErrorDisplay';

const NewAdminPageEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === 'new';
  const pageId = isNew ? 0 : parseInt(id || '0');

  const [pageData, setPageData] = useState<Partial<PageData>>({
    slug: '',
    template_type: 'standard',
    status: 'published',
    page_contents: []
  });

  const [saving, setSaving] = useState(false);

  const { data: existingPage, loading: pageLoading, error: pageError } = useSimpleQuery(
    () => isNew ? Promise.resolve(null) : pageService.getById(pageId),
    [pageId]
  );

  const { data: languages, loading: languagesLoading, error: languagesError } = useSimpleQuery(
    () => languageService.getAll(),
    []
  );

  const loading = pageLoading || languagesLoading;
  const error = pageError || languagesError;

  useEffect(() => {
    if (existingPage) {
      setPageData(existingPage);
    } else if (languages && languages.length > 0 && pageData.page_contents?.length === 0) {
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

  const handleSave = async () => {
    if (!pageData.slug) {
      toast({
        title: 'Error',
        description: 'El slug es requerido.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await pageService.create(pageData as Omit<PageData, 'id'>);
        toast({
          title: 'Página creada',
          description: 'La página ha sido creada correctamente.',
        });
      } else {
        await pageService.update(pageId, pageData);
        toast({
          title: 'Página actualizada',
          description: 'Los cambios han sido guardados correctamente.',
        });
      }
      navigate('/admin/pages');
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando editor..." />;
  if (error) return <ErrorDisplay error={error} />;
  if (!languages || languages.length === 0) {
    return <ErrorDisplay error="No se encontraron idiomas configurados." />;
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
              {isNew ? 'Nueva Página' : 'Editar Página'}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? 'Crear una nueva página' : `Editando: ${pageData.slug}`}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                      <div className="mt-2">
                        <RichTextEditor
                          content={content?.content || ''}
                          onChange={(value) => updatePageContent(language.id, 'content', value)}
                          placeholder="Contenido de la página"
                        />
                      </div>
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

export default NewAdminPageEdit;
