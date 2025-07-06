
import React from 'react';

interface TrackContent {
  menu_title?: string;
  long_text_content?: string;
}

interface TextsSectionProps {
  currentTrackContent: TrackContent | null;
}

const TextsSection: React.FC<TextsSectionProps> = ({ currentTrackContent }) => {
  // Función mejorada para procesar el contenido HTML y crear párrafos
  const processTextContent = (content: string) => {
    if (!content) return '';
    
    // Si ya contiene HTML, preservarlo
    if (content.includes('<p>') || content.includes('<br>') || content.includes('<div>')) {
      // Limpiar y mejorar el HTML existente
      let processedContent = content
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Asegurar que los <br> tengan espaciado adecuado
        .replace(/<br\s*\/?>/gi, '<br>')
        // Mejorar párrafos existentes
        .replace(/<p>\s*<\/p>/gi, '') // Eliminar párrafos vacíos
        .replace(/<p>/gi, '<p>')
        .replace(/<\/p>/gi, '</p>');
      
      return processedContent;
    }
    
    // Si es texto plano, procesarlo como antes pero con mejor soporte para HTML
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

  const processedContent = currentTrackContent?.long_text_content 
    ? processTextContent(currentTrackContent.long_text_content)
    : `
      <p>Explora la profundidad musical y emocional de este track. Cada pieza ha sido cuidadosamente 
      crafted para transportarte a través de una experiencia única que refleja la esencia de 
      "La Huella de las Cuerdas".</p>
      
      <p>El contenido de esta sección cambia dinámicamente según el track seleccionado, 
      proporcionando información contextual y detallada sobre cada composición musical.</p>
    `;

  return (
    <section id="textos" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
            {currentTrackContent?.menu_title || 'Sobre este Track'}
          </h2>
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-border/30">
            <div 
              className="text-content-formatted text-foreground"
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
