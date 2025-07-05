
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TrackSettingsForm from './TrackSettingsForm';
import CTASettingsForm from './CTASettingsForm';
import VideosSection from './VideosSection';
import PhotosSection from './PhotosSection';
import { TrackCTASettings, VideoData, PhotoData, Language, VideoContent } from '@/hooks/useTrackData';

interface TrackSidebarProps {
  orderPosition: number;
  audioUrl: string;
  status: string;
  ctaSettings: TrackCTASettings;
  videos: VideoData[];
  photos: PhotoData[];
  languages: Language[];
  onOrderPositionChange: (value: number) => void;
  onAudioUrlChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCTASettingsChange: (settings: Partial<TrackCTASettings>) => void;
  onVideosChange: (videos: VideoData[]) => void;
  onPhotosChange: (photos: PhotoData[]) => void;
  onVideoContentChange: (videoIndex: number, languageId: number, field: keyof VideoContent, value: string) => void;
}

const TrackSidebar: React.FC<TrackSidebarProps> = ({
  orderPosition,
  audioUrl,
  status,
  ctaSettings,
  videos,
  photos,
  languages,
  onOrderPositionChange,
  onAudioUrlChange,
  onStatusChange,
  onCTASettingsChange,
  onVideosChange,
  onPhotosChange,
  onVideoContentChange
}) => {
  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-6">
        <TrackSettingsForm
          orderPosition={orderPosition}
          audioUrl={audioUrl}
          status={status}
          onOrderPositionChange={onOrderPositionChange}
          onAudioUrlChange={onAudioUrlChange}
          onStatusChange={onStatusChange}
        />

        <CTASettingsForm
          ctaSettings={ctaSettings}
          onCTASettingsChange={onCTASettingsChange}
        />

        {ctaSettings?.show_videos && (
          <VideosSection
            videos={videos}
            languages={languages}
            onVideosChange={onVideosChange}
            onVideoContentChange={onVideoContentChange}
          />
        )}

        {ctaSettings?.show_photos && (
          <PhotosSection
            photos={photos}
            onPhotosChange={onPhotosChange}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TrackSidebar;
