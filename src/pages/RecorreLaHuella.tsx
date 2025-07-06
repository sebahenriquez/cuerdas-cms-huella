
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import AudioPlayer from '@/components/audio/AudioPlayer';
import TrackSelector from '@/components/recorre-la-huella/TrackSelector';
import HeroSection from '@/components/recorre-la-huella/HeroSection';
import TextsSection from '@/components/recorre-la-huella/TextsSection';
import VideosSection from '@/components/recorre-la-huella/VideosSection';
import PhotosSection from '@/components/recorre-la-huella/PhotosSection';
import LightboxModal from '@/components/recorre-la-huella/LightboxModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageBySlug, getTracks } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Track } from '@/types/track';

const RecorreLaHuella = () => {
  const { currentLanguage } = useLanguage();
  const { playTrack, setTracks } = useAudioPlayer();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const { data: pageData, isLoading: pageLoading } = useQuery({
    queryKey: ['page', 'recorre-la-huella', currentLanguage?.id],
    queryFn: () => currentLanguage ? getPageBySlug('recorre-la-huella', currentLanguage.id) : null,
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
      if (!selectedTrack) {
        setSelectedTrack(tracks[0]);
      }
    }
  }, [tracks, setTracks, selectedTrack]);

  if (pageLoading || tracksLoading) {
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
    // Also set it as the current track in the audio player
    playTrack(track);
  };

  const getCurrentTrackContent = () => {
    const track = selectedTrack || tracks[0];
    return track?.track_contents?.[0];
  };

  const currentTrackContent = getCurrentTrackContent();

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
      />

      {/* Hero Section */}
      <HeroSection currentTrackContent={currentTrackContent} />

      {/* Textos Section */}
      <TextsSection currentTrackContent={currentTrackContent} />

      {/* Videos Section */}
      <VideosSection 
        selectedTrack={selectedTrack}
        currentLanguage={currentLanguage}
      />

      {/* Fotos Section */}
      <PhotosSection 
        selectedTrack={selectedTrack}
        currentLanguage={currentLanguage}
        onImageClick={setLightboxImage}
      />

      {/* Lightbox Modal */}
      <LightboxModal 
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </Layout>
  );
};

export default RecorreLaHuella;
