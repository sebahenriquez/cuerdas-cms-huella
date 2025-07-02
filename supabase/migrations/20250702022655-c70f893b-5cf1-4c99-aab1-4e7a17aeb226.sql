-- Insert demo content for the website

-- First, ensure we have languages
INSERT INTO languages (id, code, name, is_default) VALUES 
(1, 'es', 'Español', true),
(2, 'en', 'English', false)
ON CONFLICT (id) DO UPDATE SET 
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  is_default = EXCLUDED.is_default;

-- Create demo pages
INSERT INTO pages (id, slug, template_type, status) VALUES 
(1, 'home', 'home', 'published'),
(2, 'recorre-la-huella', 'tracks', 'published'),
(3, 'escucha-la-huella', 'album', 'published'),
(4, 'sobre-el-proyecto', 'about', 'published'),
(5, 'contacto', 'contact', 'published')
ON CONFLICT (id) DO UPDATE SET 
  slug = EXCLUDED.slug,
  template_type = EXCLUDED.template_type,
  status = EXCLUDED.status;

-- Create page contents in Spanish
INSERT INTO page_contents (page_id, language_id, title, content, hero_image_url, meta_description) VALUES 
(1, 1, 'La Huella de las Cuerdas', 
 '<p>Un viaje musical único por la historia y tradición de los instrumentos de cuerda en América Latina. Descubre las raíces culturales que conectan nuestros pueblos a través de la música.</p><p>Este proyecto documenta la evolución y el impacto de los instrumentos de cuerda en la identidad musical latinoamericana, desde sus orígenes hasta la actualidad.</p>', 
 'https://i.ibb.co/Psq17ZKw/Cover.jpg',
 'Explora la rica tradición musical de América Latina a través de sus instrumentos de cuerda'),

(2, 1, 'Recorre la Huella', 
 '<p>Sumérgete en un recorrido interactivo por los diferentes tracks que componen este álbum musical. Cada pieza cuenta una historia única sobre los instrumentos de cuerda y su influencia en la cultura latinoamericana.</p><p>Descubre las conexiones históricas, las técnicas tradicionales y la evolución contemporánea de estos instrumentos emblemáticos.</p>', 
 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
 'Recorre los tracks musicales que narran la historia de los instrumentos de cuerda'),

(3, 1, 'Escucha la Huella', 
 '<p>Experimenta el álbum completo "La Huella de las Cuerdas" en una experiencia de escucha inmersiva. Cada composición ha sido cuidadosamente creada para capturar la esencia de los instrumentos de cuerda latinoamericanos.</p><p>Disponible en todas las plataformas digitales para que puedas llevar esta experiencia musical contigo.</p>', 
 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73',
 'Escucha el álbum completo La Huella de las Cuerdas'),

(4, 1, 'Sobre el Proyecto', 
 '<p>La Huella de las Cuerdas es un proyecto cultural que busca preservar y difundir el patrimonio musical de América Latina, específicamente el legado de los instrumentos de cuerda.</p><p>A través de investigación, documentación musical y producciones audiovisuales, este proyecto conecta tradiciones ancestrales con expresiones contemporáneas, creando puentes entre generaciones y culturas.</p><p>Nuestro equipo está compuesto por musicólogos, artistas, productores e investigadores comprometidos con la preservación del patrimonio cultural latinoamericano.</p>', 
 'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
 'Conoce más sobre el proyecto La Huella de las Cuerdas'),

(5, 1, 'Contacto', 
 '<p>¿Tienes preguntas sobre el proyecto? ¿Te interesa colaborar o obtener más información? Nos encantaría escuchar de ti.</p><p>Ponte en contacto con nuestro equipo para consultas sobre el proyecto, colaboraciones académicas, presentaciones o cualquier otro tema relacionado con La Huella de las Cuerdas.</p>', 
 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a',
 'Contacta con el equipo de La Huella de las Cuerdas')
