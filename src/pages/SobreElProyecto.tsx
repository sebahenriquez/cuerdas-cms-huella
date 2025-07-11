
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAboutSections, getAboutFeatureCards, getAboutProjectStats } from '@/lib/about-helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Book, Disc, Smartphone, Music, Users, Globe } from 'lucide-react';

const SobreElProyecto: React.FC = () => {
  const { currentLanguage } = useLanguage();

  const { data: sections = [] } = useQuery({
    queryKey: ['about-sections', currentLanguage?.id],
    queryFn: () => getAboutSections(currentLanguage?.id || 1),
    enabled: !!currentLanguage?.id
  });

  const { data: featureCards = [] } = useQuery({
    queryKey: ['about-feature-cards', currentLanguage?.id],
    queryFn: () => getAboutFeatureCards(currentLanguage?.id || 1),
    enabled: !!currentLanguage?.id
  });

  const { data: projectStats = [] } = useQuery({
    queryKey: ['about-project-stats', currentLanguage?.id],
    queryFn: () => getAboutProjectStats(currentLanguage?.id || 1),
    enabled: !!currentLanguage?.id
  });

  // Helper function to get section content by key
  const getSectionContent = (key: string) => {
    const section = sections.find(s => s.section_key === key);
    return section?.about_section_contents?.[0];
  };

  // Icon mapping for feature cards
  const getFeatureIcon = (iconName: string) => {
    const iconMap = {
      'book': Book,
      'vinyl': Disc,
      'smartphone': Smartphone,
      'disc': Disc
    };
    return iconMap[iconName as keyof typeof iconMap] || Book;
  };

  // Icon mapping for project stats
  const getStatIcon = (statKey: string) => {
    const iconMap = {
      'instruments': Music,
      'artists': Users,
      'countries': Globe
    };
    return iconMap[statKey as keyof typeof iconMap] || Music;
  };

  // Get content for different sections
  const heroContent = getSectionContent('hero');
  const generalContent = getSectionContent('general_explanation');
  const bookContent = getSectionContent('book_introduction');

  return (
    <Layout>
      {/* Full page background */}
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed relative"
        style={{
          backgroundImage: 'url(https://i.ibb.co/b5ZP5v2w/Huellas-27-05-201.jpg)'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Content container - Ajustado para no hacer scroll */}
        <div className="relative z-10 min-h-screen flex flex-col justify-center py-8">
          {/* Hero Section - Más compacto */}
          <section className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="max-w-6xl mx-auto text-center text-white">
              {/* Removido el título "About" */}
              {heroContent?.subtitle && (
                <p className="text-xl md:text-2xl mb-6 text-gray-200">
                  {heroContent.subtitle}
                </p>
              )}
              {heroContent?.content && (
                <div 
                  className="text-lg md:text-xl leading-relaxed text-gray-100 mb-8"
                  dangerouslySetInnerHTML={{ __html: heroContent.content }}
                />
              )}

              {/* General Explanation Section - Compacto y transparente */}
              <div className="mb-8">
                <Card className="bg-white/20 backdrop-blur-sm shadow-2xl border-white/30">
                  <CardContent className="p-6 md:p-8">
                    {generalContent?.title && (
                      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                        {generalContent.title}
                      </h2>
                    )}
                    <div className="prose prose-lg max-w-none text-white">
                      {generalContent?.content ? (
                        <div dangerouslySetInnerHTML={{ __html: generalContent.content }} />
                      ) : (
                        <div>
                          <p className="text-lg leading-relaxed mb-4">
                            Berta Rojas presents The Journey of Strings, a project tracing the cultural impact of the guitar in Latin America and illuminating the ties that bind it in so many ways to the wider family of stringed instruments in the Americas.
                          </p>
                          <p className="text-lg leading-relaxed mb-4">
                            A special edition unique high-quality multimedia package:
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feature Cards Section - Horizontal y compacto */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featureCards.length > 0 ? (
                    featureCards.map((card: any) => {
                      const IconComponent = getFeatureIcon(card.icon_name);
                      const content = card.about_feature_card_contents?.[0];
                      
                      return (
                        <Card key={card.id} className="bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-white/30">
                          <CardContent className="p-4 text-center">
                            <div className="mb-3">
                              <IconComponent className="h-10 w-10 mx-auto text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-white">
                              {content?.title || card.card_key.toUpperCase()}
                            </h3>
                            <p className="text-gray-200 leading-relaxed text-sm">
                              {content?.description || 'Content coming soon...'}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    // Default cards if no data
                    <>
                      <Card className="bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-white/30">
                        <CardContent className="p-4 text-center">
                          <div className="mb-3">
                            <Book className="h-10 w-10 mx-auto text-white" />
                          </div>
                          <h3 className="text-lg font-bold mb-2 text-white">BOOK</h3>
                          <p className="text-gray-200 leading-relaxed text-sm">
                            An in-depth study of each instrument and its traditions. Fascinating stories and large-format photos documenting the journey and Berta's encounters with the musicians at the centre of the project.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-white/30">
                        <CardContent className="p-4 text-center">
                          <div className="mb-3">
                            <Disc className="h-10 w-10 mx-auto text-white" />
                          </div>
                          <h3 className="text-lg font-bold mb-2 text-white">VINYL</h3>
                          <p className="text-gray-200 leading-relaxed text-sm">
                            Excellent quality 180 gram vinyl audio; ten tracks that build and accompany an adventure in sound.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-white/30">
                        <CardContent className="p-4 text-center">
                          <div className="mb-3">
                            <Smartphone className="h-10 w-10 mx-auto text-white" />
                          </div>
                          <h3 className="text-lg font-bold mb-2 text-white">AUGMENTED REALITY</h3>
                          <p className="text-gray-200 leading-relaxed text-sm">
                            Download the free La Huella de las Cuerdas app to your smartphone or tablet. Point the camera at the photos in the book and open up a new world of digital content to enhance your experience.
                          </p>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>

                {/* Additional text after cards */}
                <div className="mt-6">
                  <Card className="bg-white/20 backdrop-blur-sm shadow-2xl border-white/30">
                    <CardContent className="p-4">
                      <p className="text-lg text-white leading-relaxed">
                        {currentLanguage?.code === 'en' 
                          ? "This collection is the fruit of a journey through more than ten countries and Berta's collaboration with musicians who embody the cultural richness of America."
                          : "Esta colección es el fruto de un viaje por más de diez países y la colaboración de Berta con músicos que encarnan la riqueza cultural de América."
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Project Statistics Section */}
              <div className="mb-8">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {currentLanguage?.code === 'en' ? 'Project Stats' : 'Cifras del Proyecto'}
                  </h2>
                  <p className="text-lg text-gray-200">
                    {currentLanguage?.code === 'en' 
                      ? 'Key numbers that tell our story'
                      : 'Números clave que cuentan nuestra historia'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projectStats.length > 0 ? (
                    projectStats.map((stat: any) => {
                      const IconComponent = getStatIcon(stat.stat_key);
                      const content = stat.about_project_stat_contents?.[0];
                      
                      return (
                        <Card key={stat.id} className="bg-white/20 backdrop-blur-sm shadow-2xl border-white/30">
                          <CardContent className="p-4 text-center">
                            <div className="mb-2">
                              <IconComponent className="h-8 w-8 mx-auto text-white" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">
                              {stat.number_value}
                              {stat.stat_key === 'countries' && '+'}
                            </div>
                            <h3 className="text-lg font-semibold mb-1 text-white">
                              {content?.label || stat.stat_key}
                            </h3>
                            {content?.description && (
                              <p className="text-gray-200 text-sm">
                                {content.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    // Default stats if no data
                    <>
                      <Card className="bg-white/20 backdrop-blur-sm shadow-2xl border-white/30">
                        <CardContent className="p-4 text-center">
                          <div className="mb-2">
                            <Music className="h-8 w-8 mx-auto text-white" />
                          </div>
                          <div className="text-3xl font-bold text-white mb-1">14</div>
                          <h3 className="text-lg font-semibold text-white">
                            {currentLanguage?.code === 'en' ? 'Instruments' : 'Instrumentos'}
                          </h3>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/20 backdrop-blur-sm shadow-2xl border-white/30">
                        <CardContent className="p-4 text-center">
                          <div className="mb-2">
                            <Users className="h-8 w-8 mx-auto text-white" />
                          </div>
                          <div className="text-3xl font-bold text-white mb-1">17</div>
                          <h3 className="text-lg font-semibold text-white">
                            {currentLanguage?.code === 'en' ? 'Guest Artists' : 'Artistas Invitados'}
                          </h3>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/20 backdrop-blur-sm shadow-2xl border-white/30">
                        <CardContent className="p-4 text-center">
                          <div className="mb-2">
                            <Globe className="h-8 w-8 mx-auto text-white" />
                          </div>
                          <div className="text-3xl font-bold text-white mb-1">7+</div>
                          <h3 className="text-lg font-semibold text-white">
                            {currentLanguage?.code === 'en' ? 'Countries Visited' : 'Países Visitados'}
                          </h3>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>

              {/* Book Introduction Section - Más compacto */}
              {bookContent && (
                <div className="mb-4">
                  <Card className="bg-white/20 backdrop-blur-sm shadow-2xl border-white/30">
                    <CardContent className="p-4 md:p-6">
                      {bookContent.title && (
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                          {bookContent.title}
                        </h2>
                      )}
                      <div 
                        className="prose prose-lg max-w-none leading-relaxed text-white"
                        dangerouslySetInnerHTML={{ __html: bookContent.content }}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default SobreElProyecto;
