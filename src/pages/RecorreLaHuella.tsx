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
    <Layout>
      {/* Track Menu */}
      <section className="bg-red-500 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 flex-wrap">
            <span className="text-white text-sm font-medium mr-4">MENÚ por número de track en (números en círculos)</span>
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => handleTrackSelect(track)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  selectedTrack?.id === track.id 
                    ? 'bg-white text-red-500' 
                    : 'bg-red-600 text-white border border-white hover:bg-red-400'
                }`}
              >
                {track.order_position}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Audio Player Bar */}
      <section className="bg-red-400 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 text-white">
            <span className="text-sm">reproductor de audio-</span>
            <span className="font-medium">
              {currentTrackContent?.title || `Track ${currentTrackForPlayer?.order_position}`}
            </span>
            <span className="text-sm">-</span>
            <Button
              onClick={handlePlayPause}
              variant="ghost"
              size="sm"
              className="text-white hover:text-red-200 hover:bg-red-500 p-1"
            >
              {isCurrentTrackPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm">- tags del track (editables desde backend)</span>
            {currentTrackContent?.description && (
              <span className="text-sm italic">
                {currentTrackContent.description}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Hero Section - Changes based on selected track */}
      <section 
        className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-pink-400 to-pink-600"
        style={{
          backgroundImage: currentTrackContent?.hero_image_url 
            ? `linear-gradient(rgba(236, 72, 153, 0.7), rgba(236, 72, 153, 0.7)), url(${currentTrackContent.hero_image_url})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            TÍTULO CON FONDO DE IMAGEN TIPO HERO
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            {currentTrackContent?.title || `Track ${currentTrackForPlayer?.order_position}`}
          </p>
          <p className="text-base md:text-lg max-w-3xl mx-auto mt-4 opacity-90">
            Sumérgete en un recorrido interactivo por los diferentes tracks que 
            componen este álbum musical. Cada pieza cuenta una historia única sobre...
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-pink-400 to-pink-600">
        <div className="max-w-4xl mx-auto text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-black">
            Título Secundario
          </h2>
          <div className="bg-black/10 p-8 rounded-lg">
            <div 
              className="text-base md:text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: currentTrackContent?.long_text_content || `
                  <p>Box text, long text. Este espacio está destinado para contenido extenso sobre el track seleccionado. 
                  El contenido cambiará dinámicamente según el track que esté seleccionado en el menú superior.</p>
                  
                  <p>Todo este contenido es editable desde el backend de manera WYSIWYG, permitiendo a los administradores 
                  modificar fácilmente el texto, formato y estructura de cada track individual.</p>
                `
              }}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RecorreLaHuella;