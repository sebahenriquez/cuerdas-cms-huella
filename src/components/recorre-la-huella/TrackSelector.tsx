
import React from 'react';
import { Track } from '@/types/track';

interface TrackSelectorProps {
  tracks: Track[];
  selectedTrack: Track | null;
  onTrackSelect: (track: Track) => void;
}

const TrackSelector: React.FC<TrackSelectorProps> = ({
  tracks,
  selectedTrack,
  onTrackSelect
}) => {
  return (
    <section className="relative z-10 bg-card/95 backdrop-blur-xl">
      <div className="container-wide py-4">
        <div className="flex items-center justify-center space-x-6 flex-wrap">
          <span className="text-muted-foreground text-sm font-medium mr-2">Tracks:</span>
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => onTrackSelect(track)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                selectedTrack?.id === track.id 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground hover:scale-105'
              }`}
            >
              {track.order_position}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrackSelector;
