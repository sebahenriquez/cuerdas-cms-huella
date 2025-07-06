
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Trash2, Navigation, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getLanguages } from '@/lib/supabase-helpers';

interface NavigationItem {
  id: number;
  url: string;
  order_position: number;
  icon: string;
  navigation_contents: Array<{
    id: number;
    title: string;
    language_id: number;
  }>;
}

const AdminNavigation: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: navigationItems = [], isLoading } = useQuery({
    queryKey: ['admin-navigation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('navigation_items')
        .select(`
          *,
          navigation_contents(*)
        `)
        .order('order_position');
      
      if (error) throw error;
      return data as NavigationItem[];
    }
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages
  });

  const updateNavigationItem = useMutation({
    mutationFn: async ({ id, url, icon, contents }: { 
      id: number; 
      url: string; 
      icon: string; 
      contents: { language_id: number; title: string }[] 
    }) => {
      // Update navigation item
      const { error: itemError } = await supabase
        .from('navigation_items')
        .update({ url, icon })
        .eq('id', id);
      
      if (itemError) throw itemError;

      // Update contents for each language
      for (const content of contents) {
        const { error: contentError } = await supabase
          .from('navigation_contents')
          .upsert({
            navigation_id: id,
            language_id: content.language_id,
            title: content.title
          }, {
            onConflict: 'navigation_id,language_id'
          });
        
        if (contentError) throw contentError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-navigation'] });
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      setEditingItem(null);
      toast({
        title: 'Elemento actualizado',
        description: 'El elemento de navegación ha sido actualizado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el elemento de navegación.',
        variant: 'destructive',
      });
    }
  });

  const createNavigationItem = useMutation({
    mutationFn: async ({ url, icon, contents }: { 
      url: string; 
      icon: string; 
      contents: { language_id: number; title: string }[] 
    }) => {
      // Get max order position
      const { data: maxOrder } = await supabase
        .from('navigation_items')
        .select('order_position')
        .order('order_position', { ascending: false })
        .limit(1);
      
      const newOrder = (maxOrder?.[0]?.order_position || 0) + 1;

      // Create navigation item
      const { data: newItem, error: itemError } = await supabase
        .from('navigation_items')
        .insert({ url, icon, order_position: newOrder })
        .select()
        .single();
      
      if (itemError) throw itemError;

      // Create contents for each language
      for (const content of contents) {
        const { error: contentError } = await supabase
          .from('navigation_contents')
          .insert({
            navigation_id: newItem.id,
            language_id: content.language_id,
            title: content.title
          });
        
        if (contentError) throw contentError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-navigation'] });
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      setIsCreating(false);
      toast({
        title: 'Elemento creado',
        description: 'El nuevo elemento de navegación ha sido creado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el elemento de navegación.',
        variant: 'destructive',
      });
    }
  });

  const deleteNavigationItem = useMutation({
    mutationFn: async (itemId: number) => {
      const { error } = await supabase
        .from('navigation_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-navigation'] });
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      toast({
        title: 'Elemento eliminado',
        description: 'El elemento de navegación ha sido eliminado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el elemento de navegación.',
        variant: 'destructive',
      });
    }
  });

  const updateOrder = useMutation({
    mutationFn: async ({ itemId, newOrder }: { itemId: number; newOrder: number }) => {
      const { error } = await supabase
        .from('navigation_items')
        .update({ order_position: newOrder })
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-navigation'] });
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
    }
  });

  const handleSave = (formData: FormData) => {
    const url = formData.get('url') as string;
    const icon = formData.get('icon') as string;
    
    const contents = languages.map(lang => ({
      language_id: lang.id,
      title: formData.get(`title_${lang.id}`) as string
    }));

    if (editingItem) {
      updateNavigationItem.mutate({ id: editingItem.id, url, icon, contents });
    } else {
      createNavigationItem.mutate({ url, icon, contents });
    }
  };

  const handleDelete = (itemId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este elemento del menú?')) {
      deleteNavigationItem.mutate(itemId);
    }
  };

  const moveItem = (itemId: number, direction: 'up' | 'down') => {
    const currentItem = navigationItems.find(item => item.id === itemId);
    if (!currentItem) return;

    const currentIndex = navigationItems.findIndex(item => item.id === itemId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= navigationItems.length) return;

    const targetItem = navigationItems[targetIndex];
    
    // Swap order positions
    updateOrder.mutate({ itemId: currentItem.id, newOrder: targetItem.order_position });
    updateOrder.mutate({ itemId: targetItem.id, newOrder: currentItem.order_position });
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
          <h1 className="text-3xl font-bold">Gestión de Navegación</h1>
          <p className="text-muted-foreground">
            Administra los elementos del menú principal del sitio web
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Elemento
        </Button>
      </div>

      {(isCreating || editingItem) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Editar Elemento' : 'Crear Nuevo Elemento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    defaultValue={editingItem?.url || ''}
                    placeholder="/ruta-de-la-pagina"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icono</Label>
                  <Input
                    id="icon"
                    name="icon"
                    defaultValue={editingItem?.icon || ''}
                    placeholder="home, music, info, etc."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Títulos por Idioma</h3>
                {languages.map((language) => {
                  const existingContent = editingItem?.navigation_contents.find(
                    c => c.language_id === language.id
                  );
                  return (
                    <div key={language.id}>
                      <Label htmlFor={`title_${language.id}`}>
                        Título en {language.name}
                      </Label>
                      <Input
                        id={`title_${language.id}`}
                        name={`title_${language.id}`}
                        defaultValue={existingContent?.title || ''}
                        placeholder={`Título en ${language.name}`}
                        required
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={updateNavigationItem.isPending || createNavigationItem.isPending}>
                  {editingItem ? 'Actualizar' : 'Crear'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreating(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {navigationItems.map((item, index) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{item.url}</span>
                    {item.icon && (
                      <Badge variant="outline">{item.icon}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Posición: {item.order_position}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveItem(item.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveItem(item.id, 'down')}
                    disabled={index === navigationItems.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteNavigationItem.isPending}
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
                  <strong>Títulos por idioma:</strong>
                </p>
                <div className="flex space-x-2">
                  {languages.map((language) => {
                    const content = item.navigation_contents.find(
                      c => c.language_id === language.id
                    );
                    return (
                      <Badge key={language.id} variant="secondary">
                        {language.code.toUpperCase()}: {content?.title || 'Sin título'}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {navigationItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay elementos de navegación</h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando el primer elemento del menú principal.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Elemento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminNavigation;
