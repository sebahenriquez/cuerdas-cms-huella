
import React from 'react';

interface TrackContent {
  menu_title?: string;
  long_text_content?: string;
}

interface TextsSectionProps {
  currentTrackContent: TrackContent | null;
}

const TextsSection: React.FC<TextsSectionProps> = ({ currentTrackContent }) => {
  return (
    <section id="textos" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-[60%] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
            {currentTrackContent?.menu_title || 'Sobre este Track'}
          </h2>
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border/30">
            <div 
              className="prose prose-lg max-w-none text-foreground prose-p:mb-4 prose-p:leading-relaxed"
              style={{
                lineHeight: '1.7',
              }}
              dangerouslySetInnerHTML={{ 
                __html: currentTrackContent?.long_text_content || `
                  <p>Explora la profundidad musical y emocional de este track. Cada pieza ha sido cuidadosamente 
                  crafted para transportarte a través de una experiencia única que refleja la esencia de 
                  "La Huella de las Cuerdas".</p>
                  
                  <p>El contenido de esta sección cambia dinámicamente según el track seleccionado, 
                  proporcionando información contextual y detallada sobre cada composición musical.</p>
                `
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextsSection;
