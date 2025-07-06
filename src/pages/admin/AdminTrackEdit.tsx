
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useTrackData } from '@/hooks/useTrackData';
import { useTrackSave } from '@/hooks/useTrackSave';
import TrackHeader from '@/components/admin/track-edit/TrackHeader';
import TrackSidebar from '@/components/admin/track-edit/TrackSidebar';
import TrackContentTabs from '@/components/admin/track-edit/TrackContentTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminTrackEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudioPlayer();
  const trackId = parseInt(id || '0');

  const {
    trackData,
    setTrackData,
    languages,
    isLoading,
    error,
    updateTrackContent,
    updateVideoContent
  } = useTrackData(trackId);

  const { saveTrack } = useTrackSave(trackId, () => navigate('/admin/tracks'));

  const handleSave = () => {
    console.log('Saving track with data:', trackData);
    saveTrack.mutate(trackData);
  };

  const handlePlayPause = () => {
    if (!trackData.audio_url) {
      toast({
        title: 'Sin audio',
        description: 'Agrega una URL de audio para reproducir el track.',
        variant: 'destructive',
      });
      return;
    }

    const track = {
      id: trackId,
      order_position: trackData.order_position || 1,
      audio_url: trackData.audio_url,
      status: trackData.status || 'published',
      track_contents: trackData.track_contents || []
    };

    if (currentTrack?.id === trackId && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando track {trackId}...</span>
      </div>
    );
  }

  if (error) {
    console.error('Error loading track:', error);
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar el track {trackId}: {error.message}
          </AlertDescription>
        </Alert>
        <button 
          onClick={() => navigate('/admin/tracks')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Volver a la lista de tracks
        </button>
      </div>
    );
  }

  if (!trackData || !trackData.id) {
    console.log('Track data not ready:', trackData);
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            Este track no existe en la base de datos. Se creará uno nuevo al guardar.
          </AlertDescription>
        </Alert>
        {languages.length === 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              No se han cargado los idiomas. Verifica la configuración de la base de datos.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TrackHeader
        trackId={trackId}
        orderPosition={trackData.order_position}
        audioUrl={trackData.audio_url}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isSaving={saveTrack.isPending}
        onBack={() => navigate('/admin/tracks')}
        onSave={handleSave}
        onPlayPause={handlePlayPause}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <TrackSidebar
          orderPosition={trackData.order_position || 1}
          audioUrl={trackData.audio_url || ''}
          status={trackData.status || 'published'}
          ctaSettings={trackData.cta_settings || {
            show_texts: true,
            show_videos: true,
            show_photos: true,
            texts_label_es: 'Textos',
            texts_label_en: 'Texts',
            videos_label_es: 'Videos',
            videos_label_en: 'Videos',
            photos_label_es: 'Fotos',
            photos_label_en: 'Photos'
          }}
          videos={trackData.videos || []}
          photos={trackData.photos || []}
          languages={languages}
          onOrderPositionChange={(value) => setTrackData(prev => ({ ...prev, order_position: value }))}
          onAudioUrlChange={(value) => setTrackData(prev => ({ ...prev, audio_url: value }))}
          onStatusChange={(value) => setTrackData(prev => ({ ...prev, status: value }))}
          onCTASettingsChange={(settings) => {
            setTrackData(prev => ({
              ...prev,
              cta_settings: {
                ...prev.cta_settings,
                ...settings
              }
            }));
          }}
          onVideosChange={(videos) => setTrackData(prev => ({ ...prev, videos }))}
          onPhotosChange={(photos) => setTrackData(prev => ({ ...prev, photos }))}
          onVideoContentChange={updateVideoContent}
        />

        <TrackContentTabs
          languages={languages}
          trackContents={trackData.track_contents || []}
          onContentChange={updateTrackContent}
        />
      </div>

      {/* Debug info - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <pre>{JSON.stringify({ 
            trackId, 
            hasTrackData: !!trackData,
            trackDataKeys: trackData ? Object.keys(trackData) : [],
            languagesCount: languages.length,
            isLoading,
            hasError: !!error
          }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AdminTrackEdit;
