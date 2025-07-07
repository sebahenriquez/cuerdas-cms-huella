
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { ArrowLeft, Save, Play, Pause } from 'lucide-react';
import { useSimpleQuery } from '@/hooks/useSimpleQuery';
import { trackService, TrackData, TrackContent } from '@/lib/admin/track-service';
import { languageService } from '@/lib/admin/language-service';
import LoadingSpinner from '@/components/admin/common/LoadingSpinner';
import ErrorDisplay from '@/components/admin/common/ErrorDisplay';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const NewAdminTrackEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudioPlayer();
  const isNew = id === 'new';
  const trackId = isNew ? 0 : parseInt(id || '0');

  const [trackData, setTrackData] = useState<Partial<TrackData>>({
    order_position: 1,
    audio_url: '',
    status: 'published',
    track_contents: []
  });

  const [saving, setSaving] = useState(false);

  const { data: existingTrack, loading: trackLoading, error: trackError } = useSimpleQuery(
    () => isNew ? Promise.resolve(null) : trackService.getById(trackId),
    [trackId]
  );

  const { data: languages, loading: languagesLoading, error: languagesError } = useSimpleQuery(
    () => languageService.getAll(),
    []
  );

  const loading = trackLoading || languagesLoading;
  const error = trackError || languagesError;

  useEffect(() => {
    if (existingTrack) {
      setTrackData(existingTrack);
    } else if (languages && languages.length > 0 && trackData.track_contents?.length === 0) {
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

  const handleSave = async () => {
    if (!trackData.order_position) {
      toast({
        title: 'Error',
        description: 'La posición del track es requerida.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await trackService.create(trackData as Omit<TrackData, 'id'>);
        toast({
          title: 'Track creado',
          description: 'El track ha sido creado correctamente.',
        });
      } else {
        await trackService.update(trackId, trackData);
        toast({
          title: 'Track actualizado',
          description: 'Los cambios han sido guardados correctamente.',
        });
      }
      navigate('/admin/tracks');
    } catch (error) {
      console.error('Error saving track:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
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

    const audioTrack = {
      id: trackId,
      order_position: trackData.order_position || 1,
      audio_url: trackData.audio_url,
      status: trackData.status || 'published',
      track_contents: trackData.track_contents || []
    };

    if (currentTrack?.id === trackId && isPlaying) {
      pauseTrack();
    } else {
      playTrack(audioTrack);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando editor..." />;
  if (error) return <ErrorDisplay error={error} />;
  if (!languages || languages.length === 0) {
    return <ErrorDisplay error="No se encontraron idiomas configurados." />;
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
              {isNew ? 'Nuevo Track' : 'Editar Track'}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? 'Crear un nuevo track' : `Editando Track ${trackData.order_position}`}
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
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                        placeholder="Título corto para navegación"
                      />
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
                      <Label htmlFor={`content-${language.id}`}>Contenido Largo</Label>
                      <div className="mt-2">
                        <RichTextEditor
                          content={content?.long_text_content || ''}
                          onChange={(value) => updateTrackContent(language.id, 'long_text_content', value)}
                          placeholder="Contenido detallado del track"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`hero-${language.id}`}>Imagen Hero (URL)</Label>
                      <Input
                        id={`hero-${language.id}`}
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

export default NewAdminTrackEdit;
