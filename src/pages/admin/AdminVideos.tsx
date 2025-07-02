import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Play, Plus, Trash2, Video, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface VideoData {
  id: number;
  vimeo_url: string;
  thumbnail_url: string;
  order_position: number;
  track_id: number;
  video_contents: Array<{
    title: string;
    description: string;
    language_id: number;
  }>;
}

const AdminVideos: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          video_contents(*)
        `)
        .order('order_position', { ascending: true });
      
      if (error) throw error;
      return data as VideoData[];
    }
  });

  const deleteVideo = useMutation({
    mutationFn: async (videoId: number) => {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      toast({
        title: 'Video eliminado',
        description: 'El video ha sido eliminado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el video.',
        variant: 'destructive',
      });
    }
  });

  const handleDelete = (videoId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este video?')) {
      deleteVideo.mutate(videoId);
    }
  };

  const getVideoTitle = (video: VideoData) => {
    return video.video_contents?.[0]?.title || `Video ${video.order_position}`;
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
          <h1 className="text-3xl font-bold">Gestión de Videos</h1>
          <p className="text-muted-foreground">
            Administra todos los videos del proyecto
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/videos/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Video
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {video.order_position}
                    </span>
                    <span>{getVideoTitle(video)}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {video.video_contents?.[0]?.description || 'Sin descripción'}
                  </CardDescription>
                </div>
                
                <div className="flex space-x-2">
                  {video.vimeo_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(video.vimeo_url, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Ver Video
                    </Button>
                  )}

                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/videos/${video.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(video.id)}
                    disabled={deleteVideo.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Información del Video</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Track ID: {video.track_id || 'No asignado'}</p>
                    <p>Posición: {video.order_position}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Enlaces</h4>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    <span className="truncate">
                      {video.vimeo_url ? 'Video de Vimeo disponible' : 'Sin video'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay videos</h3>
            <p className="text-muted-foreground mb-4">
              Comienza agregando tu primer video al proyecto.
            </p>
            <Button asChild>
              <Link to="/admin/videos/new">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Video
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminVideos;