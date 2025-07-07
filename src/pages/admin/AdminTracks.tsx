
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTracks } from '@/lib/track-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { TracksHeader } from '@/components/admin/tracks/TracksHeader';
import { TrackCard } from '@/components/admin/tracks/TrackCard';
import { EmptyTracksState } from '@/components/admin/tracks/EmptyTracksState';
import { Track } from '@/types/track';

const AdminTracks: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, setTracks } = useAudioPlayer();

  const { data: tracksES = [], isLoading: loadingES, error: errorES, refetch: refetchES } = useQuery({
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

  const { data: tracksEN = [], isLoading: loadingEN, error: errorEN, refetch: refetchEN } = useQuery({
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

  const isLoading = loadingES || loadingEN;
  const error = errorES || errorEN;

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

  const hasEnglishContent = (trackId: number) => {
    return tracksEN.some(track => track.id === trackId);
  };

  const handleRefresh = () => {
    refetchES();
    refetchEN();
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
        <div className="text-red-600 text-center">
          <h3 className="font-semibold">Error al cargar los tracks</h3>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TracksHeader onRefresh={handleRefresh} />

      <div className="grid gap-4">
        {tracksES.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            hasEnglishContent={hasEnglishContent(track.id)}
            onPlayPause={handlePlayPause}
          />
        ))}
      </div>

      {tracksES.length === 0 && !isLoading && (
        <EmptyTracksState onRefresh={handleRefresh} />
      )}
    </div>
  );
};

export default AdminTracks;
