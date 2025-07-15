
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track } from '@/types/track';

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setTracks: (tracks: Track[]) => void;
  tracks: Track[];
  nextTrack: () => void;
  previousTrack: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [tracks, setTracks] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playTrack = (track: Track) => {
    console.log('playTrack called with track:', track.id);
    console.log('audioRef.current at playTrack:', audioRef.current);
    
    if (!audioRef.current || !track.audio_url) {
      console.log('ERROR: audioRef or audio_url missing', { audioRef: !!audioRef.current, audioUrl: track.audio_url });
      return;
    }
    
    if (currentTrack?.id !== track.id) {
      console.log('Setting new track source:', track.audio_url);
      setCurrentTrack(track);
      audioRef.current.src = track.audio_url;
    }
    
    audioRef.current.play().then(() => {
      console.log('Audio playing successfully');
      setIsPlaying(true);
    }).catch((error) => {
      console.error('Error playing audio:', error);
    });
  };

  const pauseTrack = () => {
    console.log('pauseTrack called');
    console.log('audioRef.current:', audioRef.current);
    console.log('isPlaying state:', isPlaying);
    
    if (audioRef.current) {
      console.log('Audio element found, calling pause()');
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('Audio paused, isPlaying set to false');
    } else {
      console.log('ERROR: audioRef.current is null or undefined');
    }
  };

  const resumeTrack = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error resuming audio:', error);
      });
    }
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolumeHandler = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const nextTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const previousTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prevIndex]);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,
        seekTo,
        setVolume: setVolumeHandler,
        setTracks,
        tracks,
        nextTrack,
        previousTrack,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
