
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CMSAuthProvider } from '@/contexts/CMSAuthContext';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { Toaster } from '@/components/ui/toaster';

// Import pages
import Index from '@/pages/Index';
import RecorreLaHuella from '@/pages/RecorreLaHuella';
import TrackDetail from '@/pages/TrackDetail';
import EscuchaLaHuella from '@/pages/EscuchaLaHuella';
import SobreElProyecto from '@/pages/SobreElProyecto';
import FichaTecnica from '@/pages/FichaTecnica';
import Prensa from '@/pages/Prensa';
import Contacto from '@/pages/Contacto';
import NotFound from '@/pages/NotFound';

// Import admin pages
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import CMSLogin from '@/components/admin/CMSLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminTracks from '@/pages/admin/AdminTracks';
import AdminTrackEdit from '@/pages/admin/AdminTrackEdit';
import AdminVideos from '@/pages/admin/AdminVideos';
import AdminVideoEdit from '@/pages/admin/AdminVideoEdit';
import AdminPages from '@/pages/admin/AdminPages';
import AdminPageEdit from '@/pages/admin/AdminPageEdit';
import AdminPageNew from '@/pages/admin/AdminPageNew';
import AdminMedia from '@/pages/admin/AdminMedia';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminLanguages from '@/pages/admin/AdminLanguages';
import AdminLanguageEdit from '@/pages/admin/AdminLanguageEdit';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminTemplates from '@/pages/admin/AdminTemplates';
import AdminCTAButtons from '@/pages/admin/AdminCTAButtons';
import AdminAbout from '@/pages/admin/AdminAbout';
import AdminAboutSectionEdit from '@/pages/admin/AdminAboutSectionEdit';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CMSAuthProvider>
        <LanguageProvider>
          <AudioPlayerProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/recorre-la-huella" element={<RecorreLaHuella />} />
                <Route path="/track/:id" element={<TrackDetail />} />
                <Route path="/escucha-la-huella" element={<EscuchaLaHuella />} />
                <Route path="/sobre-el-proyecto" element={<SobreElProyecto />} />
                <Route path="/ficha-tecnica" element={<FichaTecnica />} />
                <Route path="/prensa" element={<Prensa />} />
                <Route path="/contacto" element={<Contacto />} />

                {/* Admin routes */}
                <Route path="/admin/login" element={<CMSLogin />} />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="tracks" element={<AdminTracks />} />
                  <Route path="tracks/:id" element={<AdminTrackEdit />} />
                  <Route path="videos" element={<AdminVideos />} />
                  <Route path="videos/:id" element={<AdminVideoEdit />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="pages/:id" element={<AdminPageEdit />} />
                  <Route path="pages/new" element={<AdminPageNew />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="languages" element={<AdminLanguages />} />
                  <Route path="languages/:id" element={<AdminLanguageEdit />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="templates" element={<AdminTemplates />} />
                  <Route path="cta-buttons" element={<AdminCTAButtons />} />
                  <Route path="about" element={<AdminAbout />} />
                  <Route path="about/sections/:id" element={<AdminAboutSectionEdit />} />
                </Route>

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </AudioPlayerProvider>
        </LanguageProvider>
      </CMSAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
