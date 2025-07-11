
import { supabase } from "@/integrations/supabase/client";

export const initializeAboutContent = async () => {
  try {
    console.log('Initializing About content...');

    // Obtener idiomas disponibles
    const { data: languages, error: langError } = await supabase
      .from('languages')
      .select('*');
    
    if (langError) {
      console.error('Error fetching languages:', langError);
      return;
    }

    const spanishLang = languages.find(lang => lang.code === 'es');
    const englishLang = languages.find(lang => lang.code === 'en');

    if (!spanishLang || !englishLang) {
      console.error('Spanish or English language not found');
      return;
    }

    // Inicializar contenido de secciones
    const sectionsContent = [
      {
        section_key: 'hero',
        contents: [
          {
            language_id: englishLang.id,
            title: 'About the Project',
            subtitle: 'La Huella de las Cuerdas',
            content: 'A musical journey through Latin America exploring the cultural impact of stringed instruments.'
          },
          {
            language_id: spanishLang.id,
            title: 'Sobre el Proyecto',
            subtitle: 'La Huella de las Cuerdas',
            content: 'Un viaje musical por América Latina explorando el impacto cultural de los instrumentos de cuerda.'
          }
        ]
      },
      {
        section_key: 'general_explanation',
        contents: [
          {
            language_id: englishLang.id,
            title: 'The Project',
            subtitle: '',
            content: `<p>Berta Rojas presents The Journey of Strings, a project tracing the cultural impact of the guitar in Latin America and illuminating the ties that bind it in so many ways to the wider family of stringed instruments in the Americas.</p>
            <p>A special edition unique high-quality multimedia package:</p>`
          },
          {
            language_id: spanishLang.id,
            title: 'El Proyecto',
            subtitle: '',
            content: `<p>Berta Rojas presenta La Huella de las Cuerdas, un proyecto que rastrea el impacto cultural de la guitarra en América Latina e ilumina los lazos que la unen de tantas maneras a la gran familia de instrumentos de cuerda en las Américas.</p>
            <p>Un paquete multimedia especial de alta calidad único:</p>`
          }
        ]
      },
      {
        section_key: 'book_introduction',
        contents: [
          {
            language_id: englishLang.id,
            title: 'About the Book',
            subtitle: '',
            content: `<p>This comprehensive volume documents the extraordinary journey across Latin America, capturing the essence of traditional stringed instruments and the master musicians who keep these traditions alive.</p>
            <p>Through stunning photography and detailed cultural analysis, the book reveals the deep connections between different musical traditions across the Americas, showing how the guitar serves as both a bridge and a distinctive voice in each culture it encounters.</p>
            <p>Each chapter focuses on a specific instrument and region, providing historical context, technical details, and personal stories from the musicians who have dedicated their lives to preserving and evolving these musical traditions.</p>`
          },
          {
            language_id: spanishLang.id,
            title: 'Sobre el Libro',
            subtitle: '',
            content: `<p>Este volumen integral documenta el extraordinario viaje a través de América Latina, capturando la esencia de los instrumentos de cuerda tradicionales y los músicos maestros que mantienen vivas estas tradiciones.</p>
            <p>A través de fotografías impresionantes y análisis culturales detallados, el libro revela las profundas conexiones entre las diferentes tradiciones musicales a través de las Américas, mostrando cómo la guitarra sirve tanto como puente como voz distintiva en cada cultura que encuentra.</p>
            <p>Cada capítulo se enfoca en un instrumento y región específicos, proporcionando contexto histórico, detalles técnicos e historias personales de los músicos que han dedicado sus vidas a preservar y hacer evolucionar estas tradiciones musicales.</p>`
          }
        ]
      }
    ];

    // Insertar contenido de secciones
    for (const section of sectionsContent) {
      const { data: existingSection } = await supabase
        .from('about_sections')
        .select('id')
        .eq('section_key', section.section_key)
        .single();

      if (existingSection) {
        // Insertar contenidos para cada idioma
        for (const content of section.contents) {
          const { error: contentError } = await supabase
            .from('about_section_contents')
            .upsert({
              about_section_id: existingSection.id,
              language_id: content.language_id,
              title: content.title,
              subtitle: content.subtitle || null,
              content: content.content
            });

          if (contentError) {
            console.error('Error inserting section content:', contentError);
          }
        }
      }
    }

    // Inicializar contenido de tarjetas de características
    const featureCardsContent = [
      {
        card_key: 'book',
        contents: [
          {
            language_id: englishLang.id,
            title: 'BOOK',
            description: 'An in-depth study of each instrument and its traditions. Fascinating stories and large-format photos documenting the journey and Berta\'s encounters with the musicians at the centre of the project.'
          },
          {
            language_id: spanishLang.id,
            title: 'LIBRO',
            description: 'Un estudio profundo de cada instrumento y sus tradiciones. Historias fascinantes y fotos de gran formato que documentan el viaje y los encuentros de Berta con los músicos en el centro del proyecto.'
          }
        ]
      },
      {
        card_key: 'vinyl',
        contents: [
          {
            language_id: englishLang.id,
            title: 'VINYL',
            description: 'Excellent quality 180 gram vinyl audio; ten tracks that build and accompany an adventure in sound.'
          },
          {
            language_id: spanishLang.id,
            title: 'VINILO',
            description: 'Audio en vinilo de excelente calidad de 180 gramos; diez pistas que construyen y acompañan una aventura en sonido.'
          }
        ]
      },
      {
        card_key: 'augmented_reality',
        contents: [
          {
            language_id: englishLang.id,
            title: 'AUGMENTED REALITY',
            description: 'Download the free La Huella de las Cuerdas app to your smartphone or tablet. Point the camera at the photos in the book and open up a new world of digital content to enhance your experience.'
          },
          {
            language_id: spanishLang.id,
            title: 'REALIDAD AUMENTADA',
            description: 'Descarga la aplicación gratuita La Huella de las Cuerdas en tu smartphone o tablet. Apunta la cámara a las fotos del libro y abre un nuevo mundo de contenido digital para mejorar tu experiencia.'
          }
        ]
      }
    ];

    // Insertar contenido de tarjetas
    for (const card of featureCardsContent) {
      const { data: existingCard } = await supabase
        .from('about_feature_cards')
        .select('id')
        .eq('card_key', card.card_key)
        .single();

      if (existingCard) {
        for (const content of card.contents) {
          const { error: cardContentError } = await supabase
            .from('about_feature_card_contents')
            .upsert({
              feature_card_id: existingCard.id,
              language_id: content.language_id,
              title: content.title,
              description: content.description
            });

          if (cardContentError) {
            console.error('Error inserting card content:', cardContentError);
          }
        }
      }
    }

    // Inicializar contenido de estadísticas
    const statsContent = [
      {
        stat_key: 'instruments',
        contents: [
          {
            language_id: englishLang.id,
            label: 'Instruments',
            description: 'Traditional stringed instruments documented'
          },
          {
            language_id: spanishLang.id,
            label: 'Instrumentos',
            description: 'Instrumentos de cuerda tradicionales documentados'
          }
        ]
      },
      {
        stat_key: 'artists',
        contents: [
          {
            language_id: englishLang.id,
            label: 'Guest Artists',
            description: 'Master musicians featured in the project'
          },
          {
            language_id: spanishLang.id,
            label: 'Artistas Invitados',
            description: 'Músicos maestros presentados en el proyecto'
          }
        ]
      },
      {
        stat_key: 'countries',
        contents: [
          {
            language_id: englishLang.id,
            label: 'Countries Visited',
            description: 'Nations explored for this cultural journey'
          },
          {
            language_id: spanishLang.id,
            label: 'Países Visitados',
            description: 'Naciones exploradas para este viaje cultural'
          }
        ]
      }
    ];

    // Insertar contenido de estadísticas
    for (const stat of statsContent) {
      const { data: existingStat } = await supabase
        .from('about_project_stats')
        .select('id')
        .eq('stat_key', stat.stat_key)
        .single();

      if (existingStat) {
        for (const content of stat.contents) {
          const { error: statContentError } = await supabase
            .from('about_project_stat_contents')
            .upsert({
              project_stat_id: existingStat.id,
              language_id: content.language_id,
              label: content.label,
              description: content.description
            });

          if (statContentError) {
            console.error('Error inserting stat content:', statContentError);
          }
        }
      }
    }

    console.log('About content initialized successfully!');
  } catch (error) {
    console.error('Error initializing About content:', error);
  }
};

// Auto-ejecutar al importar este módulo
initializeAboutContent();
