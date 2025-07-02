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
import { ArrowLeft, Save, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getLanguages } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

interface TrackContent {
  id?: number;
  title: string;
  menu_title: string;
  description: string;
  long_text_content: string;
  hero_image_url: string;
  language_id: number;
}

interface TrackData {
  id: number;
  order_position: number;
  audio_url: string;
  status: string;
  track_contents: TrackContent[];
}

const AdminTrackEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudioPlayer();
  const trackId = parseInt(id || '0');

  const [trackData, setTrackData] = useState<Partial<TrackData>>({
    order_position: 1,
    audio_url: '',
    status: 'published',
    track_contents: []
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages
  });

  const { data: existingTrack, isLoading } = useQuery({
    queryKey: ['track', trackId],
    queryFn: async () => {
      if (trackId === 0) return null;
      
      const { data, error } = await supabase
        .from('tracks')
        .select(`
          *,
          track_contents(*)
        `)
        .eq('id', trackId)
        .single();
      
      if (error) throw error;
      return data as TrackData;
    },
    enabled: trackId > 0
  });

  useEffect(() => {
    if (existingTrack) {
      setTrackData(existingTrack);
    } else if (languages.length > 0 && trackData.track_contents.length === 0) {
      // Initialize empty content for all languages
      setTrackData(prev => ({
        ...prev,
        track_contents: languages.map(lang => ({
          title: '',
          menu_title: '',
          description: '',
          long_text_content: '',
          hero_image_url: '',
          language_id: lang.id
        }))
      }));
    }
  }, [existingTrack, languages]);

  const saveTrack = useMutation({
    mutationFn: async (data: Partial<TrackData>) => {
      if (trackId > 0) {
        // Update existing track
        const { error: trackError } = await supabase
          .from('tracks')
          .update({
            order_position: data.order_position,
            audio_url: data.audio_url,
            status: data.status
          })
          .eq('id', trackId);

        if (trackError) throw trackError;

        // Update or insert track contents
        for (const content of data.track_contents || []) {
          if (content.id) {
            const { error } = await supabase
              .from('track_contents')
              .update(content)
              .eq('id', content.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('track_contents')
              .insert({
                ...content,
                track_id: trackId
              });
            if (error) throw error;
          }
        }
      } else {
        // Create new track
        const { data: newTrack, error: trackError } = await supabase
          .from('tracks')
          .insert({
            order_position: data.order_position,
            audio_url: data.audio_url,
            status: data.status
          })
          .select()
          .single();

        if (trackError) throw trackError;

        // Insert track contents
        for (const content of data.track_contents || []) {
          const { error } = await supabase
            .from('track_contents')
            .insert({
              ...content,
              track_id: newTrack.id
            });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tracks-es'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tracks-en'] });
      queryClient.invalidateQueries({ queryKey: ['track', trackId] });
      toast({
        title: 'Track guardado',
        description: 'Los cambios han sido guardados correctamente.',
      });
      navigate('/admin/tracks');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
      console.error('Error saving track:', error);
    }
  });

  const updateTrackContent = (languageId: number, field: keyof TrackContent, value: string) => {
    setTrackData(prev => ({
      ...prev,
      track_contents: prev.track_contents?.map(content =>
        content.language_id === languageId
          ? { ...content, [field]: value }
          : content
      ) || []
    }));
  };

  const handleSave = () => {
    saveTrack.mutate(trackData);
  };

  const handlePlayPause = () => {
    if (!trackData.audio_url) {
      toast({
        title: 'Sin audio',
        description: 'Agrega una URL de audio para reproducir el track.',
        variant: 'destructive',
      });
      return;
    }

    const track = {
      id: trackId,
      order_position: trackData.order_position || 1,
      audio_url: trackData.audio_url,
      status: trackData.status || 'published',
      track_contents: trackData.track_contents || []
    };

    if (currentTrack?.id === trackId && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
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
          <Button variant="ghost" onClick={() => navigate('/admin/tracks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tracks
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {trackId > 0 ? 'Editar Track' : 'Nuevo Track'}
            </h1>
            <p className="text-muted-foreground">
              {trackId > 0 ? `Editando Track ${trackData.order_position}` : 'Crear un nuevo track'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {trackData.audio_url && (
            <Button variant="outline" onClick={handlePlayPause}>
              {currentTrack?.id === trackId && isPlaying ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {currentTrack?.id === trackId && isPlaying ? 'Pausar' : 'Reproducir'}
            </Button>
          )}
          <Button onClick={handleSave} disabled={saveTrack.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveTrack.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Track Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Configuración del track</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="order_position">Posición</Label>
              <Input
                id="order_position"
                type="number"
                value={trackData.order_position || ''}
                onChange={(e) => setTrackData(prev => ({ ...prev, order_position: parseInt(e.target.value) || 1 }))}
                placeholder="1"
              />
            </div>
            
            <div>
              <Label htmlFor="audio_url">URL del Audio</Label>
              <Input
                id="audio_url"
                value={trackData.audio_url || ''}
                onChange={(e) => setTrackData(prev => ({ ...prev, audio_url: e.target.value }))}
                placeholder="https://ejemplo.com/audio.mp3"
              />
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={trackData.status || ''}
                onValueChange={(value) => setTrackData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Contenido</CardTitle>
            <CardDescription>Edita el contenido en diferentes idiomas</CardDescription>
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
                const content = trackData.track_contents?.find(c => c.language_id === language.id);
                
                return (
                  <TabsContent key={language.id} value={language.code} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${language.id}`}>Título</Label>
                        <Input
                          id={`title-${language.id}`}
                          value={content?.title || ''}
                          onChange={(e) => updateTrackContent(language.id, 'title', e.target.value)}
                          placeholder="Título del track"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`menu_title-${language.id}`}>Título del Menú</Label>
                        <Input
                          id={`menu_title-${language.id}`}
                          value={content?.menu_title || ''}
                          onChange={(e) => updateTrackContent(language.id, 'menu_title', e.target.value)}
                          placeholder="Título corto para menús"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`description-${language.id}`}>Descripción</Label>
                      <Textarea
                        id={`description-${language.id}`}
                        value={content?.description || ''}
                        onChange={(e) => updateTrackContent(language.id, 'description', e.target.value)}
                        placeholder="Descripción breve del track"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`long_text_content-${language.id}`}>Contenido Largo</Label>
                      <Textarea
                        id={`long_text_content-${language.id}`}
                        value={content?.long_text_content || ''}
                        onChange={(e) => updateTrackContent(language.id, 'long_text_content', e.target.value)}
                        placeholder="Contenido detallado del track (HTML permitido)"
                        rows={8}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`hero_image-${language.id}`}>Imagen Hero (URL)</Label>
                      <Input
                        id={`hero_image-${language.id}`}
                        value={content?.hero_image_url || ''}
                        onChange={(e) => updateTrackContent(language.id, 'hero_image_url', e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
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

export default AdminTrackEdit;