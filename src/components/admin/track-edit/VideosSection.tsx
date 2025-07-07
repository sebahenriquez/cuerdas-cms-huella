
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Video, Plus, X } from 'lucide-react';

interface Language {
  id: number;
  name: string;
  code: string;
}

interface VideoContent {
  id?: number;
  title: string;
  description: string;
  language_id: number;
}

interface VideoData {
  id?: number;
  vimeo_url: string;
  thumbnail_url?: string;
  order_position: number;
  video_contents?: VideoContent[];
}

interface VideosSectionProps {
  videos: VideoData[];
  languages: Language[];
  onVideosChange: (videos: VideoData[]) => void;
  onVideoContentChange: (videoIndex: number, languageId: number, field: keyof VideoContent, value: string) => void;
}

const VideosSection: React.FC<VideosSectionProps> = ({
  videos,
  languages,
  onVideosChange,
  onVideoContentChange
}) => {
  const addVideo = () => {
    if (videos.length < 3) {
      const newVideos = [
        ...videos,
        {
          vimeo_url: '',
          order_position: videos.length + 1,
          video_contents: languages.map(lang => ({
            title: '',
            description: '',
            language_id: lang.id
          }))
        }
      ];
      onVideosChange(newVideos);
    }
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosChange(newVideos);
  };

  const updateVideo = (index: number, field: string, value: string) => {
    const newVideos = videos.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    );
    onVideosChange(newVideos);
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <Label className="flex items-center gap-2 font-semibold">
          <Video className="h-4 w-4" />
          Videos (máx. 3)
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addVideo}
          disabled={videos.length >= 3}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {videos.map((video, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Video {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeVideo(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Label className="text-sm">URL del Video</Label>
              <Input
                placeholder="https://youtu.be/... o https://vimeo.com/..."
                value={video.vimeo_url}
                onChange={(e) => updateVideo(index, 'vimeo_url', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">URL de Miniatura (opcional)</Label>
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={video.thumbnail_url || ''}
                onChange={(e) => updateVideo(index, 'thumbnail_url', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Contenido del Video</Label>
              {languages.map((lang) => {
                const content = video.video_contents?.find(c => c.language_id === lang.id);
                return (
                  <div key={lang.id} className="border rounded p-3 space-y-2 bg-background">
                    <Label className="text-xs text-muted-foreground font-medium">{lang.name}</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder={`Título del video (${lang.code.toUpperCase()})`}
                        value={content?.title || ''}
                        onChange={(e) => onVideoContentChange(index, lang.id, 'title', e.target.value)}
                      />
                      <Textarea
                        placeholder={`Descripción del video (${lang.code.toUpperCase()})`}
                        value={content?.description || ''}
                        rows={2}
                        onChange={(e) => onVideoContentChange(index, lang.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideosSection;
