import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageBySlug, getTracks } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const RecorreLaHuella = () => {
  const { currentLanguage } = useLanguage();
  const { playTrack, currentTrack, isPlaying, pauseTrack, setTracks } = useAudioPlayer();
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

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
      <section className="relative z-10 bg-card/95 backdrop-blur-xl">
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

      {/* Hero Section - Changes based on selected track */}
      <section 
        className="relative h-[50vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: currentTrackContent?.hero_image_url 
            ? `url(${currentTrackContent.hero_image_url})`
            : 'url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f)'
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            {currentTrackContent?.title || 'Recorre la Huella'}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto animate-fade-in opacity-90 mb-8">
            {currentTrackContent?.description || 'Sumérgete en un recorrido interactivo por los diferentes tracks que componen este álbum musical.'}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#textos"
              className="bg-primary/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg border border-white/30 hover:bg-primary/30 transition-all duration-300 transform hover:scale-105"
            >
              Textos
            </a>
            <a
              href="#videos"
              className="bg-primary/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg border border-white/30 hover:bg-primary/30 transition-all duration-300 transform hover:scale-105"
            >
              Videos
            </a>
            <a
              href="#fotos"
              className="bg-primary/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg border border-white/30 hover:bg-primary/30 transition-all duration-300 transform hover:scale-105"
            >
              Fotos
            </a>
          </div>
        </div>
      </section>

      {/* Textos Section */}
      <section id="textos" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-[60%] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
              {currentTrackContent?.menu_title || 'Sobre este Track'}
            </h2>
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border/30">
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

      {/* Videos Section */}
      <section id="videos" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedTrack?.videos?.slice(0, 2).map((video, index) => {
                // Extract YouTube video ID from various URL formats
                const getYouTubeId = (url) => {
                  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
                  const match = url.match(regex);
                  return match ? match[1] : null;
                };

                const videoId = getYouTubeId(video.vimeo_url); // Note: field name is vimeo_url but it stores YouTube URLs
                const videoContent = video.video_contents?.find(content => content.language_id === currentLanguage?.id);

                return (
                  <div key={video.id} className="bg-card rounded-lg overflow-hidden shadow-lg">
                    <div className="aspect-video">
                      {videoId ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={videoContent?.title || `Video ${index + 1}`}
                          frameBorder="0"
                          allowFullScreen
                          className="rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-lg">
                          <p className="text-muted-foreground">Video no disponible</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {videoContent?.title || `Video ${index + 1}`}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {videoContent?.description || 'Descripción del video'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Show demo videos if no videos are configured */}
              {(!selectedTrack?.videos || selectedTrack.videos.length === 0) && (
                <>
                  <div className="bg-card rounded-lg overflow-hidden shadow-lg">
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Video demostrativo 1"
                        frameBorder="0"
                        allowFullScreen
                        className="rounded-t-lg"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Técnicas de interpretación
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Descubre las técnicas especiales utilizadas en este track.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-lg overflow-hidden shadow-lg">
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Video demostrativo 2"
                        frameBorder="0"
                        allowFullScreen
                        className="rounded-t-lg"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Historia del instrumento
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Conoce la historia detrás de los instrumentos utilizados.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Fotos Section */}
      <section id="fotos" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">Fotos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedTrack?.track_featured_images?.slice(0, 8).map((photo, index) => {
                const caption = currentLanguage?.code === 'es' ? photo.caption_es : photo.caption_en;
                return (
                  <div 
                    key={photo.id}
                    className="group cursor-pointer overflow-hidden rounded-lg border border-border/30 hover:border-primary/50 transition-all duration-300"
                    onClick={() => setLightboxImage(photo.image_url)}
                  >
                    <img 
                      src={photo.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'} 
                      alt={caption || `Imagen ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4 bg-card">
                      <h3 className="text-sm font-medium text-foreground">{caption || `Imagen ${index + 1}`}</h3>
                    </div>
                  </div>
                );
              })}

              {/* Show demo photos if no photos are configured */}
              {(!selectedTrack?.track_featured_images || selectedTrack.track_featured_images.length === 0) && (
                <>
                  <div 
                    className="group cursor-pointer overflow-hidden rounded-lg border border-border/30 hover:border-primary/50 transition-all duration-300"
                    onClick={() => setLightboxImage('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800')}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop" 
                      alt="Imagen destacada 1"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4 bg-card">
                      <h3 className="text-sm font-medium text-foreground">Instrumento histórico</h3>
                    </div>
                  </div>
                  
                  <div 
                    className="group cursor-pointer overflow-hidden rounded-lg border border-border/30 hover:border-primary/50 transition-all duration-300"
                    onClick={() => setLightboxImage('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800')}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop" 
                      alt="Imagen destacada 2"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4 bg-card">
                      <h3 className="text-sm font-medium text-foreground">Detalles constructivos</h3>
                    </div>
                  </div>
                  
                  <div 
                    className="group cursor-pointer overflow-hidden rounded-lg border border-border/30 hover:border-primary/50 transition-all duration-300"
                    onClick={() => setLightboxImage('https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800')}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop" 
                      alt="Imagen destacada 3"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4 bg-card">
                      <h3 className="text-sm font-medium text-foreground">Sesión de grabación</h3>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={lightboxImage} 
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RecorreLaHuella;