ON CONFLICT (page_id, language_id) DO UPDATE SET 
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  hero_image_url = EXCLUDED.hero_image_url,
  meta_description = EXCLUDED.meta_description;

-- Create page contents in English
INSERT INTO page_contents (page_id, language_id, title, content, hero_image_url, meta_description) VALUES 
(1, 2, 'The Trail of Strings', 
 '<p>A unique musical journey through the history and tradition of string instruments in Latin America. Discover the cultural roots that connect our peoples through music.</p><p>This project documents the evolution and impact of string instruments on Latin American musical identity, from their origins to the present day.</p>', 
 'https://i.ibb.co/Psq17ZKw/Cover.jpg',
 'Explore the rich musical tradition of Latin America through its string instruments'),

(2, 2, 'Follow the Trail', 
 '<p>Immerse yourself in an interactive journey through the different tracks that make up this musical album. Each piece tells a unique story about string instruments and their influence on Latin American culture.</p><p>Discover the historical connections, traditional techniques, and contemporary evolution of these emblematic instruments.</p>', 
 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
 'Follow the musical tracks that narrate the history of string instruments'),

(3, 2, 'Listen to the Trail', 
 '<p>Experience the complete album "The Trail of Strings" in an immersive listening experience. Each composition has been carefully created to capture the essence of Latin American string instruments.</p><p>Available on all digital platforms so you can take this musical experience with you.</p>', 
 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73',
 'Listen to the complete album The Trail of Strings'),

(4, 2, 'About the Project', 
 '<p>The Trail of Strings is a cultural project that seeks to preserve and disseminate the musical heritage of Latin America, specifically the legacy of string instruments.</p><p>Through research, musical documentation and audiovisual productions, this project connects ancestral traditions with contemporary expressions, creating bridges between generations and cultures.</p><p>Our team is composed of musicologists, artists, producers and researchers committed to preserving Latin American cultural heritage.</p>', 
 'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
 'Learn more about The Trail of Strings project'),

(5, 2, 'Contact', 
 '<p>Do you have questions about the project? Are you interested in collaborating or getting more information? We would love to hear from you.</p><p>Contact our team for inquiries about the project, academic collaborations, presentations or any other topic related to The Trail of Strings.</p>', 
 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a',
 'Contact The Trail of Strings team')
ON CONFLICT (page_id, language_id) DO UPDATE SET 
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  hero_image_url = EXCLUDED.hero_image_url,
  meta_description = EXCLUDED.meta_description;

-- Create demo tracks
INSERT INTO tracks (id, order_position, audio_url, status) VALUES 
(1, 1, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'published'),
(2, 2, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'published'),
(3, 3, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'published'),
(4, 4, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'published'),
(5, 5, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'published')
ON CONFLICT (id) DO UPDATE SET 
  order_position = EXCLUDED.order_position,
  audio_url = EXCLUDED.audio_url,
  status = EXCLUDED.status;

-- Create track contents in Spanish
INSERT INTO track_contents (track_id, language_id, title, menu_title, description, long_text_content, hero_image_url) VALUES 
(1, 1, 'Orígenes Ancestrales', 'Orígenes', 
 'El nacimiento de los instrumentos de cuerda en las culturas precolombinas', 
 '<p>Este primer track nos transporta a los orígenes más remotos de los instrumentos de cuerda en América Latina. Exploramos cómo las civilizaciones precolombinas desarrollaron sus primeros instrumentos musicales utilizando materiales naturales disponibles en su entorno.</p><p>La música era considerada un lenguaje sagrado que conectaba el mundo terrenal con el espiritual. Los instrumentos de cuerda primitivos, hechos con fibras vegetales y cueros de animales, fueron los precursores de lo que hoy conocemos como la rica tradición musical latinoamericana.</p><p>A través de investigaciones arqueológicas y testimonios de las culturas que han preservado estas tradiciones, podemos entender cómo la música era parte integral de la vida cotidiana, los rituales religiosos y las celebraciones comunitarias.</p>', 
 'https://images.unsplash.com/photo-1578662996442-48f60103fc96'),

