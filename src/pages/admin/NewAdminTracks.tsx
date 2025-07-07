
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Play, Pause, Plus, Trash2, Music, RefreshCw } from 'lucide-react';
import { useSimpleQuery } from '@/hooks/useSimpleQuery';
import { trackService, TrackData } from '@/lib/admin/track-service';
import { languageService } from '@/lib/admin/language-service';
import LoadingSpinner from '@/components/admin/common/LoadingSpinner';
import ErrorDisplay from '@/components/admin/common/ErrorDisplay';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const NewAdminTracks: React.FC = () => {
  const { toast } = useToast();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudioPlayer();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: tracks, loading: tracksLoading, error: tracksError } = useSimpleQuery(
    () => trackService.getAll(),
    [refreshKey]
  );

  const { data: languages, loading: languagesLoading, error: languagesError } = useSimpleQuery(
    () => languageService.getAll(),
    []
  );

  const loading = tracksLoading || languagesLoading;
  const error = tracksError || languagesError;

  const handleDelete = async (trackId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este track?')) return;

    try {
      await trackService.delete(trackId);
      toast({
        title: 'Track eliminado',
        description: 'El track ha sido eliminado correctamente.',
      });
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting track:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el track.',
        variant: 'destructive',
      });
    }
  };

  const getTrackTitle = (track: TrackData) => {
    if (!languages) return `Track ${track.order_position}`;
    
    const defaultLanguage = languages.find(lang => lang.is_default);
    if (!defaultLanguage) return `Track ${track.order_position}`;
    
    const content = track.track_contents.find(tc => tc.language_id === defaultLanguage.id);
    return content?.title || `Track ${track.order_position}`;
  };

  const handlePlayPause = (track: TrackData) => {
    if (!track.audio_url) {
      toast({
        title: 'Sin audio',
        description: 'Este track no tiene una URL de audio configurada.',
        variant: 'destructive',
      });
      return;
    }

    const audioTrack = {
      id: track.id,
      order_position: track.order_position,
      audio_url: track.audio_url,
      status: track.status,
      track_contents: track.track_contents
    };

    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(audioTrack);
    }
  };

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  if (loading) return <LoadingSpinner message="Cargando tracks..." />;
  if (error) return <ErrorDisplay error={error} onRetry={handleRefresh} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Tracks</h1>
          <p className="text-muted-foreground">
            Administra todos los tracks del proyecto
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button asChild>
            <Link to="/admin/tracks/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Track
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {tracks && tracks.map((track) => (
          <Card key={track.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{getTrackTitle(track)}</span>
                    <Badge variant="secondary">
                      Posición {track.order_position}
                    </Badge>
                    <Badge variant={track.status === 'published' ? 'default' : 'secondary'}>
                      {track.status === 'published' ? 'Publicado' : 'Borrador'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {track.audio_url ? 'Audio configurado' : 'Sin audio'}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {track.audio_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlayPause(track)}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="h-4 w-4 mr-1" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      {currentTrack?.id === track.id && isPlaying ? 'Pausar' : 'Reproducir'}
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/tracks/${track.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(track.id)}
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
                  <strong>Idiomas disponibles:</strong>
                </p>
                <div className="flex space-x-2">
                  {languages && languages.map((language) => {
                    const hasContent = track.track_contents.some(tc => tc.language_id === language.id);
                    return (
                      <Badge 
                        key={language.id} 
                        variant={hasContent ? 'default' : 'outline'}
                      >
                        {language.code.toUpperCase()}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tracks && tracks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay tracks</h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando tu primer track del proyecto.
            </p>
            <Button asChild>
              <Link to="/admin/tracks/new">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Track
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewAdminTracks;
