import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

interface Track {
  id: number;
  order_position: number;
  audio_url: string;
  track_contents: Array<{
    title: string;
    menu_title: string;
  }>;
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  tracks: Track[];
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setTracks: (tracks: Track[]) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [tracks, setTracks] = useState<Track[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  const playTrack = useCallback((track: Track) => {
    if (audioRef.current) {
      // If it's the same track and it's paused, just resume
      if (currentTrack?.id === track.id && audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }

      // Load new track
      setCurrentTrack(track);
      audioRef.current.src = track.audio_url;
      audioRef.current.load();
      
      // Play when ready
      audioRef.current.addEventListener('canplay', () => {
        audioRef.current?.play();
        setIsPlaying(true);
      }, { once: true });
    }
  }, [currentTrack]);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeTrack = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  }, [currentTrack, tracks, playTrack]);

  const previousTrack = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prevIndex]);
  }, [currentTrack, tracks, playTrack]);

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    nextTrack();
  };

  const handleError = () => {
    setIsPlaying(false);
    console.error('Audio playback error');
  };

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    tracks,
    playTrack,
    pauseTrack,
    resumeTrack,
    seekTo,
    setVolume,
    nextTrack,
    previousTrack,
    setTracks,
    audioRef,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
        onError={handleError}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </AudioPlayerContext.Provider>
  );
};