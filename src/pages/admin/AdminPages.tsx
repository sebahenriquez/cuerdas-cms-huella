import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Eye, Plus, Trash2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getLanguages } from '@/lib/supabase-helpers';

interface Page {
  id: number;
  slug: string;
  template_type: string;
  status: string;
  created_at: string;
  page_contents: Array<{
    id: number;
    title: string;
    content: string;
    language_id: number;
  }>;
}

const AdminPages: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select(`
          *,
          page_contents(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Page[];
    }
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages
  });

  const deletePage = useMutation({
    mutationFn: async (pageId: number) => {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      toast({
        title: 'Página eliminada',
        description: 'La página ha sido eliminada correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la página.',
        variant: 'destructive',
      });
    }
  });

  const handleDelete = (pageId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta página?')) {
      deletePage.mutate(pageId);
    }
  };

  const getPageTitle = (page: Page, languageId: number) => {
    const content = page.page_contents.find(pc => pc.language_id === languageId);
    return content?.title || `Página ${page.id}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const defaultLanguage = languages.find(lang => lang.is_default);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Páginas</h1>
          <p className="text-muted-foreground">
            Administra todas las páginas del sitio web
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/pages/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Página
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>
                      {defaultLanguage ? getPageTitle(page, defaultLanguage.id) : page.slug}
                    </span>
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
                    disabled={deletePage.isPending}
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
                  {languages.map((language) => {
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

      {pages.length === 0 && (
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

export default AdminPages;