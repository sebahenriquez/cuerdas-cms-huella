
import React from 'react';

interface TrackTextContentProps {
  content: string;
}

const TrackTextContent: React.FC<TrackTextContentProps> = ({ content }) => {
  // Function to process text content for better paragraph handling and HTML support
  const processTextContent = (content: string) => {
    if (!content) return '';
    
    // Si el contenido contiene etiquetas HTML, procesarlo directamente
    if (content.includes('<') && content.includes('>')) {
      let processedContent = content
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Normalizar etiquetas <br>
        .replace(/<br\s*\/?>/gi, '<br>')
        // Limpiar párrafos vacíos
        .replace(/<p>\s*<\/p>/gi, '')
        .trim();
      
      // Si no hay párrafos pero hay contenido, crear párrafos
      if (!processedContent.includes('<p>') && processedContent.length > 0) {
        const parts = processedContent.split('<br>');
        processedContent = parts
          .map(part => part.trim())
          .filter(part => part.length > 0)
          .map(part => `<p>${part}</p>`)
          .join('');
      }
      
      return processedContent;
    }
    
    // Procesamiento para texto plano
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const paragraphs = normalizedContent
      .split(/\n\s*\n+/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
    
    return paragraphs
      .map(paragraph => {
        const paragraphWithBreaks = paragraph.replace(/\n/g, '<br>');
        return `<p>${paragraphWithBreaks}</p>`;
      })
      .join('');
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-border/30">
            <div 
              className="text-content-formatted text-foreground"
              dangerouslySetInnerHTML={{ 
                __html: processTextContent(content)
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackTextContent;
