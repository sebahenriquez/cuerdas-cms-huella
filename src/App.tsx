import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { CMSAuthProvider } from './contexts/CMSContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { Toaster } from '@/components/ui/toaster';

// Public Pages
import Index from './pages/Index';
import SobreElProyecto from './pages/SobreElProyecto';
import FichaTecnica from './pages/FichaTecnica';
import EscuchaLaHuella from './pages/EscuchaLaHuella';
import RecorreLaHuella from './pages/RecorreLaHuella';
import Prensa from './pages/Prensa';
import Contacto from './pages/Contacto';
import TrackDetail from './pages/TrackDetail';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

// Admin Pages
import CMSLogin from './pages/admin/CMSLogin';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPages from './pages/admin/AdminPages';
import AdminPageNew from './pages/admin/AdminPageNew';
import AdminPageEdit from './pages/admin/AdminPageEdit';
import AdminTracks from './pages/admin/AdminTracks';
import AdminTrackEdit from './pages/admin/AdminTrackEdit';
import AdminVideos from './pages/admin/AdminVideos';
import AdminVideoEdit from './pages/admin/AdminVideoEdit';
import AdminMedia from './pages/admin/AdminMedia';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLanguages from './pages/admin/AdminLanguages';
import AdminLanguageEdit from './pages/admin/AdminLanguageEdit';
import AdminSettings from './pages/admin/AdminSettings';
import AdminTemplates from './pages/admin/AdminTemplates';

function App() {
  return (
    <Router>
      <QueryClient>
        <CMSAuthProvider>
          <LanguageProvider>
            <AudioPlayerProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="sobre-el-proyecto" element={<SobreElProyecto />} />
                  <Route path="ficha-tecnica" element={<FichaTecnica />} />
                  <Route path="escucha-la-huella" element={<EscuchaLaHuella />} />
                  <Route path="recorre-la-huella" element={<RecorreLaHuella />} />
                  <Route path="prensa" element={<Prensa />} />
                  <Route path="contacto" element={<Contacto />} />
                  <Route path="track/:trackId" element={<TrackDetail />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin/login" element={<CMSLogin />} />
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="pages/new" element={<AdminPageNew />} />
                  <Route path="pages/:id/edit" element={<AdminPageEdit />} />
                  <Route path="tracks" element={<AdminTracks />} />
                  <Route path="tracks/new" element={<AdminTrackEdit />} />
                  <Route path="tracks/:id/edit" element={<AdminTrackEdit />} />
                  <Route path="videos" element={<AdminVideos />} />
                  <Route path="videos/new" element={<AdminVideoEdit />} />
                  <Route path="videos/:id/edit" element={<AdminVideoEdit />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="languages" element={<AdminLanguages />} />
                  <Route path="languages/new" element={<AdminLanguageEdit />} />
                  <Route path="languages/:id/edit" element={<AdminLanguageEdit />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="templates" element={<AdminTemplates />} />
                </Route>

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </AudioPlayerProvider>
          </LanguageProvider>
        </CMSAuthProvider>
      </QueryClient>
    </Router>
  );
}

export default App;
