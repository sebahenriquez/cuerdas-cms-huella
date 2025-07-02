import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageBySlug, getTracks } from '@/lib/supabase-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Music, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const RecorreLaHuella = () => {
  const { currentLanguage } = useLanguage();
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

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

  return (
    <Layout showAudioPlayer={true}>
      {/* Hero Section */}
      <section 
        className="hero-section"
        style={{
          backgroundImage: `url(${pageContent?.hero_image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'})`
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {pageContent?.title || 'Recorre la Huella'}
          </h1>
          <div 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in"
            dangerouslySetInnerHTML={{ 
              __html: pageContent?.content || '<p>Sumérgete en un recorrido interactivo por los diferentes tracks...</p>'
            }}
          />
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6">
            {tracks.map((track, index) => {
              const trackContent = track.track_contents?.[0];
              const isCurrentTrack = currentTrack?.id === track.id;
              
              return (
                <Card key={track.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <div 
                        className="h-48 md:h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${'https://images.unsplash.com/photo-1471478331149-c72f17e33c73'})`
                        }}
                      />
                    </div>
                    <div className="md:w-2/3">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {track.order_position}
                            </span>
                            <div>
                              <CardTitle className="text-2xl">
                                {trackContent?.title || `Track ${track.order_position}`}
                              </CardTitle>
                              <CardDescription className="text-lg mt-1">
                                {trackContent?.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => playTrack(track)}
                              variant={isCurrentTrack && isPlaying ? "secondary" : "default"}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              <span>{isCurrentTrack && isPlaying ? 'Reproduciendo' : 'Reproducir'}</span>
                            </Button>
                            <Button variant="outline" asChild>
                              <Link to={`/track/${track.id}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="text-muted-foreground line-clamp-3"
                          dangerouslySetInnerHTML={{ 
                            __html: trackContent?.long_text_content?.substring(0, 200) + '...' || ''
                          }}
                        />
                        <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Music className="h-4 w-4" />
                            <span>Track Musical</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>~ 5 min</span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RecorreLaHuella;