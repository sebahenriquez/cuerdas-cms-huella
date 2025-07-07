
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Play, Pause, Volume2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

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

interface TrackCardProps {
  track: Track;
  currentTrack: Track | null;
  isPlaying: boolean;
  hasEnglishContent: boolean;
  onPlayPause: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  currentTrack,
  isPlaying,
  hasEnglishContent,
  onPlayPause
}) => {
  const getTrackTitle = (track: Track) => {
    return track.track_contents?.[0]?.title || `Track ${track.order_position}`;
  };

  return (
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
              onClick={() => onPlayPause(track)}
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
              <Badge variant={hasEnglishContent ? 'default' : 'outline'}>
                🇺🇸 {hasEnglishContent ? 'Inglés' : 'Sin traducir'}
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
  );
};
