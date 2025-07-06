
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { getPageBySlug, getTracks, getTrackCTALabels } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Track } from '@/types/track';

const RecorreLaHuella = () => {
  const { currentLanguage } = useLanguage();
  const { playTrack, setTracks } = useAudioPlayer();
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

  // Set tracks in audio player context when loaded
  useEffect(() => {
    if (tracks.length > 0) {
      setTracks(tracks);
    }
  }, [tracks, setTracks]);

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
  };

  const handleStartJourney = () => {
    setShowIntro(false);
    if (tracks.length > 0) {
      setSelectedTrack(tracks[0]);
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
    return track?.track_cta_settings?.[0];
  };

  const currentCTASettings = getCurrentTrackCTASettings();
  const ctaLabels = getTrackCTALabels(currentCTASettings, currentLanguage);

  console.log('Current CTA Settings:', currentCTASettings);
  console.log('Current Language:', currentLanguage);
  console.log('CTA Labels:', ctaLabels);

  // Si estamos mostrando la introducción
  if (showIntro) {
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
        />
      </Layout>
    );
  }

  // Si estamos mostrando un track específico
  return (
    <Layout showAudioPlayer={false}>
      {/* Audio Player Section */}
      <section className="relative z-20 bg-background border-b border-border shadow-lg">
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
        onIntroClick={() => setShowIntro(true)}
      />

      {/* Hero Section */}
      <HeroSection currentTrackContent={currentTrackContent} />

      {/* Textos Section - usando las etiquetas correctas según el idioma */}
      {currentCTASettings?.show_texts && (
        <TextsSection 
          currentTrackContent={currentTrackContent}
          sectionTitle={ctaLabels.textsLabel}
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
