import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Trash2, Globe, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLanguages } from '@/lib/supabase-helpers';
import { supabase } from '@/integrations/supabase/client';

interface Language {
  id: number;
  name: string;
  code: string;
  is_default: boolean;
  created_at: string;
}

const AdminLanguages: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ['admin-languages'],
    queryFn: getLanguages
  });

  const setDefaultLanguage = useMutation({
    mutationFn: async (languageId: number) => {
      // First, remove default from all languages
      const { error: removeDefaultError } = await supabase
        .from('languages')
        .update({ is_default: false })
        .neq('id', 0);

      if (removeDefaultError) throw removeDefaultError;

      // Then set the new default
      const { error: setDefaultError } = await supabase
        .from('languages')
        .update({ is_default: true })
        .eq('id', languageId);

      if (setDefaultError) throw setDefaultError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast({
        title: 'Idioma por defecto actualizado',
        description: 'El idioma por defecto ha sido cambiado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el idioma por defecto.',
        variant: 'destructive',
      });
    }
  });

  const handleSetDefault = (languageId: number) => {
    setDefaultLanguage.mutate(languageId);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Idiomas</h1>
          <p className="text-muted-foreground">
            Administra los idiomas disponibles en el sitio web
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/languages/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Idioma
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {languages.map((language) => (
          <Card key={language.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-3">
                    <Globe className="h-5 w-5" />
                    <span>{language.name}</span>
                    <Badge variant="outline">
                      {language.code.toUpperCase()}
                    </Badge>
                    {language.is_default && (
                      <Badge variant="default" className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>Por defecto</span>
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Código ISO: {language.code} • Creado: {new Date(language.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                
                <div className="flex space-x-2">
                  {!language.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(language.id)}
                      disabled={setDefaultLanguage.isPending}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Hacer Defecto
                    </Button>
                  )}

                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/languages/${language.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Estado</h4>
                  <Badge variant={language.is_default ? 'default' : 'secondary'}>
                    {language.is_default ? 'Idioma Principal' : 'Idioma Secundario'}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Código</h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    {language.code}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Configuración</h4>
                  <p className="text-sm text-muted-foreground">
                    {language.is_default ? 'Usado como predeterminado' : 'Idioma adicional'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {languages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay idiomas configurados</h3>
            <p className="text-muted-foreground mb-4">
              Agrega idiomas para crear contenido multilingüe.
            </p>
            <Button asChild>
              <Link to="/admin/languages/new">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Idioma
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminLanguages;