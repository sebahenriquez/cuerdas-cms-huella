import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageBySlug } from '@/lib/supabase-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Music, BookOpen, Globe } from 'lucide-react';

const SobreElProyecto = () => {
  const { currentLanguage } = useLanguage();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['page', 'sobre-el-proyecto', currentLanguage?.id],
    queryFn: () => currentLanguage ? getPageBySlug('sobre-el-proyecto', currentLanguage.id) : null,
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
    <Layout>
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
            {pageContent?.title || 'Sobre el Proyecto'}
          </h1>
          <div 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in"
            dangerouslySetInnerHTML={{ 
              __html: pageContent?.content || '<p>Conoce más sobre La Huella de las Cuerdas...</p>'
            }}
          />
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Misión Musical</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Preservar y difundir el patrimonio musical de América Latina, específicamente 
                  el legado de los instrumentos de cuerda, conectando tradiciones ancestrales 
                  con expresiones contemporáneas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Alcance Cultural</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Crear puentes entre generaciones y culturas, documentando la evolución 
                  de los instrumentos de cuerda desde sus orígenes precolombinos hasta 
                  la actualidad.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team Section */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Nuestro Equipo</span>
              </CardTitle>
              <CardDescription>
                Profesionales comprometidos con la preservación del patrimonio cultural
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Musicólogos</h4>
                    <p className="text-sm text-muted-foreground">
                      Especialistas en investigación musical y patrimonio cultural latinoamericano
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Artistas</h4>
                    <p className="text-sm text-muted-foreground">
                      Músicos profesionales expertos en instrumentos de cuerda tradicionales
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Productores</h4>
                    <p className="text-sm text-muted-foreground">
                      Especialistas en producción audiovisual y documentación cultural
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Investigadores</h4>
                    <p className="text-sm text-muted-foreground">
                      Académicos dedicados al estudio de la historia musical latinoamericana
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Methodology Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Metodología</span>
              </CardTitle>
              <CardDescription>
                Nuestro enfoque para documentar y preservar la tradición musical
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Investigación Histórica</Badge>
                  <Badge variant="secondary">Documentación Audiovisual</Badge>
                  <Badge variant="secondary">Entrevistas Etnográficas</Badge>
                  <Badge variant="secondary">Análisis Musical</Badge>
                  <Badge variant="secondary">Preservación Digital</Badge>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Fase 1</h4>
                    <p className="text-sm text-muted-foreground">
                      Investigación y recopilación de fuentes históricas
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Fase 2</h4>
                    <p className="text-sm text-muted-foreground">
                      Documentación audiovisual y entrevistas
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Fase 3</h4>
                    <p className="text-sm text-muted-foreground">
                      Producción musical y difusión cultural
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default SobreElProyecto;