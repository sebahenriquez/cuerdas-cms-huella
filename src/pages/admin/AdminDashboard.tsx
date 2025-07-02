import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Music, 
  Video, 
  Image, 
  BarChart3, 
  Users,
  Globe,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard: React.FC = () => {
  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [pagesResult, tracksResult, videosResult, mediaResult] = await Promise.all([
        supabase.from('pages').select('id', { count: 'exact' }),
        supabase.from('tracks').select('id', { count: 'exact' }),
        supabase.from('videos').select('id', { count: 'exact' }),
        supabase.from('media_files').select('id', { count: 'exact' })
      ]);

      return {
        pages: pagesResult.count || 0,
        tracks: tracksResult.count || 0,
        videos: videosResult.count || 0,
        media: mediaResult.count || 0
      };
    }
  });

  const quickActions = [
    {
      title: 'Nueva Página',
      description: 'Crear una nueva página del sitio',
      href: '/admin/pages/new',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Editar Track',
      description: 'Modificar contenido de tracks',
      href: '/admin/tracks',
      icon: Music,
      color: 'bg-green-500'
    },
    {
      title: 'Subir Media',
      description: 'Gestionar archivos multimedia',
      href: '/admin/media',
      icon: Image,
      color: 'bg-purple-500'
    },
    {
      title: 'Configuración',
      description: 'Ajustar tema y configuración',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-orange-500'
    }
  ];

  const statsCards = [
    {
      title: 'Páginas',
      value: stats?.pages || 0,
      icon: FileText,
      description: 'Páginas publicadas'
    },
    {
      title: 'Tracks',
      value: stats?.tracks || 0,
      icon: Music,
      description: 'Tracks del álbum'
    },
    {
      title: 'Videos',
      value: stats?.videos || 0,
      icon: Video,
      description: 'Videos publicados'
    },
    {
      title: 'Media',
      value: stats?.media || 0,
      icon: Image,
      description: 'Archivos multimedia'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Panel de control del CMS - La Huella de las Cuerdas
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to={action.href}>Ir a {action.title}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Estado del Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Base de datos</span>
              <span className="text-sm text-green-600 font-medium">Conectada</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Almacenamiento</span>
              <span className="text-sm text-green-600 font-medium">Disponible</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sistema</span>
              <span className="text-sm text-green-600 font-medium">Operativo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;