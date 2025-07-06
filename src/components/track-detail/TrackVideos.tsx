
import React from 'react';

interface VideoContent {
  title?: string;
  description?: string;
}

interface Video {
  id: number;
  vimeo_url: string;
  order_position: number;
  video_contents?: VideoContent[];
}

interface TrackVideosProps {
  videos: Video[];
}

const TrackVideos: React.FC<TrackVideosProps> = ({ videos }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Videos</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {videos.map((video) => (
            <div key={video.id} className="bg-card rounded-lg overflow-hidden shadow-lg">
              {video.vimeo_url && (
                <div className="aspect-video">
                  <iframe
                    src={video.vimeo_url}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {video.video_contents?.[0]?.title || `Video ${video.order_position}`}
                </h3>
                <p className="text-muted-foreground">
                  {video.video_contents?.[0]?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrackVideos;
