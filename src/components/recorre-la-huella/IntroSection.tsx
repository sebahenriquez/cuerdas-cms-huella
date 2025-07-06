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
  startJourneyButtonText?: string;
}

const IntroSection: React.FC<IntroSectionProps> = ({ 
  introContent, 
  onStartJourney, 
  startJourneyButtonText = 'Comenzar el Recorrido'
}) => {
  // Función mejorada para procesar el contenido y crear párrafos reales
  const processContent = (content: string) => {
    if (!content) return '';
    
    // Normalizar los saltos de línea
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Dividir por uno o más saltos de línea para crear párrafos
    const paragraphs = normalizedContent
      .split(/\n\s*\n+/) // Dividir por dobles saltos de línea o más
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
    
    return paragraphs
      .map(paragraph => {
        // Reemplazar saltos de línea simples dentro del párrafo con <br>
        const paragraphWithBreaks = paragraph.replace(/\n/g, '<br>');
        return `<p>${paragraphWithBreaks}</p>`;
      })
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
        
        <div className="max-w-4xl mx-auto mb-12 animate-fade-in">
          <div 
            className="text-content-formatted-hero text-white"
            dangerouslySetInnerHTML={{ 
              __html: processedContent
            }}
          />
        </div>
        
        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={onStartJourney}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {startJourneyButtonText}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
