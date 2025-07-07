import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Edit2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GalleryPhoto {
  id: number;
  image_url: string;
  order_position: number;
  is_active: boolean;
}

const AdminGalleryPhotos: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPhoto, setEditingPhoto] = useState<Partial<GalleryPhoto> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch gallery photos
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['admin-gallery-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('order_position');
      
      if (error) throw error;
      return data as GalleryPhoto[];
    }
  });

  // Save photo mutation
  const savePhotoMutation = useMutation({
    mutationFn: async (photoData: Partial<GalleryPhoto> & { isNew?: boolean }) => {
      const { isNew, ...mainData } = photoData;
      
      if (isNew) {
        // Create new photo
        const { error } = await supabase
          .from('gallery_photos')
          .insert({
            image_url: mainData.image_url || '',
            order_position: photos.length + 1,
            is_active: mainData.is_active ?? true
          });

        if (error) throw error;
      } else {
        // Update existing photo
        const { error } = await supabase
          .from('gallery_photos')
          .update(mainData)
          .eq('id', mainData.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos'] });
      setEditingPhoto(null);
      setIsDialogOpen(false);
      toast({
        title: 'Foto guardada',
        description: 'La foto ha sido guardada correctamente.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos'] });
      toast({
        title: 'Foto eliminada',
        description: 'La foto ha sido eliminada correctamente.'
      });
    }
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (updates: Array<{ id: number; order_position: number }>) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('gallery_photos')
          .update({ order_position: update.order_position })
          .eq('id', update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos'] });
    }
  });

  const handleCreatePhoto = () => {
    setEditingPhoto({
      id: 0,
      image_url: '',
      order_position: photos.length + 1,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleEditPhoto = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setIsDialogOpen(true);
  };

  const handleSavePhoto = () => {
    if (editingPhoto) {
      savePhotoMutation.mutate({
        ...editingPhoto,
        isNew: editingPhoto.id === 0
      });
    }
  };

  const movePhoto = (dragIndex: number, hoverIndex: number) => {
    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[dragIndex];
    newPhotos.splice(dragIndex, 1);
    newPhotos.splice(hoverIndex, 0, draggedPhoto);
    
    const updates = newPhotos.map((photo, index) => ({
      id: photo.id,
      order_position: index + 1
    }));
    
    updateOrderMutation.mutate(updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Galería de Fotos</h1>
        <Button onClick={handleCreatePhoto}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Foto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Fotos de la Galería Principal
              <Badge variant="secondary" className="ml-2">
                {photos.length} fotos
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {photosLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay fotos en la galería
            </div>
          ) : (
            <div className="space-y-4">
              {photos.map((photo, index) => (
                <div key={photo.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="cursor-move">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <img
                    src={photo.image_url}
                    alt="Foto de galería"
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                    }}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">
                      Posición #{photo.order_position}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      URL: {photo.image_url}
                    </div>
                    <div className="text-sm">
                      <Badge variant={photo.is_active ? "default" : "secondary"}>
                        {photo.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-x-2">
                    {photo.image_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(photo.image_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPhoto(photo)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePhotoMutation.mutate(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Photo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPhoto?.id === 0 ? 'Agregar Nueva Foto' : 'Editar Foto'}
            </DialogTitle>
          </DialogHeader>
          
          {editingPhoto && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-url">URL de la Imagen</Label>
                  <Input
                    id="image-url"
                    value={editingPhoto.image_url || ''}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, image_url: e.target.value })
                    }
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="order-position">Posición</Label>
                  <Input
                    id="order-position"
                    type="number"
                    value={editingPhoto.order_position || 0}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, order_position: parseInt(e.target.value) || 0 })
                    }
                    min="1"
                  />
                </div>
              </div>

              {editingPhoto.image_url && (
                <div className="flex justify-center">
                  <img
                    src={editingPhoto.image_url}
                    alt="Preview"
                    className="max-w-xs max-h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingPhoto(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSavePhoto}
                  disabled={savePhotoMutation.isPending}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGalleryPhotos;