
import React from 'react';
import { Track } from '@/types/track';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

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
  return (
    <nav className="track-nav">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto py-2 space-x-1">
          {/* Botón de Introducción */}
          {showIntroButton && (
            <button
              onClick={onIntroClick}
              className={`track-nav-item flex items-center space-x-1 ${
                isIntroActive ? 'active' : ''
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </button>
          )}
          
          {/* Botones de Tracks */}
          {tracks.map((track) => {
            const trackContent = track.track_contents?.[0];
            const isActive = selectedTrack?.id === track.id;
            
            return (
              <button
                key={track.id}
                onClick={() => onTrackSelect(track)}
                className={`track-nav-item ${isActive ? 'active' : ''}`}
              >
                {isActive ? (
                  // Mostrar título completo solo si está activo
                  trackContent?.menu_title || `Track ${track.order_position}`
                ) : (
                  // Mostrar solo el número si no está activo
                  track.order_position.toString()
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TrackSelector;
