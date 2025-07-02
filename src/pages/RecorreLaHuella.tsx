import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageBySlug, getTracks } from '@/lib/supabase-helpers';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const RecorreLaHuella = () => {
  const { currentLanguage } = useLanguage();
  const { playTrack, currentTrack, isPlaying, pauseTrack, setTracks } = useAudioPlayer();
  const [selectedTrack, setSelectedTrack] = useState(null);

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

  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
  };

  const handlePlayPause = () => {
    if (!selectedTrack) return;
    
    if (currentTrack?.id === selectedTrack.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(selectedTrack);
    }
  };

  const getCurrentTrackContent = () => {
    const track = selectedTrack || tracks[0];
    return track?.track_contents?.[0];
  };

  const currentTrackContent = getCurrentTrackContent();
  const currentTrackForPlayer = selectedTrack || tracks[0];
  const isCurrentTrackPlaying = currentTrack?.id === currentTrackForPlayer?.id && isPlaying;

  return (
    <Layout showAudioPlayer={true}>
      {/* Track Menu */}
      <section className="track-nav bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container-wide py-4">
          <div className="flex items-center justify-center space-x-6 flex-wrap">
            <span className="text-muted-foreground text-sm font-medium mr-2">Tracks:</span>
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => handleTrackSelect(track)}
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

      {/* Audio Player Bar */}
      <section className="audio-player-mini bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container-wide py-3">
          <div className="flex items-center justify-center space-x-4 text-foreground">
            <span className="text-muted-foreground text-sm">♪</span>
            <span className="font-medium text-foreground">
              {currentTrackContent?.title || `Track ${currentTrackForPlayer?.order_position}`}
            </span>
            <Button
              onClick={handlePlayPause}
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80 hover:bg-primary/10 p-2 rounded-full"
            >
              {isCurrentTrackPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            {currentTrackContent?.description && (
              <span className="text-muted-foreground text-sm italic hidden md:inline">
                {currentTrackContent.description}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Hero Section - Changes based on selected track */}
      <section 
        className="hero-section"
        style={{
          backgroundImage: currentTrackContent?.hero_image_url 
            ? `url(${currentTrackContent.hero_image_url})`
            : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {currentTrackContent?.title || 'Recorre la Huella'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in opacity-90">
            Sumérgete en un recorrido interactivo por los diferentes tracks que 
            componen este álbum musical. Cada pieza cuenta una historia única sobre 
            la experiencia musical que nos conecta.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
              {currentTrackContent?.menu_title || 'Sobre este Track'}
            </h2>
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
              <div 
                className="prose prose-lg max-w-none text-foreground"
                dangerouslySetInnerHTML={{ 
                  __html: currentTrackContent?.long_text_content || `
                    <p>Explora la profundidad musical y emocional de este track. Cada pieza ha sido cuidadosamente 
                    crafted para transportarte a través de una experiencia única que refleja la esencia de 
                    "La Huella de las Cuerdas".</p>
                    
                    <p>El contenido de esta sección cambia dinámicamente según el track seleccionado, 
                    proporcionando información contextual y detallada sobre cada composición musical.</p>
                  `
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RecorreLaHuella;