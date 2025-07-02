import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageBySlug, getTracks } from '@/lib/supabase-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack, Music2 } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const EscuchaLaHuella = () => {
  const { currentLanguage } = useLanguage();
  const { playTrack, pauseTrack, currentTrack, isPlaying, setTracks } = useAudioPlayer();

  const { data: pageData, isLoading: pageLoading } = useQuery({
    queryKey: ['page', 'escucha-la-huella', currentLanguage?.id],
    queryFn: () => currentLanguage ? getPageBySlug('escucha-la-huella', currentLanguage.id) : null,
    enabled: !!currentLanguage,
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['tracks', currentLanguage?.id],
    queryFn: () => currentLanguage ? getTracks(currentLanguage.id) : [],
    enabled: !!currentLanguage,
  });

  React.useEffect(() => {
    if (tracks.length > 0) {
      setTracks(tracks);
    }
  }, [tracks, setTracks]);

  if (pageLoading || tracksLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-lg">Cargando...</div>
        </div>
      </Layout>
    );
  }

  const pageContent = pageData?.page_contents?.[0];

  const handlePlayPause = () => {
    if (currentTrack && isPlaying) {
      pauseTrack();
    } else if (currentTrack) {
      playTrack(currentTrack);
    } else if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  const playNext = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextTrack = tracks[currentIndex + 1];
    if (nextTrack) {
      playTrack(nextTrack);
    }
  };

  const playPrevious = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const previousTrack = tracks[currentIndex - 1];
    if (previousTrack) {
      playTrack(previousTrack);
    }
  };

  return (
    <Layout showAudioPlayer={true}>
      {/* Hero Section */}
      <section 
        className="hero-section"
        style={{
          backgroundImage: `url(${pageContent?.hero_image_url || 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73'})`
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {pageContent?.title || 'Escucha la Huella'}
          </h1>
          <div 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in"
            dangerouslySetInnerHTML={{ 
              __html: pageContent?.content || '<p>Experimenta el álbum completo...</p>'
            }}
          />
        </div>
      </section>

      {/* Player Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Main Player Card */}
          <Card className="mb-12 overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div 
                  className="h-64 md:h-80 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${'https://i.ibb.co/Psq17ZKw/Cover.jpg'})`
                  }}
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="h-full flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-2">
                    {currentTrack?.track_contents?.[0]?.title || 'La Huella de las Cuerdas'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Álbum completo
                  </p>
                  
                  {/* Player Controls */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={playPrevious}
                      disabled={!currentTrack || tracks.findIndex(t => t.id === currentTrack.id) === 0}
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      size="lg"
                      onClick={handlePlayPause}
                      className="w-16 h-16 rounded-full"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-1" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={playNext}
                      disabled={!currentTrack || tracks.findIndex(t => t.id === currentTrack.id) === tracks.length - 1}
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Track {currentTrack?.order_position || 1} de {tracks.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Track List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Music2 className="h-5 w-5" />
                <span>Lista de Tracks</span>
              </CardTitle>
              <CardDescription>
                Todos los tracks del álbum "La Huella de las Cuerdas"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tracks.map((track, index) => {
                  const trackContent = track.track_contents?.[0];
                  const isCurrentTrack = currentTrack?.id === track.id;
                  
                  return (
                    <div
                      key={track.id}
                      className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${
                        isCurrentTrack 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => playTrack(track)}
                    >
                      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {track.order_position}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {trackContent?.title || `Track ${track.order_position}`}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {trackContent?.menu_title || `Pista ${track.order_position}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrentTrack && isPlaying) {
                            pauseTrack();
                          } else {
                            playTrack(track);
                          }
                        }}
                      >
                        {isCurrentTrack && isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default EscuchaLaHuella;