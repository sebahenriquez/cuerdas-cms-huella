
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getLanguages } from '@/lib/supabase-helpers';

interface VideoContent {
  id?: number;
  title: string;
  description: string;
  language_id: number;
}

interface VideoData {
  id: number;
  vimeo_url: string;
  thumbnail_url: string;
  order_position: number;
  track_id: number | null;
  video_contents: VideoContent[];
}

const AdminVideoEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoId = parseInt(id || '0');

  const [videoData, setVideoData] = useState<Partial<VideoData>>({
    vimeo_url: '',
    thumbnail_url: '',
    order_position: 1,
    track_id: null,
    video_contents: []
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks-for-video'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('id, order_position, track_contents!inner(title)')
        .eq('track_contents.language_id', 1) // Spanish
        .order('order_position');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: existingVideo, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (videoId === 0) return null;
      
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          video_contents(*)
        `)
        .eq('id', videoId)
        .single();
      
      if (error) throw error;
      return data as VideoData;
    },
    enabled: videoId > 0
  });

  useEffect(() => {
    if (existingVideo) {
      setVideoData(existingVideo);
    } else if (languages.length > 0 && videoData.video_contents.length === 0) {
      setVideoData(prev => ({
        ...prev,
        video_contents: languages.map(lang => ({
          title: '',
          description: '',
          language_id: lang.id
        }))
      }));
    }
  }, [existingVideo, languages]);

  const saveVideo = useMutation({
    mutationFn: async (data: Partial<VideoData>) => {
      if (videoId > 0) {
        // Update existing video
        const { error: videoError } = await supabase
          .from('videos')
          .update({
            vimeo_url: data.vimeo_url,
            thumbnail_url: data.thumbnail_url,
            order_position: data.order_position,
            track_id: data.track_id
          })
          .eq('id', videoId);

        if (videoError) throw videoError;

        // Update or insert video contents
        for (const content of data.video_contents || []) {
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
                video_id: videoId,
                language_id: content.language_id,
                title: content.title,
                description: content.description
              });
            if (error) throw error;
          }
        }
      } else {
        // Create new video
        const { data: newVideo, error: videoError } = await supabase
          .from('videos')
          .insert({
            vimeo_url: data.vimeo_url,
            thumbnail_url: data.thumbnail_url,
            order_position: data.order_position,
            track_id: data.track_id
          })
          .select()
          .single();

        if (videoError) throw videoError;

        // Insert video contents
        for (const content of data.video_contents || []) {
          const { error } = await supabase
            .from('video_contents')
            .insert({
              video_id: newVideo.id,
              language_id: content.language_id,
              title: content.title,
              description: content.description
            });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      toast({
        title: 'Video guardado',
        description: 'Los cambios han sido guardados correctamente.',
      });
      navigate('/admin/videos');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
      console.error('Error saving video:', error);
    }
  });

  const updateVideoContent = (languageId: number, field: keyof VideoContent, value: string) => {
    setVideoData(prev => ({
      ...prev,
      video_contents: prev.video_contents?.map(content =>
        content.language_id === languageId
          ? { ...content, [field]: value }
          : content
      ) || []
    }));
  };

  const handleSave = () => {
    saveVideo.mutate(videoData);
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
          <Button variant="ghost" onClick={() => navigate('/admin/videos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Videos
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {videoId > 0 ? 'Editar Video' : 'Nuevo Video'}
            </h1>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saveVideo.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveVideo.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Configuración del video</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vimeo_url">URL del Video (YouTube/Vimeo)</Label>
              <Input
                id="vimeo_url"
                value={videoData.vimeo_url || ''}
                onChange={(e) => setVideoData(prev => ({ ...prev, vimeo_url: e.target.value }))}
                placeholder="https://youtu.be/... o https://player.vimeo.com/video/..."
              />
            </div>
            
            <div>
              <Label htmlFor="thumbnail_url">URL de Miniatura</Label>
              <Input
                id="thumbnail_url"
                value={videoData.thumbnail_url || ''}
                onChange={(e) => setVideoData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div>
              <Label htmlFor="order_position">Posición</Label>
              <Input
                id="order_position"
                type="number"
                value={videoData.order_position || 1}
                onChange={(e) => setVideoData(prev => ({ ...prev, order_position: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="track">Track Asociado</Label>
              <Select
                value={videoData.track_id?.toString() || ''}
                onValueChange={(value) => setVideoData(prev => ({ ...prev, track_id: value ? parseInt(value) : null }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin track</SelectItem>
                  {tracks.map((track) => (
                    <SelectItem key={track.id} value={track.id.toString()}>
                      Track {track.order_position}: {track.track_contents[0]?.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Contenido</CardTitle>
            <CardDescription>Información del video en diferentes idiomas</CardDescription>
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
                const content = videoData.video_contents?.find(c => c.language_id === language.id);
                
                return (
                  <TabsContent key={language.id} value={language.code} className="space-y-4">
                    <div>
                      <Label htmlFor={`title-${language.id}`}>Título</Label>
                      <Input
                        id={`title-${language.id}`}
                        value={content?.title || ''}
                        onChange={(e) => updateVideoContent(language.id, 'title', e.target.value)}
                        placeholder="Título del video"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`description-${language.id}`}>Descripción</Label>
                      <Textarea
                        id={`description-${language.id}`}
                        value={content?.description || ''}
                        onChange={(e) => updateVideoContent(language.id, 'description', e.target.value)}
                        placeholder="Descripción del video"
                        rows={5}
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

export default AdminVideoEdit;
