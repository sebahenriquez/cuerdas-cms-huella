import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Music, 
  Video, 
  Image, 
  Settings, 
  Users, 
  LogOut,
  Globe,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCMSAuth } from '@/contexts/CMSAuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useCMSAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Páginas', href: '/admin/pages', icon: FileText },
    { name: 'Tracks', href: '/admin/tracks', icon: Music },
    { name: 'Videos', href: '/admin/videos', icon: Video },
    { name: 'Media', href: '/admin/media', icon: Image },
    { name: 'Plantillas', href: '/admin/templates', icon: Code },
    { name: 'Idiomas', href: '/admin/languages', icon: Globe },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">
            CMS Admin
          </h2>
          <p className="text-sm text-muted-foreground">
            La Huella de las Cuerdas
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActiveRoute(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">
              Conectado como:
            </p>
            <p className="text-sm font-medium truncate">
              {user?.email}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full mt-2 justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;