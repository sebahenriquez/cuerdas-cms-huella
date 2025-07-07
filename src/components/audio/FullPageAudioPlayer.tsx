
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
    if (isPlaying) {
      pauseTrack();
    } else {
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
      <div className="flex-shrink-0 p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">
          {currentLanguage?.code === 'es' ? 'Escucha el Álbum' : 'Listen to the Album'}
        </h1>
        {currentTrack && (
          <p className="text-lg text-gray-300">
            {getCurrentTrackTitle(currentTrack)}
          </p>
        )}
      </div>

      {/* Track List - Fixed height that adapts to screen */}
      <div className="flex-1 px-6 relative flex flex-col min-h-0">
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            {tracks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  {currentLanguage?.code === 'es' ? 'No hay pistas disponibles' : 'No tracks available'}
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {tracks.map((track, index) => {
                  const content = track.track_contents?.[0];
                  const isCurrentTrack = currentTrack?.id === track.id;
                  
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleTrackSelect(track)}
                      className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 flex-shrink-0 ${
                        isCurrentTrack ? 'bg-primary/20' : 'hover:bg-white/5'
                      }`}
                      style={{ minHeight: '60px' }}
                    >
                      {/* Play/Pause button or track number */}
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center mr-4">
                        {isCurrentTrack && isPlaying ? (
                          <Pause className="w-5 h-5 text-primary" />
                        ) : isCurrentTrack ? (
                          <Play className="w-5 h-5 text-primary" />
                        ) : (
                          <span className="text-gray-400 group-hover:hidden text-sm">
                            {track.order_position}
                          </span>
                        )}
                        {!isCurrentTrack && (
                          <Play className="w-4 h-4 text-white hidden group-hover:block" />
                        )}
                      </div>

                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate ${isCurrentTrack ? 'text-primary' : 'text-white'}`}>
                          {content?.title || `Track ${track.order_position}`}
                        </h3>
                        {content?.description && (
                          <p className="text-sm text-gray-400 truncate mt-1">
                            {content.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
