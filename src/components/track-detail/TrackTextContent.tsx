
import React from 'react';

interface TrackTextContentProps {
  content: string;
  sectionTitle?: string;
}

const TrackTextContent: React.FC<TrackTextContentProps> = ({ 
  content, 
  sectionTitle = 'Textos' 
}) => {
  // Función para procesar el contenido y crear párrafos reales
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

  const processedContent = processContent(content);

  if (!content) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          {sectionTitle}
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div 
            className="text-content-formatted prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: processedContent
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default TrackTextContent;
