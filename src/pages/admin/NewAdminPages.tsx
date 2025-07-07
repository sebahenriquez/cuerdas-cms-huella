
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Eye, Plus, Trash2, FileText, RefreshCw } from 'lucide-react';
import { useSimpleQuery } from '@/hooks/useSimpleQuery';
import { pageService, PageData } from '@/lib/admin/page-service';
import { languageService } from '@/lib/admin/language-service';
import LoadingSpinner from '@/components/admin/common/LoadingSpinner';
import ErrorDisplay from '@/components/admin/common/ErrorDisplay';

const NewAdminPages: React.FC = () => {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: pages, loading: pagesLoading, error: pagesError } = useSimpleQuery(
    () => pageService.getAll(),
    [refreshKey]
  );

  const { data: languages, loading: languagesLoading, error: languagesError } = useSimpleQuery(
    () => languageService.getAll(),
    []
  );

  const loading = pagesLoading || languagesLoading;
  const error = pagesError || languagesError;

  const handleDelete = async (pageId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta página?')) return;

    try {
      await pageService.delete(pageId);
      toast({
        title: 'Página eliminada',
        description: 'La página ha sido eliminada correctamente.',
      });
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la página.',
        variant: 'destructive',
      });
    }
  };

  const getPageTitle = (page: PageData) => {
    if (!languages) return page.slug;
    
    const defaultLanguage = languages.find(lang => lang.is_default);
    if (!defaultLanguage) return page.slug;
    
    const content = page.page_contents.find(pc => pc.language_id === defaultLanguage.id);
    return content?.title || page.slug;
  };

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  if (loading) return <LoadingSpinner message="Cargando páginas..." />;
  if (error) return <ErrorDisplay error={error} onRetry={handleRefresh} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Páginas</h1>
          <p className="text-muted-foreground">
            Administra todas las páginas del sitio web
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button asChild>
            <Link to="/admin/pages/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Página
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {pages && pages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{getPageTitle(page)}</span>
                    <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                      {page.status === 'published' ? 'Publicada' : 'Borrador'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    /{page.slug} • {page.template_type}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/${page.slug}`} target="_blank">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/pages/${page.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Idiomas disponibles:</strong>
                </p>
                <div className="flex space-x-2">
                  {languages && languages.map((language) => {
                    const hasContent = page.page_contents.some(pc => pc.language_id === language.id);
                    return (
                      <Badge 
                        key={language.id} 
                        variant={hasContent ? 'default' : 'outline'}
                      >
                        {language.code.toUpperCase()}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pages && pages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay páginas</h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando tu primera página del sitio web.
            </p>
            <Button asChild>
              <Link to="/admin/pages/new">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Página
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewAdminPages;
