
import { supabase } from "@/integrations/supabase/client";

export const initializeAboutContent = async () => {
  try {
    // Get language IDs
    const { data: languages } = await supabase
      .from('languages')
      .select('id, code');
    
    const englishLang = languages?.find(l => l.code === 'en');
    const spanishLang = languages?.find(l => l.code === 'es');
    
    if (!englishLang || !spanishLang) {
      console.error('Languages not found');
      return;
    }

    // Initialize section contents
    const sectionContents = [
      {
        section_key: 'hero',
        contents: [
          {
            language_id: englishLang.id,
            title: 'About the Project',
            subtitle: 'La Huella de las Cuerdas',
            content: 'A multimedia journey through the cultural heritage of Latin American stringed instruments'
          },
          {
            language_id: spanishLang.id,
            title: 'Sobre el Proyecto',
            subtitle: 'La Huella de las Cuerdas',
            content: 'Un viaje multimedia a través del patrimonio cultural de los instrumentos de cuerda latinoamericanos'
          }
        ]
      },
      {
        section_key: 'general_explanation',
        contents: [
          {
            language_id: englishLang.id,
            title: 'The Project',
            content: `<p>Berta Rojas presents La Huella de las Cuerdas, a project tracing the cultural impact of the guitar in Latin America and illuminating the ties that bind it in so many ways to the wider family of stringed instruments in the Americas.</p>
            <p>A special edition unique high-quality multimedia package:</p>`
          },
          {
            language_id: spanishLang.id,
            title: 'El Proyecto',
            content: `<p>Berta Rojas presenta La Huella de las Cuerdas, un proyecto que rastrea el impacto cultural de la guitarra en América Latina e ilumina los lazos que la unen de tantas maneras a la gran familia de instrumentos de cuerda de las Américas.</p>
            <p>Un paquete multimedia especial de alta calidad y edición única:</p>`
          }
        ]
      },
      {
        section_key: 'book_introduction',
        contents: [
          {
            language_id: englishLang.id,
            title: 'About the Book',
            content: `<p>This comprehensive study documents the rich traditions and stories behind each instrument featured in the project. Through fascinating narratives and stunning large-format photography, readers are taken on Berta's journey as she encounters the remarkable musicians who are the heart and soul of this cultural exploration.</p>
            
            <p>The book serves as both an educational resource and a visual celebration of the incredible diversity found within Latin American musical traditions. Each chapter delves deep into the history, construction, and cultural significance of the featured instruments, while also sharing personal stories from the master craftsmen and virtuoso performers who keep these traditions alive.</p>
            
            <p>From the intimate workshops of guitar makers to concert halls filled with the sounds of ancient melodies given new life, this book captures the essence of a musical heritage that spans generations and crosses borders throughout the Americas.</p>`
          },
          {
            language_id: spanishLang.id,
            title: 'Sobre el Libro',
            content: `<p>Este estudio integral documenta las ricas tradiciones e historias detrás de cada instrumento presentado en el proyecto. A través de narrativas fascinantes y fotografía impresionante de gran formato, los lectores son llevados en el viaje de Berta mientras se encuentra con los músicos extraordinarios que son el corazón y alma de esta exploración cultural.</p>
            
            <p>El libro sirve tanto como recurso educativo como celebración visual de la increíble diversidad encontrada dentro de las tradiciones musicales latinoamericanas. Cada capítulo profundiza en la historia, construcción y significado cultural de los instrumentos presentados, mientras también comparte historias personales de los maestros artesanos y virtuosos intérpretes que mantienen vivas estas tradiciones.</p>
            
            <p>Desde los talleres íntimos de los fabricantes de guitarras hasta las salas de concierto llenas con los sonidos de melodías ancestrales que cobran nueva vida, este libro captura la esencia de un patrimonio musical que abarca generaciones y cruza fronteras a través de las Américas.</p>`
          }
        ]
      }
    ];

    // Insert section contents
    for (const section of sectionContents) {
      // Get section ID
      const { data: sectionData } = await supabase
        .from('about_sections')
        .select('id')
        .eq('section_key', section.section_key)
        .single();
      
      if (sectionData) {
        for (const content of section.contents) {
          await supabase
            .from('about_section_contents')
            .upsert({
              about_section_id: sectionData.id,
              ...content
            });
        }
      }
    }

    // Initialize feature card contents
    const featureCardContents = [
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
            description: 'Un estudio profundo de cada instrumento y sus tradiciones. Historias fascinantes y fotos de gran formato documentando el viaje y los encuentros de Berta con los músicos en el centro del proyecto.'
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
            description: 'Audio de excelente calidad en vinilo de 180 gramos; diez pistas que construyen y acompañan una aventura en sonido.'
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

    // Insert feature card contents
    for (const card of featureCardContents) {
      // Get card ID
      const { data: cardData } = await supabase
        .from('about_feature_cards')
        .select('id')
        .eq('card_key', card.card_key)
        .single();
      
      if (cardData) {
        for (const content of card.contents) {
          await supabase
            .from('about_feature_card_contents')
            .upsert({
              feature_card_id: cardData.id,
              ...content
            });
        }
      }
    }

    // Initialize project stats contents
    const projectStatsContents = [
      {
        stat_key: 'instruments',
        contents: [
          {
            language_id: englishLang.id,
            label: 'Instruments',
            description: 'Different stringed instruments represented'
          },
          {
            language_id: spanishLang.id,
            label: 'Instrumentos',
            description: 'Diferentes instrumentos de cuerda representados'
          }
        ]
      },
      {
        stat_key: 'artists',
        contents: [
          {
            language_id: englishLang.id,
            label: 'Guest Artists',
            description: 'Talented musicians who collaborated'
          },
          {
            language_id: spanishLang.id,
            label: 'Artistas Invitados',
            description: 'Músicos talentosos que colaboraron'
          }
        ]
      },
      {
        stat_key: 'countries',
        contents: [
          {
            language_id: englishLang.id,
            label: 'Countries Visited',
            description: 'Nations explored for production'
          },
          {
            language_id: spanishLang.id,
            label: 'Países Visitados',
            description: 'Naciones exploradas para la producción'
          }
        ]
      }
    ];

    // Insert project stats contents
    for (const stat of projectStatsContents) {
      // Get stat ID
      const { data: statData } = await supabase
        .from('about_project_stats')
        .select('id')
        .eq('stat_key', stat.stat_key)
        .single();
      
      if (statData) {
        for (const content of stat.contents) {
          await supabase
            .from('about_project_stat_contents')
            .upsert({
              project_stat_id: statData.id,
              ...content
            });
        }
      }
    }

    console.log('About content initialized successfully');
  } catch (error) {
    console.error('Error initializing about content:', error);
  }
};
