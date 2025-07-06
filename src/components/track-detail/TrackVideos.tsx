
import React from 'react';
import ReactPlayer from 'react-player/vimeo';

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
  if (!videos || videos.length === 0) return null;

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
                <div className="aspect-video">
                  <ReactPlayer
                    url={video.vimeo_url}
                    width="100%"
                    height="100%"
                    controls
                    light={video.thumbnail_url}
                  />
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
