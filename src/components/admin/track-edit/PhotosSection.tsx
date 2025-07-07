
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    if (photos.length < 5) {
      const newPhotos = [
        ...photos,
        {
          image_url: '',
          caption_es: '',
          caption_en: '',
          order_position: photos.length + 1
        }
      ];
      onPhotosChange(newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const updatePhoto = (index: number, field: keyof PhotoData, value: string | number) => {
    const newPhotos = photos.map((photo, i) => 
      i === index ? { ...photo, [field]: value } : photo
    );
    onPhotosChange(newPhotos);
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <Label className="flex items-center gap-2 font-semibold">
          <Image className="h-4 w-4" />
          Fotos (máx. 5)
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPhoto}
          disabled={photos.length >= 5}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {photos.map((photo, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
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
            
            <div>
              <Label className="text-sm">URL de la Imagen</Label>
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={photo.image_url || ''}
                onChange={(e) => updatePhoto(index, 'image_url', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm">Descripción en Español</Label>
              <Textarea
                placeholder="Descripción de la imagen en español"
                value={photo.caption_es}
                onChange={(e) => updatePhoto(index, 'caption_es', e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm">Descripción en Inglés</Label>
              <Textarea
                placeholder="Image description in English"
                value={photo.caption_en}
                onChange={(e) => updatePhoto(index, 'caption_en', e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosSection;
