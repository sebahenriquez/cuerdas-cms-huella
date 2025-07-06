
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Play, Pause, Volume2, Plus, Eye, Music, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getTracks } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

interface Track {
  id: number;
  order_position: number;
  audio_url: string;
  status: string;
  track_contents: Array<{
    title: string;
    menu_title: string;
    language_id: number;
  }>;
}

const AdminTracks: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTrack, isPlaying, playTrack, pauseTrack, setTracks } = useAudioPlayer();

  const { data: tracksES = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-tracks-es'],
    queryFn: async () => {
      try {
        console.log('Fetching Spanish tracks...');
        const tracks = await getTracks(1);
        console.log('Spanish tracks fetched:', tracks);
        return tracks;
      } catch (error) {
        console.error('Error fetching Spanish tracks:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const { data: tracksEN = [] } = useQuery({
    queryKey: ['admin-tracks-en'],
    queryFn: async () => {
      try {
        console.log('Fetching English tracks...');
        const tracks = await getTracks(2);
        console.log('English tracks fetched:', tracks);
        return tracks;
      } catch (error) {
        console.error('Error fetching English tracks:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  React.useEffect(() => {
    if (tracksES.length > 0) {
      setTracks(tracksES);
    }
  }, [tracksES, setTracks]);

  const handlePlayPause = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  const getTrackTitle = (track: Track) => {
    return track.track_contents?.[0]?.title || `Track ${track.order_position}`;
  };

  const hasEnglishContent = (trackId: number) => {
    return tracksEN.some(track => track.id === trackId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando tracks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-600">
          Error al cargar los tracks: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Tracks</h1>
          <p className="text-muted-foreground">
            Administra el contenido de todos los tracks del álbum
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
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
        {tracksES.map((track) => (
          <Card key={track.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {track.order_position}
                    </span>
                    <span>{getTrackTitle(track)}</span>
                    <Badge variant={track.status === 'published' ? 'default' : 'secondary'}>
                      {track.status === 'published' ? 'Publicado' : 'Borrador'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Título del menú: {track.track_contents?.[0]?.menu_title || 'Sin definir'}
                  </CardDescription>
                </div>
                
                <div className="flex space-x-2">
                  {/* Audio Controls */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayPause(track)}
                    disabled={!track.audio_url}
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {currentTrack?.id === track.id && isPlaying ? 'Pausar' : 'Reproducir'}
                  </Button>

                  <Button asChild variant="outline" size="sm">
                    <Link to={`/recorre-la-huella/track-${track.id}`} target="_blank">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/tracks/${track.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Estado del Contenido</h4>
                  <div className="flex space-x-2">
                    <Badge variant="default">
                      🇪🇸 Español
                    </Badge>
                    <Badge variant={hasEnglishContent(track.id) ? 'default' : 'outline'}>
                      🇺🇸 {hasEnglishContent(track.id) ? 'Inglés' : 'Sin traducir'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Audio</h4>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Volume2 className="h-4 w-4" />
                    <span className="truncate">
                      {track.audio_url ? 'Audio disponible' : 'Sin audio'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tracksES.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay tracks</h3>
            <p className="text-muted-foreground mb-4">
              Los tracks se cargan automáticamente desde la base de datos.
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar conexión
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminTracks;
