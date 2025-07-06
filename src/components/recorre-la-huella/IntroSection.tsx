
import React from 'react';
import { Button } from '@/components/ui/button';

interface IntroContent {
  title?: string;
  content?: string;
  hero_image_url?: string;
}

interface IntroSectionProps {
  introContent: IntroContent | null;
  onStartJourney: () => void;
}

const IntroSection: React.FC<IntroSectionProps> = ({ introContent, onStartJourney }) => {
  // Función para procesar el contenido y respetar saltos de línea
  const processContent = (content: string) => {
    if (!content) return '';
    
    // Dividir por saltos de línea dobles y crear párrafos
    const paragraphs = content.split(/\n\s*\n/);
    
    return paragraphs
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
  };

  const processedContent = introContent?.content 
    ? processContent(introContent.content)
    : '<p>Sumérgete en un recorrido interactivo por los diferentes tracks que componen este álbum musical.</p>';

  return (
    <section 
      className="hero-section hero-bg-image"
      style={{
        backgroundImage: introContent?.hero_image_url 
          ? `url(${introContent.hero_image_url})`
          : 'url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f)'
      }}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
          {introContent?.title || 'Recorre la Huella'}
        </h1>
        
        <div 
          className="text-lg md:text-xl max-w-4xl mx-auto mb-12 animate-fade-in prose prose-lg prose-p:mb-6 prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: processedContent
          }}
        />
        
        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={onStartJourney}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Comenzar el Recorrido
          </Button>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
