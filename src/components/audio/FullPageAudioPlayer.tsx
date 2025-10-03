
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Track } from '@/types/track';

interface FullPageAudioPlayerProps {
  tracks: Track[];
}

const FullPageAudioPlayer: React.FC<FullPageAudioPlayerProps> = ({ tracks }) => {
  const { currentLanguage } = useLanguage();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playTrack,
    pauseTrack,
    resumeTrack,
    seekTo,
    setVolume,
    nextTrack,
    previousTrack,
    setTracks
  } = useAudioPlayer();

  const [isMuted, setIsMuted] = React.useState(false);
  const [previousVolume, setPreviousVolume] = React.useState(volume);

  React.useEffect(() => {
    setTracks(tracks);
  }, [tracks, setTracks]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    console.log('FullPageAudioPlayer - handlePlayPause clicked');
    console.log('FullPageAudioPlayer - isPlaying state:', isPlaying);
    console.log('FullPageAudioPlayer - currentTrack:', currentTrack);
    
    if (isPlaying) {
      console.log('FullPageAudioPlayer - Calling pauseTrack');
      pauseTrack();
    } else {
      console.log('FullPageAudioPlayer - Calling resumeTrack');
      resumeTrack();
    }
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
  };

  const getCurrentTrackTitle = (track: Track | null) => {
    if (!track) return '';
    const content = track.track_contents?.[0];
    return content?.title || `Track ${track.order_position}`;
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="flex-shrink-0 p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">
          {currentLanguage?.code === 'es' ? 'Escucha el Álbum' : 'Listen to the Album'}
        </h1>
        {currentTrack && (
          <p className="text-lg text-gray-300">
            {getCurrentTrackTitle(currentTrack)}
          </p>
        )}
      </div>

      {/* Track List - Vertical table layout */}
      <div className="flex-1 px-4 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col overflow-hidden">
          {tracks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {currentLanguage?.code === 'es' ? 'No hay pistas disponibles' : 'No tracks available'}
              </p>
            </div>
          ) : (
            <div className="overflow-auto flex-1 rounded-lg border border-white/10">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-300 font-semibold w-20">
                      {currentLanguage?.code === 'es' ? 'N°' : '#'}
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold">
                      {currentLanguage?.code === 'es' ? 'Título' : 'Title'}
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold">
                      Feat.
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold">
                      {currentLanguage?.code === 'es' ? 'Compositores' : 'Composers'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracks.map((track) => {
                    const content = track.track_contents?.[0];
                    const isCurrentTrack = currentTrack?.id === track.id;
                    
                    return (
                      <TableRow
                        key={track.id}
                        onClick={() => handleTrackSelect(track)}
                        className={`cursor-pointer transition-colors border-white/10 ${
                          isCurrentTrack 
                            ? 'bg-primary/20 hover:bg-primary/30' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isCurrentTrack && isPlaying ? (
                              <Pause className="w-4 h-4 text-primary" />
                            ) : isCurrentTrack ? (
                              <Play className="w-4 h-4 text-primary" />
                            ) : (
                              <span className="text-gray-400">
                                {track.order_position}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`font-medium ${isCurrentTrack ? 'text-primary' : 'text-white'}`}>
                          {content?.title || `Track ${track.order_position}`}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {content?.featured_artists || '-'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {content?.composers || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Player Controls - Always visible at bottom */}
      <div className="flex-shrink-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
              disabled={!currentTrack}
            />
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left side - Track info */}
          <div className="flex-1 min-w-0">
            {currentTrack ? (
              <div>
                <p className="text-sm font-medium text-white truncate">
                  {getCurrentTrackTitle(currentTrack)}
                </p>
                <p className="text-xs text-gray-400">
                  Track {currentTrack.order_position} of {tracks.length}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {currentLanguage?.code === 'es' ? 'Selecciona una pista' : 'Select a track'}
              </p>
            )}
          </div>

          {/* Center - Main controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousTrack}
              disabled={!currentTrack}
              className="w-8 h-8 rounded-full hover:bg-white/10"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              onClick={handlePlayPause}
              disabled={!currentTrack}
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextTrack}
              disabled={!currentTrack}
              className="w-8 h-8 rounded-full hover:bg-white/10"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Right side - Volume */}
          <div className="flex-1 flex items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="p-2 hover:bg-white/10"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPageAudioPlayer;
