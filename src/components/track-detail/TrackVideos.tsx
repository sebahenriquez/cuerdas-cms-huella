
import React, { useState } from 'react';
import ReactPlayer from 'react-player/vimeo';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Video {
  id: number;
  vimeo_url: string;
  thumbnail_url?: string;
  video_contents?: Array<{
    title?: string;
    description?: string;
    language_id: number;
  }>;
}

interface TrackVideosProps {
  videos: Video[];
  sectionTitle?: string;
}

const TrackVideos: React.FC<TrackVideosProps> = ({ 
  videos, 
  sectionTitle = 'Videos' 
}) => {
  const { pauseTrack } = useAudioPlayer();
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());

  if (!videos || videos.length === 0) return null;

  const handlePlayVideo = (videoId: number) => {
    // Pause the track audio
    pauseTrack();
    // Mark this video as playing
    setPlayingVideos(prev => new Set(prev).add(videoId));
  };

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          {sectionTitle}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {videos.map((video) => {
            const videoContent = video.video_contents?.[0];
            
            return (
              <div key={video.id} className="bg-background rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-video relative">
                  {playingVideos.has(video.id) ? (
                    <ReactPlayer
                      url={video.vimeo_url}
                      width="100%"
                      height="100%"
                      controls
                      playing={true}
                      light={false}
                    />
                  ) : (
                    <>
                      <ReactPlayer
                        url={video.vimeo_url}
                        width="100%"
                        height="100%"
                        controls={false}
                        light={video.thumbnail_url || true}
                        playing={false}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          onClick={() => handlePlayVideo(video.id)}
                          size="lg"
                          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-black shadow-lg"
                        >
                          <Play className="h-6 w-6 ml-1" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                
                {videoContent && (
                  <div className="p-6">
                    {videoContent.title && (
                      <h3 className="text-xl font-semibold mb-2 text-foreground">
                        {videoContent.title}
                      </h3>
                    )}
                    {videoContent.description && (
                      <p className="text-muted-foreground">
                        {videoContent.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrackVideos;
