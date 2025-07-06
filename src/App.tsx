
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { CMSAuthProvider } from "@/contexts/CMSAuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import RecorreLaHuella from "./pages/RecorreLaHuella";
import TrackDetail from "./pages/TrackDetail";
import EscuchaLaHuella from "./pages/EscuchaLaHuella";
import SobreElProyecto from "./pages/SobreElProyecto";
import Contacto from "./pages/Contacto";
import FichaTecnica from "./pages/FichaTecnica";
import Prensa from "./pages/Prensa";
import NotFound from "./pages/NotFound";
import CMSLogin from "./components/admin/CMSLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPages from "./pages/admin/AdminPages";
import AdminPageNew from "./pages/admin/AdminPageNew";
import AdminPageEdit from "./pages/admin/AdminPageEdit";
import AdminTracks from "./pages/admin/AdminTracks";
import AdminTrackEdit from "./pages/admin/AdminTrackEdit";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminVideoEdit from "./pages/admin/AdminVideoEdit";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminCTAButtons from "./pages/admin/AdminCTAButtons";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminLanguages from "./pages/admin/AdminLanguages";
import AdminLanguageEdit from "./pages/admin/AdminLanguageEdit";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminNavigation from "./pages/admin/AdminNavigation";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CMSAuthProvider>
        <LanguageProvider>
          <AudioPlayerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Layout><Outlet /></Layout>}>
                    <Route index element={<Index />} />
                    <Route path="recorre-la-huella" element={<RecorreLaHuella />} />
                    <Route path="track/:trackId" element={<TrackDetail />} />
                    <Route path="escucha-la-huella" element={<EscuchaLaHuella />} />
                    <Route path="sobre-el-proyecto" element={<SobreElProyecto />} />
                    <Route path="contacto" element={<Contacto />} />
                    <Route path="ficha-tecnica" element={<FichaTecnica />} />
                    <Route path="prensa" element={<Prensa />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<CMSLogin />} />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="pages" element={<AdminPages />} />
                    <Route path="pages/new" element={<AdminPageNew />} />
                    <Route path="pages/:pageId/edit" element={<AdminPageEdit />} />
                    <Route path="tracks" element={<AdminTracks />} />
                    <Route path="tracks/:trackId/edit" element={<AdminTrackEdit />} />
                    <Route path="videos" element={<AdminVideos />} />
                    <Route path="videos/:videoId/edit" element={<AdminVideoEdit />} />
                    <Route path="media" element={<AdminMedia />} />
                    <Route path="navigation" element={<AdminNavigation />} />
                    <Route path="cta-buttons" element={<AdminCTAButtons />} />
                    <Route path="templates" element={<AdminTemplates />} />
                    <Route path="languages" element={<AdminLanguages />} />
                    <Route path="languages/:id/edit" element={<AdminLanguageEdit />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AudioPlayerProvider>
        </LanguageProvider>
      </CMSAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
