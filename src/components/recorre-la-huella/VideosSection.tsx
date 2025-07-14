
import React, { useState, useRef } from 'react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoContent {
  title?: string;
  description?: string;
  language_id: number;
}

interface Video {
  id: number;
  vimeo_url: string;
  video_contents?: VideoContent[];
}

interface Track {
  videos?: Video[];
}

interface VideosSectionProps {
  selectedTrack: Track | null;
  currentLanguage: { id: number } | null;
  sectionTitle?: string;
}

const VideosSection: React.FC<VideosSectionProps> = ({ selectedTrack, currentLanguage, sectionTitle }) => {
  const { pauseTrack } = useAudioPlayer();
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});

  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handlePlayVideo = (videoId: string) => {
    console.log('Video play button clicked, calling pauseTrack');
    // Pause the track audio
    pauseTrack();
    // Update iframe src to start playing with better quality parameters
    const iframe = iframeRefs.current[videoId];
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&iv_load_policy=3`;
    }
    // Mark this video as playing to hide the overlay
    setPlayingVideos(prev => new Set(prev).add(videoId));
  };

  return (
    <section id="videos" className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
            {sectionTitle || 'Videos'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedTrack?.videos?.slice(0, 2).map((video, index) => {
              const videoId = getYouTubeId(video.vimeo_url);
              const videoContent = video.video_contents?.find(content => content.language_id === currentLanguage?.id);

              return (
                <div key={video.id} className="bg-card rounded-lg overflow-hidden shadow-lg">
                  <div className="aspect-video relative">
                    {videoId ? (
                      <div className="relative w-full h-full">
                        <iframe
                          ref={(el) => { iframeRefs.current[videoId] = el; }}
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0`}
                          title={videoContent?.title || `Video ${index + 1}`}
                          frameBorder="0"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full rounded-t-lg"
                          allow="autoplay"
                        />
                        {!playingVideos.has(videoId) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-lg z-10">
                            <Button
                              onClick={() => handlePlayVideo(videoId)}
                              size="lg"
                              className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-black shadow-lg"
                            >
                              <Play className="h-6 w-6 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-lg">
                        <p className="text-muted-foreground">Coming soon / Próximamente...</p>
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
                  <div className="aspect-video relative">
                    <iframe
                      ref={(el) => { iframeRefs.current['demo1'] = el; }}
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&modestbranding=1&rel=0"
                      title="Video demostrativo 1"
                      frameBorder="0"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-t-lg"
                      allow="autoplay"
                    />
                    {!playingVideos.has('demo1') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-lg z-10">
                        <Button
                          onClick={() => handlePlayVideo('demo1')}
                          size="lg"
                          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-black shadow-lg"
                        >
                          <Play className="h-6 w-6 ml-1" />
                        </Button>
                      </div>
                    )}
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
                  <div className="aspect-video relative">
                    <iframe
                      ref={(el) => { iframeRefs.current['demo2'] = el; }}
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&modestbranding=1&rel=0"
                      title="Video demostrativo 2"
                      frameBorder="0"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-t-lg"
                      allow="autoplay"
                    />
                    {!playingVideos.has('demo2') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-lg z-10">
                        <Button
                          onClick={() => handlePlayVideo('demo2')}
                          size="lg"
                          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-black shadow-lg"
                        >
                          <Play className="h-6 w-6 ml-1" />
                        </Button>
                      </div>
                    )}
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
  );
};

export default VideosSection;
