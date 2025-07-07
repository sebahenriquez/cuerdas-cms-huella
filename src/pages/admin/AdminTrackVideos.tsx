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
import { Plus, Trash2, Video, GripVertical, Edit2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VideoContent {
  id?: number;
  title: string;
  description: string;
  language_id: number;
}

interface TrackVideo {
  id: number;
  track_id: number;
  vimeo_url: string;
  thumbnail_url?: string;
  order_position: number;
  video_contents: VideoContent[];
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

const AdminTrackVideos: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTrack, setSelectedTrack] = useState<number>(1);
  const [editingVideo, setEditingVideo] = useState<TrackVideo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch tracks
  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks-for-videos'],
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

  // Fetch videos for selected track
  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['track-videos', selectedTrack],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          video_contents(*)
        `)
        .eq('track_id', selectedTrack)
        .order('order_position');
      
      if (error) throw error;
      return data as TrackVideo[];
    },
    enabled: selectedTrack > 0
  });

  // Save video mutation
  const saveVideoMutation = useMutation({
    mutationFn: async (videoData: Partial<TrackVideo> & { isNew?: boolean }) => {
      const { isNew, video_contents, ...mainData } = videoData;
      
      if (isNew) {
        // Create new video
        const { data: newVideo, error: videoError } = await supabase
          .from('videos')
          .insert({
            ...mainData,
            track_id: selectedTrack,
            order_position: videos.length + 1
          })
          .select()
          .single();

        if (videoError) throw videoError;

        // Create video contents for both languages
        if (video_contents) {
          for (const content of video_contents) {
            const { error: contentError } = await supabase
              .from('video_contents')
              .insert({
                video_id: newVideo.id,
                title: content.title,
                description: content.description,
                language_id: content.language_id
              });
            if (contentError) throw contentError;
          }
        }
      } else {
        // Update existing video
        const { error: videoError } = await supabase
          .from('videos')
          .update(mainData)
          .eq('id', mainData.id);

        if (videoError) throw videoError;

        // Update video contents
        if (video_contents) {
          for (const content of video_contents) {
            if (content.id) {
              const { error } = await supabase
                .from('video_contents')
                .update({
                  title: content.title,
                  description: content.description
                })
                .eq('id', content.id);
              if (error) throw error;
            } else {
              const { error } = await supabase
                .from('video_contents')
                .insert({
                  video_id: mainData.id,
                  title: content.title,
                  description: content.description,
                  language_id: content.language_id
                });
              if (error) throw error;
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-videos', selectedTrack] });
      setEditingVideo(null);
      setIsDialogOpen(false);
      toast({
        title: 'Video guardado',
        description: 'El video ha sido guardado correctamente.'
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

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-videos', selectedTrack] });
      toast({
        title: 'Video eliminado',
        description: 'El video ha sido eliminado correctamente.'
      });
    }
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (updates: Array<{ id: number; order_position: number }>) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('videos')
          .update({ order_position: update.order_position })
          .eq('id', update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-videos', selectedTrack] });
    }
  });

  const handleCreateVideo = () => {
    setEditingVideo({
      id: 0,
      track_id: selectedTrack,
      vimeo_url: '',
      thumbnail_url: '',
      order_position: videos.length + 1,
      video_contents: [
        { title: '', description: '', language_id: 1 }, // English
        { title: '', description: '', language_id: 2 }  // Spanish
      ]
    });
    setIsDialogOpen(true);
  };

  const handleEditVideo = (video: TrackVideo) => {
    // Ensure we have content for both languages
    const hasEnglish = video.video_contents.some(c => c.language_id === 1);
    const hasSpanish = video.video_contents.some(c => c.language_id === 2);
    
    const completeContents = [...video.video_contents];
    if (!hasEnglish) {
      completeContents.push({ title: '', description: '', language_id: 1 });
    }
    if (!hasSpanish) {
      completeContents.push({ title: '', description: '', language_id: 2 });
    }

    setEditingVideo({
      ...video,
      video_contents: completeContents
    });
    setIsDialogOpen(true);
  };

  const handleSaveVideo = () => {
    if (editingVideo) {
      saveVideoMutation.mutate({
        ...editingVideo,
        isNew: editingVideo.id === 0
      });
    }
  };

  const updateVideoContent = (languageId: number, field: 'title' | 'description', value: string) => {
    if (!editingVideo) return;
    
    const updatedContents = editingVideo.video_contents.map(content =>
      content.language_id === languageId
        ? { ...content, [field]: value }
        : content
    );
    
    setEditingVideo({
      ...editingVideo,
      video_contents: updatedContents
    });
  };

  const getTrackTitle = (track: Track) => {
    const spanishContent = track.track_contents?.find(c => c.language_id === 2);
    return spanishContent?.menu_title || spanishContent?.title || `Track ${track.order_position}`;
  };

  const getVideoTitle = (video: TrackVideo) => {
    const spanishContent = video.video_contents?.find(c => c.language_id === 2);
    const englishContent = video.video_contents?.find(c => c.language_id === 1);
    return spanishContent?.title || englishContent?.title || 'Sin título';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Videos por Track</h1>
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

        {/* Videos Management */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Videos - Track {tracks.find(t => t.id === selectedTrack)?.order_position}
                <Badge variant="secondary" className="ml-2">
                  {videos.length} videos
                </Badge>
              </CardTitle>
              <Button size="sm" onClick={handleCreateVideo}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Video
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {videosLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay videos para este track
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video, index) => (
                  <div key={video.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="cursor-move">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-center w-16 h-16 bg-muted rounded">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="font-medium">
                        Posición #{video.order_position} - {getVideoTitle(video)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        URL: {video.vimeo_url}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div><strong>ES:</strong> {video.video_contents?.find(c => c.language_id === 2)?.description || 'Sin descripción'}</div>
                        <div><strong>EN:</strong> {video.video_contents?.find(c => c.language_id === 1)?.description || 'Sin descripción'}</div>
                      </div>
                    </div>
                    <div className="space-x-2">
                      {video.vimeo_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(video.vimeo_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditVideo(video)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteVideoMutation.mutate(video.id)}
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

      {/* Edit Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingVideo?.id === 0 ? 'Agregar Nuevo Video' : 'Editar Video'}
            </DialogTitle>
          </DialogHeader>
          
          {editingVideo && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-url">URL del Video</Label>
                  <Input
                    id="video-url"
                    value={editingVideo.vimeo_url}
                    onChange={(e) =>
                      setEditingVideo({ ...editingVideo, vimeo_url: e.target.value })
                    }
                    placeholder="https://youtu.be/... o https://vimeo.com/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="thumbnail-url">URL de Miniatura (opcional)</Label>
                  <Input
                    id="thumbnail-url"
                    value={editingVideo.thumbnail_url || ''}
                    onChange={(e) =>
                      setEditingVideo({ ...editingVideo, thumbnail_url: e.target.value })
                    }
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
              
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
                      value={editingVideo.video_contents?.find(c => c.language_id === 2)?.title || ''}
                      onChange={(e) => updateVideoContent(2, 'title', e.target.value)}
                      placeholder="Título del video en español"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description-es">Descripción en Español</Label>
                    <Textarea
                      id="description-es"
                      value={editingVideo.video_contents?.find(c => c.language_id === 2)?.description || ''}
                      onChange={(e) => updateVideoContent(2, 'description', e.target.value)}
                      placeholder="Descripción del video en español"
                      rows={3}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4">
                  <div>
                    <Label htmlFor="title-en">Title in English</Label>
                    <Input
                      id="title-en"
                      value={editingVideo.video_contents?.find(c => c.language_id === 1)?.title || ''}
                      onChange={(e) => updateVideoContent(1, 'title', e.target.value)}
                      placeholder="Video title in English"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description-en">Description in English</Label>
                    <Textarea
                      id="description-en"
                      value={editingVideo.video_contents?.find(c => c.language_id === 1)?.description || ''}
                      onChange={(e) => updateVideoContent(1, 'description', e.target.value)}
                      placeholder="Video description in English"
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
                    setEditingVideo(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveVideo}
                  disabled={saveVideoMutation.isPending}
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

export default AdminTrackVideos;