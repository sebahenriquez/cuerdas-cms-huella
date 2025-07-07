
import React from 'react';

interface FeaturedImage {
  id: number;
  image_url: string;
  caption_es?: string;
  caption_en?: string;
}

interface Track {
  track_featured_images?: FeaturedImage[];
}

interface PhotosSectionProps {
  selectedTrack: Track | null;
  currentLanguage: { code: string } | null;
  onImageClick: (imageUrl: string) => void;
  sectionTitle?: string;
}

const PhotosSection: React.FC<PhotosSectionProps> = ({ 
  selectedTrack, 
  currentLanguage, 
  onImageClick,
  sectionTitle 
}) => {
  // Solo mostrar si hay imágenes configuradas
  const hasImages = selectedTrack?.track_featured_images && selectedTrack.track_featured_images.length > 0;
  
  if (!hasImages) {
    return null; // No mostrar la sección si no hay imágenes
  }

  return (
    <section id="fotos" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
            {sectionTitle || 'Fotos'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedTrack.track_featured_images.slice(0, 8).map((photo, index) => {
              const caption = currentLanguage?.code === 'es' ? photo.caption_es : photo.caption_en;
              return (
                <div 
                  key={photo.id}
                  className="group cursor-pointer overflow-hidden rounded-lg border border-border/30 hover:border-primary/50 transition-all duration-300"
                  onClick={() => onImageClick(photo.image_url)}
                >
                  <img 
                    src={photo.image_url} 
                    alt={caption || `Imagen ${index + 1}`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Error loading image:', photo.image_url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="p-4 bg-card">
                    <h3 className="text-sm font-medium text-foreground">
                      {caption || `Imagen ${index + 1}`}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhotosSection;
