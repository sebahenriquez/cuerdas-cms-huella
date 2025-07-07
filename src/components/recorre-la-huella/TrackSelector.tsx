
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Track } from '@/types/track';

interface TrackSelectorProps {
  tracks: Track[];
  selectedTrack: Track | null;
  onTrackSelect: (track: Track) => void;
  showIntroButton?: boolean;
  isIntroActive?: boolean;
  onIntroClick?: () => void;
}

const TrackSelector: React.FC<TrackSelectorProps> = ({
  tracks,
  selectedTrack,
  onTrackSelect,
  showIntroButton = false,
  isIntroActive = false,
  onIntroClick
}) => {
  const { currentLanguage } = useLanguage();

  const getTrackTitle = (track: Track) => {
    const content = track.track_contents?.[0];
    return content?.menu_title || content?.title || `Track ${track.order_position}`;
  };

  return (
    <div className="fixed top-20 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {/* Botón de Intro */}
          {showIntroButton && (
            <Button
              variant={isIntroActive ? "default" : "outline"}
              size="sm"
              onClick={onIntroClick}
              className="flex-shrink-0"
            >
              {currentLanguage?.code === 'es' ? 'Introducción' : 'Introduction'}
            </Button>
          )}

          {/* Botones de Tracks */}
          {tracks.map((track) => (
            <Button
              key={track.id}
              variant={selectedTrack?.id === track.id ? "default" : "outline"}
              size="sm"
              onClick={() => onTrackSelect(track)}
              className="flex-shrink-0 min-w-fit"
            >
              {getTrackTitle(track)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackSelector;
