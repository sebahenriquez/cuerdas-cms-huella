
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTrackWithContent, getTrackCTALabels } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import TrackDetailHero from '@/components/track-detail/TrackDetailHero';
import TrackTextContent from '@/components/track-detail/TrackTextContent';
import TrackQuotes from '@/components/track-detail/TrackQuotes';
import TrackVideos from '@/components/track-detail/TrackVideos';
import TrackPhotos from '@/components/track-detail/TrackPhotos';

const TrackDetail = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const { currentLanguage } = useLanguage();
  const { playTrack, currentTrack, isPlaying, pauseTrack } = useAudioPlayer();

  const { data: trackData, isLoading } = useQuery({
    queryKey: ['track', trackId, currentLanguage?.id],
    queryFn: () => {
      if (!trackId || !currentLanguage) return null;
      return getTrackWithContent(parseInt(trackId), currentLanguage.id);
    },
    enabled: !!trackId && !!currentLanguage,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-lg">Cargando...</div>
        </div>
      </Layout>
    );
  }

  if (!trackData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Track no encontrado</h1>
            <p className="text-muted-foreground">El track solicitado no existe o no está disponible.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const trackContent = trackData.track_contents?.[0];
  const ctaSettings = trackData.track_cta_settings?.[0];
  const isCurrentTrack = currentTrack?.id === trackData.id;

  const handlePlayPause = () => {
    if (isCurrentTrack && isPlaying) {
      pauseTrack();
    } else {
      playTrack(trackData);
    }
  };

  // Get CTA labels using the helper function
  const ctaLabels = getTrackCTALabels(ctaSettings, currentLanguage);

  return (
    <Layout showAudioPlayer={true}>
      <TrackDetailHero
        trackData={trackData}
        trackContent={trackContent}
        ctaSettings={ctaSettings}
        currentLanguage={currentLanguage}
        isCurrentTrack={isCurrentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
      />

      {ctaSettings?.show_texts && trackContent?.long_text_content && (
        <TrackTextContent 
          content={trackContent.long_text_content}
          sectionTitle={ctaLabels.textsLabel}
        />
      )}

      <TrackQuotes quotes={trackData.track_quotes || []} />

      {ctaSettings?.show_videos && trackData.videos && (
        <TrackVideos 
          videos={trackData.videos}
          sectionTitle={ctaLabels.videosLabel}
        />
      )}

      {ctaSettings?.show_photos && trackData.track_featured_images && (
        <TrackPhotos 
          images={trackData.track_featured_images} 
          currentLanguage={currentLanguage}
          sectionTitle={ctaLabels.photosLabel}
        />
      )}
    </Layout>
  );
};

export default TrackDetail;
