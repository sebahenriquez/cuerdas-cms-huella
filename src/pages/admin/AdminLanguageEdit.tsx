import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LanguageData {
  id?: number;
  name: string;
  code: string;
  is_default: boolean;
}

const AdminLanguageEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const languageId = parseInt(id || '0');

  const [languageData, setLanguageData] = useState<LanguageData>({
    name: '',
    code: '',
    is_default: false
  });

  const { data: existingLanguage, isLoading } = useQuery({
    queryKey: ['language', languageId],
    queryFn: async () => {
      if (languageId === 0) return null;
      
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('id', languageId)
        .single();
      
      if (error) throw error;
      return data as LanguageData;
    },
    enabled: languageId > 0
  });

  useEffect(() => {
    if (existingLanguage) {
      setLanguageData(existingLanguage);
    }
  }, [existingLanguage]);

  const saveLanguage = useMutation({
    mutationFn: async (data: LanguageData) => {
      if (languageId > 0) {
        // Update existing language
        const { error } = await supabase
          .from('languages')
          .update({
            name: data.name,
            code: data.code,
            is_default: data.is_default
          })
          .eq('id', languageId);

        if (error) throw error;

        // If this language is being set as default, remove default from others
        if (data.is_default) {
          const { error: removeDefaultError } = await supabase
            .from('languages')
            .update({ is_default: false })
            .neq('id', languageId);

          if (removeDefaultError) throw removeDefaultError;
        }
      } else {
        // Create new language
        const { error } = await supabase
          .from('languages')
          .insert({
            name: data.name,
            code: data.code,
            is_default: data.is_default
          });

        if (error) throw error;

        // If this language is being set as default, remove default from others
        if (data.is_default) {
          const { error: removeDefaultError } = await supabase
            .from('languages')
            .update({ is_default: false })
            .neq('code', data.code);

          if (removeDefaultError) throw removeDefaultError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      queryClient.invalidateQueries({ queryKey: ['language', languageId] });
      toast({
        title: 'Idioma guardado',
        description: 'Los cambios han sido guardados correctamente.',
      });
      navigate('/admin/languages');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
      console.error('Error saving language:', error);
    }
  });

  const handleSave = () => {
    if (!languageData.name || !languageData.code) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos.',
        variant: 'destructive',
      });
      return;
    }
    saveLanguage.mutate(languageData);
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
          <Button variant="ghost" onClick={() => navigate('/admin/languages')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Idiomas
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {languageId > 0 ? 'Editar Idioma' : 'Nuevo Idioma'}
            </h1>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saveLanguage.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveLanguage.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Idioma</CardTitle>
          <CardDescription>Configura los detalles del idioma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name">Nombre del Idioma</Label>
            <Input
              id="name"
              value={languageData.name}
              onChange={(e) => setLanguageData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Español, English, Français..."
            />
          </div>
          
          <div>
            <Label htmlFor="code">Código del Idioma</Label>
            <Input
              id="code"
              value={languageData.code}
              onChange={(e) => setLanguageData(prev => ({ ...prev, code: e.target.value.toLowerCase() }))}
              placeholder="es, en, fr..."
              maxLength={5}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Código ISO de 2-3 letras para el idioma
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_default"
              checked={languageData.is_default}
              onCheckedChange={(checked) => setLanguageData(prev => ({ ...prev, is_default: checked }))}
            />
            <Label htmlFor="is_default">Idioma por defecto</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Si activas esta opción, este idioma se convertirá en el idioma principal del sitio web.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLanguageEdit;