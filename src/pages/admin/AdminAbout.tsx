
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, BarChart3, CreditCard, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllAboutSections, getAllAboutFeatureCards, getAllAboutProjectStats } from '@/lib/about-helpers';

const AdminAbout: React.FC = () => {
  const navigate = useNavigate();

  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ['admin-about-sections'],
    queryFn: getAllAboutSections
  });

  const { data: featureCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['admin-about-feature-cards'],
    queryFn: getAllAboutFeatureCards
  });

  const { data: projectStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['admin-about-project-stats'],
    queryFn: getAllAboutProjectStats
  });

  if (sectionsLoading || cardsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Página About</h1>
          <p className="text-muted-foreground">
            Administra el contenido de la página Sobre el Proyecto
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sections Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Secciones de Contenido</span>
            </CardTitle>
            <CardDescription>
              Gestiona las secciones principales de la página About
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sections.map((section: any) => (
                <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{section.section_key}</h4>
                    <p className="text-sm text-muted-foreground">
                      {section.about_section_contents?.length || 0} idioma(s)
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/about/sections/${section.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Tarjetas de Características</span>
            </CardTitle>
            <CardDescription>
              Gestiona las tarjetas con íconos (Book, Vinyl, AR)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {featureCards.map((card: any) => (
                <div key={card.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{card.card_key}</h4>
                    <p className="text-sm text-muted-foreground">
                      {card.about_feature_card_contents?.length || 0} idioma(s)
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/about/cards/${card.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => navigate('/admin/about/cards/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarjeta
            </Button>
          </CardContent>
        </Card>

        {/* Project Stats Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Estadísticas del Proyecto</span>
            </CardTitle>
            <CardDescription>
              Gestiona las cifras clave del proyecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectStats.map((stat: any) => (
                <div key={stat.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{stat.stat_key}</h4>
                    <p className="text-sm text-muted-foreground">
                      Valor: {stat.number_value}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/about/stats/${stat.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => navigate('/admin/about/stats/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Estadística
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos para gestionar el contenido de About
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/about/sections/1')}
            >
              Editar Hero Section
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/about/sections/2')}
            >
              Editar Explicación General
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/about/sections/4')}
            >
              Editar Introducción del Libro
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/sobre-el-proyecto', '_blank')}
            >
              Ver Página Pública
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAbout;
