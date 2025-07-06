
import React from 'react';

interface TrackContent {
  menu_title?: string;
  long_text_content?: string;
}

interface TextsSectionProps {
  currentTrackContent: TrackContent | null;
}

const TextsSection: React.FC<TextsSectionProps> = ({ currentTrackContent }) => {
  // Función mejorada para procesar el texto y mantener saltos de línea
  const processTextContent = (content: string) => {
    if (!content) return '';
    
    // Primero, normalizar los saltos de línea (Windows, Mac, Unix)
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Dividir por saltos de línea dobles para crear párrafos
    const paragraphs = normalizedContent.split(/\n\s*\n/);
    
    return paragraphs
      .map(paragraph => {
        // Limpiar espacios al inicio y final
        const cleanParagraph = paragraph.trim();
        if (cleanParagraph.length === 0) return '';
        
        // Convertir saltos de línea simples dentro del párrafo en <br>
        const paragraphWithBreaks = cleanParagraph.replace(/\n/g, '<br>');
        
        return `<p class="mb-6">${paragraphWithBreaks}</p>`;
      })
      .filter(paragraph => paragraph.length > 0)
      .join('');
  };

  const processedContent = currentTrackContent?.long_text_content 
    ? processTextContent(currentTrackContent.long_text_content)
    : `
      <p class="mb-6">Explora la profundidad musical y emocional de este track. Cada pieza ha sido cuidadosamente 
      crafted para transportarte a través de una experiencia única que refleja la esencia de 
      "La Huella de las Cuerdas".</p>
      
      <p class="mb-6">El contenido de esta sección cambia dinámicamente según el track seleccionado, 
      proporcionando información contextual y detallada sobre cada composición musical.</p>
    `;

  return (
    <section id="textos" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-[60%] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
            {currentTrackContent?.menu_title || 'Sobre este Track'}
          </h2>
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border/30">
            <div 
              className="text-foreground text-lg leading-relaxed"
              style={{
                lineHeight: '1.8',
              }}
              dangerouslySetInnerHTML={{ 
                __html: processedContent
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextsSection;
