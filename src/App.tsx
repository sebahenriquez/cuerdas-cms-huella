import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CMSAuthProvider } from "@/contexts/CMSAuthContext";

import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import RecorreLaHuella from "./pages/RecorreLaHuella";
import EscuchaLaHuella from "./pages/EscuchaLaHuella";
import SobreElProyecto from "./pages/SobreElProyecto";
import Prensa from "./pages/Prensa";
import Fotos from "./pages/Fotos";
import FichaTecnica from "./pages/FichaTecnica";
import Contacto from "./pages/Contacto";
import TrackDetail from "./pages/TrackDetail";
import NotFound from "./pages/NotFound";

// Admin routes
import ProtectedRoute from "./components/admin/ProtectedRoute";
import CMSLogin from "./components/admin/CMSLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

// New admin pages
import NewAdminPages from "./pages/admin/NewAdminPages";
import NewAdminPageEdit from "./pages/admin/NewAdminPageEdit";
import NewAdminTracks from "./pages/admin/NewAdminTracks";
import NewAdminTrackEdit from "./pages/admin/NewAdminTrackEdit";

// Keep existing admin pages for other features
import AdminAbout from "./pages/admin/AdminAbout";
import AdminAboutSectionEdit from "./pages/admin/AdminAboutSectionEdit";
import AdminPressKit from "./pages/admin/AdminPressKit";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminVideoEdit from "./pages/admin/AdminVideoEdit";
import AdminTrackVideos from "./pages/admin/AdminTrackVideos";
import AdminTrackPhotos from "./pages/admin/AdminTrackPhotos";
import AdminGalleryPhotos from "./pages/admin/AdminGalleryPhotos";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLanguages from "./pages/admin/AdminLanguages";
import AdminLanguageEdit from "./pages/admin/AdminLanguageEdit";
import AdminCTAButtons from "./pages/admin/AdminCTAButtons";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

// Layout wrapper that provides children to Layout component
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CMSAuthProvider>
        <AudioPlayerProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LayoutWrapper />}>
                    <Route index element={<Index />} />
                    <Route path="recorre-la-huella" element={<RecorreLaHuella />} />
                    <Route path="escucha-la-huella" element={<EscuchaLaHuella />} />
                    <Route path="sobre-el-proyecto" element={<SobreElProyecto />} />
                    <Route path="prensa" element={<Prensa />} />
                    <Route path="fotos" element={<Fotos />} />
                    <Route path="ficha-tecnica" element={<FichaTecnica />} />
                    <Route path="contacto" element={<Contacto />} />
                    <Route path="track/:id" element={<TrackDetail />} />
                  </Route>

                  {/* Admin login */}
                  <Route path="/admin/login" element={<CMSLogin />} />

                  {/* Protected admin routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    
                    {/* New functional editors */}
                    <Route path="pages" element={<NewAdminPages />} />
                    <Route path="pages/new" element={<NewAdminPageEdit />} />
                    <Route path="pages/:id/edit" element={<NewAdminPageEdit />} />
                    
                    <Route path="tracks" element={<NewAdminTracks />} />
                    <Route path="tracks/new" element={<NewAdminTrackEdit />} />
                    <Route path="tracks/:id/edit" element={<NewAdminTrackEdit />} />
                    
                    {/* Existing admin routes */}
                    <Route path="about" element={<AdminAbout />} />
                    <Route path="about/:sectionKey/edit" element={<AdminAboutSectionEdit />} />
                    <Route path="press-kit" element={<AdminPressKit />} />
                    <Route path="videos" element={<AdminVideos />} />
                    <Route path="videos/new" element={<AdminVideoEdit />} />
                    <Route path="videos/:id/edit" element={<AdminVideoEdit />} />
                    <Route path="track-videos" element={<AdminTrackVideos />} />
                    <Route path="track-photos" element={<AdminTrackPhotos />} />
                    <Route path="gallery-photos" element={<AdminGalleryPhotos />} />
                    <Route path="media" element={<AdminMedia />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="languages" element={<AdminLanguages />} />
                    <Route path="languages/:id/edit" element={<AdminLanguageEdit />} />
                    <Route path="cta-buttons" element={<AdminCTAButtons />} />
                    <Route path="templates" element={<AdminTemplates />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </AudioPlayerProvider>
      </CMSAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
