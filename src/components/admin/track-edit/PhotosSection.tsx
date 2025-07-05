
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, Plus, X } from 'lucide-react';

interface PhotoData {
  id?: number;
  media_file_id?: number;
  caption_es: string;
  caption_en: string;
  order_position: number;
  image_url?: string;
}

interface PhotosSectionProps {
  photos: PhotoData[];
  onPhotosChange: (photos: PhotoData[]) => void;
}

const PhotosSection: React.FC<PhotosSectionProps> = ({
  photos,
  onPhotosChange
}) => {
  const addPhoto = () => {
    if (photos.length < 8) {
      const newPhotos = [
        ...photos,
        {
          caption_es: '',
          caption_en: '',
          order_position: photos.length + 1,
          image_url: ''
        }
      ];
      onPhotosChange(newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const updatePhoto = (index: number, field: keyof PhotoData, value: string) => {
    const newPhotos = photos.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    );
    onPhotosChange(newPhotos);
  };

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <Label className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Fotos (máx. 8)
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPhoto}
          disabled={photos.length >= 8}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {photos.map((photo, index) => (
          <div key={index} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Foto {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePhoto(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="URL de la imagen"
              value={photo.image_url || ''}
              onChange={(e) => updatePhoto(index, 'image_url', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Descripción (ES)"
                value={photo.caption_es}
                onChange={(e) => updatePhoto(index, 'caption_es', e.target.value)}
              />
              <Input
                placeholder="Descripción (EN)"
                value={photo.caption_en}
                onChange={(e) => updatePhoto(index, 'caption_en', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosSection;
