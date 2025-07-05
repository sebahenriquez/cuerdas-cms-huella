
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Play, Pause } from 'lucide-react';

interface TrackHeaderProps {
  trackId: number;
  orderPosition?: number;
  audioUrl?: string;
  currentTrack?: any;
  isPlaying: boolean;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
  onPlayPause: () => void;
}

const TrackHeader: React.FC<TrackHeaderProps> = ({
  trackId,
  orderPosition,
  audioUrl,
  currentTrack,
  isPlaying,
  isSaving,
  onBack,
  onSave,
  onPlayPause
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Tracks
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {trackId > 0 ? 'Editar Track' : 'Nuevo Track'}
          </h1>
          <p className="text-muted-foreground">
            {trackId > 0 ? `Editando Track ${orderPosition}` : 'Crear un nuevo track'}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        {audioUrl && (
          <Button variant="outline" onClick={onPlayPause}>
            {currentTrack?.id === trackId && isPlaying ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {currentTrack?.id === trackId && isPlaying ? 'Pausar' : 'Reproducir'}
          </Button>
        )}
        <Button onClick={onSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
};

export default TrackHeader;
