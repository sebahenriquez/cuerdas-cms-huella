
import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Music, 
  Video, 
  FileText, 
  Upload, 
  Users, 
  Languages, 
  Settings, 
  Layout,
  MousePointer,
  Info,
  Download
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Music, label: 'Tracks', path: '/admin/tracks' },
    { icon: Video, label: 'Videos', path: '/admin/videos' },
    { icon: FileText, label: 'Pages', path: '/admin/pages' },
    { icon: Info, label: 'About Page', path: '/admin/about' },
    { icon: Download, label: 'Press Kit', path: '/admin/press-kit' },
    { icon: Upload, label: 'Media', path: '/admin/media' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Languages, label: 'Languages', path: '/admin/languages' },
    { icon: MousePointer, label: 'CTA Buttons', path: '/admin/cta-buttons' },
    { icon: Layout, label: 'Templates', path: '/admin/templates' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">CMS Admin</h1>
        </div>
        
        <nav className="mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                isActiveRoute(item.path) ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
