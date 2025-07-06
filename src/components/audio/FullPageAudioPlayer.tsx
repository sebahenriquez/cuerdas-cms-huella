
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
    <div className="h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Track List */}
      <div className="w-1/3 bg-black/30 backdrop-blur-sm border-r border-gray-700">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {currentLanguage?.code === 'es' ? 'Lista de Pistas' : 'Track List'}
          </h2>
          <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
            {tracks.map((track, index) => {
              const content = track.track_contents?.[0];
              const isCurrentTrack = currentTrack?.id === track.id;
              
              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackSelect(track)}
                  className={`p-4 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                    isCurrentTrack ? 'bg-primary/20 border border-primary/50' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">
                      {track.order_position}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {content?.title || `Track ${track.order_position}`}
                      </h3>
                      {content?.description && (
                        <p className="text-sm text-gray-400 truncate">
                          {content.description}
                        </p>
                      )}
                    </div>
                    {isCurrentTrack && isPlaying && (
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Player Interface */}
      <div className="flex-1 flex flex-col">
        {/* Album Art & Track Info */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            {currentTrack && (
              <>
                <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-8 mx-auto flex items-center justify-center">
                  <div className="text-6xl font-bold text-primary/30">
                    {currentTrack.order_position}
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  {getCurrentTrackTitle(currentTrack)}
                </h1>
                <p className="text-xl text-gray-400 mb-8">
                  Track {currentTrack.order_position} of {tracks.length}
                </p>
              </>
            )}
            {!currentTrack && (
              <div className="text-center">
                <div className="w-64 h-64 bg-gray-800 rounded-2xl mb-8 mx-auto flex items-center justify-center">
                  <Play className="w-16 h-16 text-gray-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  {currentLanguage?.code === 'es' ? 'Selecciona una pista' : 'Select a track'}
                </h1>
                <p className="text-xl text-gray-400">
                  {currentLanguage?.code === 'es' ? 'Haz clic en una pista para comenzar' : 'Click on a track to start'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-black/40 backdrop-blur-sm border-t border-gray-700 p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-sm text-gray-400 w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-6 mb-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={previousTrack}
              disabled={!currentTrack}
              className="w-12 h-12 rounded-full hover:bg-white/10"
            >
              <SkipBack className="w-6 h-6" />
            </Button>

            <Button
              onClick={handlePlayPause}
              disabled={!currentTrack}
              className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={nextTrack}
              disabled={!currentTrack}
              className="w-12 h-12 rounded-full hover:bg-white/10"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="p-2 hover:bg-white/10"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPageAudioPlayer;
