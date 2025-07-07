import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Image, GripVertical, Edit2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PhotoContent {
  id?: number;
  title: string;
  description: string;
  language_id: number;
}

interface TrackPhoto {
  id: number;
  track_id: number;
  image_url: string;
  caption_es: string;
  caption_en: string;
  order_position: number;
  media_file_id?: number;
  photo_contents?: PhotoContent[];
}

interface Track {
  id: number;
  order_position: number;
  track_contents: Array<{
    title: string;
    language_id: number;
    menu_title: string;
  }>;
}

const AdminTrackPhotos: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTrack, setSelectedTrack] = useState<number>(1);
  const [editingPhoto, setEditingPhoto] = useState<TrackPhoto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch tracks
  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks-for-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select(`
          id,
          order_position,
          track_contents(title, language_id, menu_title)
        `)
        .order('order_position');
      
      if (error) throw error;
      return data as Track[];
    }
  });

  // Fetch photos for selected track
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['track-photos', selectedTrack],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('track_featured_images')
        .select('*')
        .eq('track_id', selectedTrack)
        .order('order_position');
      
      if (error) throw error;
      return data as TrackPhoto[];
    },
    enabled: selectedTrack > 0
  });

  // Save photo mutation
  const savePhotoMutation = useMutation({
    mutationFn: async (photoData: Partial<TrackPhoto> & { isNew?: boolean }) => {
      const { isNew, photo_contents, ...mainData } = photoData;
      
      if (isNew) {
        // Create new photo
        const { data: newPhoto, error: photoError } = await supabase
          .from('track_featured_images')
          .insert({
            ...mainData,
            track_id: selectedTrack,
            order_position: photos.length + 1
          })
          .select()
          .single();

        if (photoError) throw photoError;

        // Update caption fields with content from photo_contents if provided
        if (photo_contents) {
          const spanishContent = photo_contents.find(c => c.language_id === 2);
          const englishContent = photo_contents.find(c => c.language_id === 1);
          
          const { error: updateError } = await supabase
            .from('track_featured_images')
            .update({
              caption_es: spanishContent?.description || '',
              caption_en: englishContent?.description || ''
            })
            .eq('id', newPhoto.id);

          if (updateError) throw updateError;
        }
      } else {
        // Update existing photo
        const updateData = { ...mainData };
        
        // Update caption fields with content from photo_contents if provided
        if (photo_contents) {
          const spanishContent = photo_contents.find(c => c.language_id === 2);
          const englishContent = photo_contents.find(c => c.language_id === 1);
          
          updateData.caption_es = spanishContent?.description || '';
          updateData.caption_en = englishContent?.description || '';
        }

        const { error: photoError } = await supabase
          .from('track_featured_images')
          .update(updateData)
          .eq('id', mainData.id);

        if (photoError) throw photoError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-photos', selectedTrack] });
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
        .from('track_featured_images')
        .delete()
        .eq('id', photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-photos', selectedTrack] });
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
          .from('track_featured_images')
          .update({ order_position: update.order_position })
          .eq('id', update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-photos', selectedTrack] });
    }
  });

  const handleCreatePhoto = () => {
    setEditingPhoto({
      id: 0,
      track_id: selectedTrack,
      image_url: '',
      caption_es: '',
      caption_en: '',
      order_position: photos.length + 1,
      photo_contents: [
        { title: '', description: '', language_id: 1 }, // English
        { title: '', description: '', language_id: 2 }  // Spanish
      ]
    });
    setIsDialogOpen(true);
  };

  const handleEditPhoto = (photo: TrackPhoto) => {
    // Create photo_contents from existing captions
    const photoContents = [
      { title: '', description: photo.caption_en || '', language_id: 1 }, // English
      { title: '', description: photo.caption_es || '', language_id: 2 }  // Spanish
    ];

    setEditingPhoto({
      ...photo,
      photo_contents: photoContents
    });
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

  const updatePhotoContent = (languageId: number, field: 'title' | 'description', value: string) => {
    if (!editingPhoto || !editingPhoto.photo_contents) return;
    
    const updatedContents = editingPhoto.photo_contents.map(content =>
      content.language_id === languageId
        ? { ...content, [field]: value }
        : content
    );
    
    setEditingPhoto({
      ...editingPhoto,
      photo_contents: updatedContents
    });
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

  const getPhotoTitle = (photo: TrackPhoto) => {
    // Since we don't have separate title storage for photos yet, use caption as title
    return photo.caption_es || photo.caption_en || 'Sin título';
  };

  const getTrackTitle = (track: Track) => {
    const spanishContent = track.track_contents?.find(c => c.language_id === 2);
    return spanishContent?.menu_title || spanishContent?.title || `Track ${track.order_position}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Fotos por Track</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Track Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Tracks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tracks.map((track) => (
              <Button
                key={track.id}
                variant={selectedTrack === track.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedTrack(track.id)}
              >
                <span className="font-medium">{track.order_position}</span>
                <span className="ml-2 truncate">{getTrackTitle(track)}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Photos Management */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Fotos - Track {tracks.find(t => t.id === selectedTrack)?.order_position}
                <Badge variant="secondary" className="ml-2">
                  {photos.length} fotos
                </Badge>
              </CardTitle>
              <Button size="sm" onClick={handleCreatePhoto}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Foto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {photosLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay fotos para este track
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
                      alt="Foto del track"
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                      }}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="font-medium">
                        Posición #{photo.order_position} - {getPhotoTitle(photo)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        URL: {photo.image_url}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div><strong>ES:</strong> {photo.caption_es || 'Sin descripción'}</div>
                        <div><strong>EN:</strong> {photo.caption_en || 'Sin descripción'}</div>
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
      </div>

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
                    value={editingPhoto.image_url}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, image_url: e.target.value })
                    }
                    placeholder="https://ejemplo.com/imagen.jpg"
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
              
              <Tabs defaultValue="es" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="es">Español</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="es" className="space-y-4">
                  <div>
                    <Label htmlFor="title-es">Título en Español</Label>
                    <Input
                      id="title-es"
                      value={editingPhoto.photo_contents?.find(c => c.language_id === 2)?.title || ''}
                      onChange={(e) => updatePhotoContent(2, 'title', e.target.value)}
                      placeholder="Título de la imagen en español"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description-es">Descripción en Español</Label>
                    <Textarea
                      id="description-es"
                      value={editingPhoto.photo_contents?.find(c => c.language_id === 2)?.description || ''}
                      onChange={(e) => updatePhotoContent(2, 'description', e.target.value)}
                      placeholder="Descripción de la imagen en español"
                      rows={3}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4">
                  <div>
                    <Label htmlFor="title-en">Title in English</Label>
                    <Input
                      id="title-en"
                      value={editingPhoto.photo_contents?.find(c => c.language_id === 1)?.title || ''}
                      onChange={(e) => updatePhotoContent(1, 'title', e.target.value)}
                      placeholder="Image title in English"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description-en">Description in English</Label>
                    <Textarea
                      id="description-en"
                      value={editingPhoto.photo_contents?.find(c => c.language_id === 1)?.description || ''}
                      onChange={(e) => updatePhotoContent(1, 'description', e.target.value)}
                      placeholder="Image description in English"
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
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

export default AdminTrackPhotos;