import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageBySlug } from '@/lib/supabase-helpers';

const FichaTecnica = () => {
  const { currentLanguage } = useLanguage();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['page', 'ficha-tecnica', currentLanguage?.id],
    queryFn: () => currentLanguage ? getPageBySlug('ficha-tecnica', currentLanguage.id) : null,
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

  const pageContent = pageData?.page_contents?.[0];

  return (
    <Layout showAudioPlayer={true}>
      {/* Hero Section */}
      <section 
        className="hero-section"
        style={{
          backgroundImage: `url(${pageContent?.hero_image_url || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81'})`
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {pageContent?.title || 'Ficha Técnica'}
          </h1>
          <div 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in"
            dangerouslySetInnerHTML={{ 
              __html: pageContent?.content || '<p>Información técnica del álbum La Huella de las Cuerdas...</p>'
            }}
          />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: pageContent?.content || '<p>Información técnica del álbum.</p>'
              }}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FichaTecnica;