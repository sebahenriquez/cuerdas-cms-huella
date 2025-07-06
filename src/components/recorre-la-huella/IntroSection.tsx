
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
  // Función mejorada para procesar el contenido y mantener saltos de línea
  const processContent = (content: string) => {
    if (!content) return '';
    
    // Normalizar los saltos de línea
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Dividir por saltos de línea dobles para crear párrafos
    const paragraphs = normalizedContent.split(/\n\s*\n/);
    
    return paragraphs
      .map(paragraph => {
        const cleanParagraph = paragraph.trim();
        if (cleanParagraph.length === 0) return '';
        
        // Convertir saltos de línea simples en <br>
        const paragraphWithBreaks = cleanParagraph.replace(/\n/g, '<br>');
        
        return `<p class="mb-6">${paragraphWithBreaks}</p>`;
      })
      .filter(paragraph => paragraph.length > 0)
      .join('');
  };

  const processedContent = introContent?.content 
    ? processContent(introContent.content)
    : '<p class="mb-6">Sumérgete en un recorrido interactivo por los diferentes tracks que componen este álbum musical.</p>';

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
          className="text-lg md:text-xl max-w-4xl mx-auto mb-12 animate-fade-in text-white"
          style={{
            lineHeight: '1.7',
          }}
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
