
import React from 'react';

interface FeaturedImage {
  image_url: string;
  caption_es?: string;
  caption_en?: string;
}

interface TrackPhotosProps {
  images: FeaturedImage[];
  currentLanguage: any;
}

const TrackPhotos: React.FC<TrackPhotosProps> = ({ images, currentLanguage }) => {
  if (!images || images.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Galería</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={index} className="bg-card rounded-lg overflow-hidden shadow-lg">
              {image.image_url && (
                <img
                  src={image.image_url}
                  alt={currentLanguage?.code === 'en' ? image.caption_en : image.caption_es}
                  className="w-full h-64 object-cover"
                />
              )}
              {(image.caption_es || image.caption_en) && (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage?.code === 'en' ? image.caption_en : image.caption_es}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrackPhotos;
