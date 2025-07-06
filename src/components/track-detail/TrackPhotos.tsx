
import React, { useState } from 'react';

interface TrackImage {
  id: number;
  image_url?: string;
  caption_es?: string;
  caption_en?: string;
  order_position?: number;
}

interface Language {
  id: number;
  code: string;
  name: string;
}

interface TrackPhotosProps {
  images: TrackImage[];
  currentLanguage: Language | null;
  sectionTitle?: string;
}

const TrackPhotos: React.FC<TrackPhotosProps> = ({ 
  images, 
  currentLanguage, 
  sectionTitle = 'Fotos' 
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const getCaption = (image: TrackImage) => {
    if (!currentLanguage) return image.caption_es || '';
    return currentLanguage.code === 'en' 
      ? (image.caption_en || image.caption_es || '')
      : (image.caption_es || image.caption_en || '');
  };

  return (
    <>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            {sectionTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {images
              .sort((a, b) => (a.order_position || 0) - (b.order_position || 0))
              .map((image) => (
                <div 
                  key={image.id} 
                  className="bg-card rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                  onClick={() => image.image_url && setLightboxImage(image.image_url)}
                >
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {image.image_url ? (
                      <img
                        src={image.image_url}
                        alt={getCaption(image)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-muted-foreground">Sin imagen</div>
                    )}
                  </div>
                  {getCaption(image) && (
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">
                        {getCaption(image)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={lightboxImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TrackPhotos;