(2, 1, 'Encuentro de Culturas', 'Encuentro', 
 'La fusión musical durante la época colonial', 
 '<p>El segundo track documenta el momento histórico en que las tradiciones musicales indígenas se encontraron con los instrumentos traídos por los colonizadores europeos. Este encuentro, aunque marcado por el conflicto, también generó una síntesis musical única.</p><p>Los instrumentos de cuerda europeos como guitarras y violines se adaptaron a las escalas y ritmos autóctonos, mientras que los músicos indígenas incorporaron nuevas técnicas de construcción y ejecución. Este proceso de mestizaje musical dio origen a instrumentos híbridos y estilos únicos que caracterizan la música latinoamericana.</p><p>Las misiones religiosas jugaron un papel fundamental en este proceso, sirviendo como espacios donde se preservaron y transformaron las tradiciones musicales de ambas culturas.</p>', 
 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'),

(3, 1, 'Tradiciones Populares', 'Tradiciones', 
 'Los instrumentos de cuerda en la música folklórica', 
 '<p>En este tercer track nos sumergimos en el corazón de las tradiciones populares latinoamericanas, donde los instrumentos de cuerda han encontrado su expresión más auténtica y diversa.</p><p>Desde el charango andino hasta el cuatro venezolano, pasando por la guitarra criolla argentina y el tres cubano, cada región ha desarrollado sus propios instrumentos y estilos interpretativos. Estos instrumentos no solo son herramientas musicales, sino símbolos de identidad cultural y resistencia.</p><p>Las ferias, festivales y celebraciones populares han sido los espacios donde estos instrumentos han evolucionado y se han transmitido de generación en generación, manteniendo viva la tradición oral y musical de nuestros pueblos.</p>', 
 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'),

(4, 1, 'Innovación y Modernidad', 'Innovación', 
 'La evolución contemporánea de los instrumentos tradicionales', 
 '<p>El cuarto track explora cómo los instrumentos de cuerda tradicionales han evolucionado en el contexto de la música contemporánea. Los luthiers modernos han innovado tanto en materiales como en técnicas de construcción, creando instrumentos que mantienen la esencia tradicional pero incorporan mejoras técnicas.</p><p>La fusión con géneros musicales modernos ha llevado a estos instrumentos a escenarios internacionales, donde músicos contemporáneos los han incorporado en producciones de world music, jazz latino y rock alternativo.</p><p>Las nuevas tecnologías también han impactado en la construcción y amplificación de estos instrumentos, permitiendo que su sonido llegue a audiencias globales sin perder su carácter auténtico.</p>', 
 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73'),

(5, 1, 'Legado y Futuro', 'Legado', 
 'Preservación y proyección de la tradición musical', 
 '<p>Este último track reflexiona sobre la importancia de preservar el legado de los instrumentos de cuerda latinoamericanos para las futuras generaciones. Las escuelas de música, los talleres de lutería y los proyectos de investigación musical son fundamentales para mantener viva esta tradición.</p><p>Los jóvenes músicos están redescubriendo estos instrumentos y creando nuevas expresiones artísticas que respetan la tradición mientras exploran nuevas posibilidades sonoras. El futuro de estos instrumentos depende de nuestra capacidad de transmitir tanto las técnicas tradicionales como el significado cultural que representan.</p><p>Este proyecto es parte de ese esfuerzo colectivo por documentar, preservar y difundir la riqueza musical de América Latina, asegurando que las futuras generaciones puedan continuar esta hermosa tradición.</p>', 
 'https://images.unsplash.com/photo-1516280440614-37939bbacd81')
ON CONFLICT (track_id, language_id) DO UPDATE SET 
  title = EXCLUDED.title,
  menu_title = EXCLUDED.menu_title,
  description = EXCLUDED.description,
  long_text_content = EXCLUDED.long_text_content,
  hero_image_url = EXCLUDED.hero_image_url;

-- Create track contents in English
INSERT INTO track_contents (track_id, language_id, title, menu_title, description, long_text_content, hero_image_url) VALUES 
(1, 2, 'Ancestral Origins', 'Origins', 
 'The birth of string instruments in pre-Columbian cultures', 
 '<p>This first track transports us to the most remote origins of string instruments in Latin America. We explore how pre-Columbian civilizations developed their first musical instruments using natural materials available in their environment.</p><p>Music was considered a sacred language that connected the earthly world with the spiritual one. Primitive string instruments, made with plant fibers and animal skins, were the precursors of what we know today as the rich Latin American musical tradition.</p><p>Through archaeological research and testimonies from cultures that have preserved these traditions, we can understand how music was an integral part of daily life, religious rituals, and community celebrations.</p>', 
 'https://images.unsplash.com/photo-1578662996442-48f60103fc96'),

(2, 2, 'Cultural Encounter', 'Encounter', 
 'Musical fusion during the colonial period', 
 '<p>The second track documents the historical moment when indigenous musical traditions met the instruments brought by European colonizers. This encounter, although marked by conflict, also generated a unique musical synthesis.</p><p>European string instruments like guitars and violins adapted to indigenous scales and rhythms, while indigenous musicians incorporated new construction and performance techniques. This process of musical mestizaje gave rise to hybrid instruments and unique styles that characterize Latin American music.</p><p>Religious missions played a fundamental role in this process, serving as spaces where musical traditions from both cultures were preserved and transformed.</p>', 
 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'),

(3, 2, 'Popular Traditions', 'Traditions', 
 'String instruments in folk music', 
 '<p>In this third track we immerse ourselves in the heart of Latin American popular traditions, where string instruments have found their most authentic and diverse expression.</p><p>From the Andean charango to the Venezuelan cuatro, through the Argentine criolla guitar and the Cuban tres, each region has developed its own instruments and interpretive styles. These instruments are not only musical tools, but symbols of cultural identity and resistance.</p><p>Fairs, festivals and popular celebrations have been the spaces where these instruments have evolved and been transmitted from generation to generation, keeping alive the oral and musical tradition of our peoples.</p>', 
 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'),

(4, 2, 'Innovation and Modernity', 'Innovation', 
 'Contemporary evolution of traditional instruments', 
 '<p>The fourth track explores how traditional string instruments have evolved in the context of contemporary music. Modern luthiers have innovated in both materials and construction techniques, creating instruments that maintain traditional essence but incorporate technical improvements.</p><p>Fusion with modern musical genres has brought these instruments to international stages, where contemporary musicians have incorporated them in world music, Latin jazz and alternative rock productions.</p><p>New technologies have also impacted the construction and amplification of these instruments, allowing their sound to reach global audiences without losing their authentic character.</p>', 
 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73'),

(5, 2, 'Legacy and Future', 'Legacy', 
 'Preservation and projection of musical tradition', 
 '<p>This last track reflects on the importance of preserving the legacy of Latin American string instruments for future generations. Music schools, luthiery workshops and musical research projects are fundamental to keeping this tradition alive.</p><p>Young musicians are rediscovering these instruments and creating new artistic expressions that respect tradition while exploring new sonic possibilities. The future of these instruments depends on our ability to transmit both traditional techniques and the cultural meaning they represent.</p><p>This project is part of that collective effort to document, preserve and disseminate the musical richness of Latin America, ensuring that future generations can continue this beautiful tradition.</p>', 
 'https://images.unsplash.com/photo-1516280440614-37939bbacd81')
ON CONFLICT (track_id, language_id) DO UPDATE SET 
  title = EXCLUDED.title,
  menu_title = EXCLUDED.menu_title,
  description = EXCLUDED.description,
  long_text_content = EXCLUDED.long_text_content,
  hero_image_url = EXCLUDED.hero_image_url;