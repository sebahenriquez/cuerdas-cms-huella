
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AudioPlayer from '@/components/audio/AudioPlayer';
import TrackSelector from '@/components/recorre-la-huella/TrackSelector';
import HeroSection from '@/components/recorre-la-huella/HeroSection';
import IntroSection from '@/components/recorre-la-huella/IntroSection';
import TextsSection from '@/components/recorre-la-huella/TextsSection';
import VideosSection from '@/components/recorre-la-huella/VideosSection';
import PhotosSection from '@/components/recorre-la-huella/PhotosSection';
import LightboxModal from '@/components/recorre-la-huella/LightboxModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageBySlug, getTracks, getTrackCTALabels, getCTAButtons } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Track } from '@/types/track';

const RecorreLaHuella = () => {
  const { currentLanguage } = useLanguage();
  const { playTrack, setTracks, pauseTrack, resumeTrack, nextTrack, previousTrack } = useAudioPlayer();
  const [searchParams, setSearchParams] = useSearchParams();
  const trackParam = searchParams.get('track');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Query para la página de introducción
  const { data: introData, isLoading: introLoading } = useQuery({
    queryKey: ['page', 'recorre-la-huella-intro', currentLanguage?.id],
    queryFn: () => currentLanguage ? getPageBySlug('recorre-la-huella-intro', currentLanguage.id) : null,
    enabled: !!currentLanguage,
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['tracks', currentLanguage?.id],
    queryFn: () => currentLanguage ? getTracks(currentLanguage.id) : [],
    enabled: !!currentLanguage,
  });

  // Query para obtener el texto del botón "Comenzar el Recorrido"
  const { data: ctaButtons } = useQuery({
    queryKey: ['cta-buttons', currentLanguage?.id],
    queryFn: () => currentLanguage ? getCTAButtons(currentLanguage.id) : null,
    enabled: !!currentLanguage,
  });

  // Set tracks in audio player context when loaded
  useEffect(() => {
    if (tracks.length > 0) {
      setTracks(tracks);
    }
  }, [tracks, setTracks]);

  // Handle URL track parameter
  useEffect(() => {
    if (trackParam && tracks.length > 0) {
      const trackFromUrl = tracks.find(track => track.id.toString() === trackParam);
      if (trackFromUrl) {
        setSelectedTrack(trackFromUrl);
        setShowIntro(false);
        playTrack(trackFromUrl);
      }
    }
  }, [trackParam, tracks, playTrack]);

  if (introLoading || tracksLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-lg">Cargando...</div>
        </div>
      </Layout>
    );
  }

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track);
    setShowIntro(false);
    playTrack(track);
    // Update URL with track parameter
    setSearchParams({ track: track.id.toString() });
  };

  const handleStartJourney = () => {
    setShowIntro(false);
    if (tracks.length > 0) {
      const firstTrack = tracks[0];
      setSelectedTrack(firstTrack);
      // Automatically start playing the first track
      playTrack(firstTrack);
      // Update URL with first track parameter
      setSearchParams({ track: firstTrack.id.toString() });
    }
  };

  const getCurrentTrackContent = () => {
    const track = selectedTrack || tracks[0];
    return track?.track_contents?.[0];
  };

  const currentTrackContent = getCurrentTrackContent();
  const introContent = introData?.page_contents?.[0];

  // Get CTA settings for the current track with proper language handling
  const getCurrentTrackCTASettings = () => {
    const track = selectedTrack || tracks[0];
    // Fix: Access track_cta_settings correctly - it should be an array, get the first element
    return track?.track_cta_settings?.[0] || track?.track_cta_settings;
  };

  const currentCTASettings = getCurrentTrackCTASettings();
  const ctaLabels = getTrackCTALabels(currentCTASettings, currentLanguage);

  // Get start journey button text
  const getStartJourneyButtonText = () => {
    if (ctaButtons && Array.isArray(ctaButtons)) {
      const startJourneyButton = ctaButtons.find((b: any) => b?.key === 'start_journey');
      if (startJourneyButton?.cta_button_contents?.[0]?.label) {
        return startJourneyButton.cta_button_contents[0].label;
      }
    }
    return 'Comenzar el Recorrido'; // Fallback
  };


  // Si estamos mostrando la introducción (solo si no hay trackParam en la URL)
  if (showIntro && !trackParam) {
    return (
      <Layout showAudioPlayer={false}>
        {/* Track Menu - siempre visible */}
        <TrackSelector 
          tracks={tracks}
          selectedTrack={null}
          onTrackSelect={handleTrackSelect}
          showIntroButton={true}
          isIntroActive={true}
          onIntroClick={() => setShowIntro(true)}
        />

        {/* Intro Section */}
        <IntroSection 
          introContent={introContent}
          onStartJourney={handleStartJourney}
          startJourneyButtonText={getStartJourneyButtonText()}
        />
      </Layout>
    );
  }

  // Si estamos mostrando un track específico
  return (
    <Layout showAudioPlayer={false}>
      {/* Audio Player Section */}
      <section className="relative z-20 bg-background border-b border-border shadow-lg pt-20">
        <div className="container mx-auto px-4 py-4">
          {selectedTrack ? <AudioPlayer /> : (
            <div className="text-center text-muted-foreground py-4">
              Selecciona un track para reproducir
            </div>
          )}
        </div>
      </section>

      {/* Track Menu */}
      <TrackSelector 
        tracks={tracks}
        selectedTrack={selectedTrack}
        onTrackSelect={handleTrackSelect}
        showIntroButton={true}
        isIntroActive={false}
        onIntroClick={() => {
          setShowIntro(true);
          setSearchParams({});
        }}
      />

      {/* Hero Section - ahora con las etiquetas CTA traducidas */}
      <HeroSection 
        currentTrackContent={currentTrackContent} 
        ctaLabels={ctaLabels}
      />

      {/* Textos Section - removemos el título pero mantenemos la sección */}
      {currentCTASettings?.show_texts && (
        <TextsSection 
          currentTrackContent={currentTrackContent}
          showTitle={false}
        />
      )}

      {/* Videos Section - usando las etiquetas correctas según el idioma */}
      {currentCTASettings?.show_videos && (
        <VideosSection 
          selectedTrack={selectedTrack}
          currentLanguage={currentLanguage}
          sectionTitle={ctaLabels.videosLabel}
        />
      )}

      {/* Fotos Section - usando las etiquetas correctas según el idioma */}
      {currentCTASettings?.show_photos && (
        <PhotosSection 
          selectedTrack={selectedTrack}
          currentLanguage={currentLanguage}
          onImageClick={setLightboxImage}
          sectionTitle={ctaLabels.photosLabel}
        />
      )}

      {/* Lightbox Modal */}
      <LightboxModal 
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </Layout>
  );
};

export default RecorreLaHuella;
