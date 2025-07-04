
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageBySlug, getCTAButtons } from '@/lib/supabase-helpers';

const Index = () => {
  const { currentLanguage } = useLanguage();

  const { data: homeData, isLoading } = useQuery({
    queryKey: ['page', 'home', currentLanguage?.id],
    queryFn: () => currentLanguage ? getPageBySlug('home', currentLanguage.id) : null,
    enabled: !!currentLanguage,
  });

  const { data: ctaButtons } = useQuery({
    queryKey: ['cta-buttons', currentLanguage?.id],
    queryFn: () => currentLanguage ? getCTAButtons(currentLanguage.id) : null,
    enabled: !!currentLanguage,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-lg">Cargando...</div>
        </div>
      </Layout>
    );
  }

  const pageContent = homeData?.page_contents?.[0];
  
  // Get CTA button texts
  const exploreButtonText = ctaButtons?.find(b => b.key === 'explore_trail')?.cta_button_contents?.[0]?.text || 'Recorré la Huella';
  const listenButtonText = ctaButtons?.find(b => b.key === 'listen_album')?.cta_button_contents?.[0]?.text || 'Escuchar el Álbum';

  return (
    <Layout showAudioPlayer={true}>
      {/* Hero Section */}
      <section 
        className="hero-section"
        style={{
          backgroundImage: `url(${pageContent?.hero_image_url || 'https://i.ibb.co/Psq17ZKw/Cover.jpg'})`
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {pageContent?.title || 'La Huella de las Cuerdas'}
          </h1>
          <div 
            className="text-xl md:text-2xl mb-8 w-full max-w-[90%] mx-auto animate-fade-in"
            dangerouslySetInnerHTML={{ 
              __html: pageContent?.content || '<p>Un viaje musical por la historia de los instrumentos de cuerda en América Latina...</p>'
            }}
          />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/recorre-la-huella">
              <Button className="btn-hero">
                {exploreButtonText}
              </Button>
            </Link>
            <Link to="/escucha-la-huella">
              <Button className="btn-secondary-hero">
                {listenButtonText}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
