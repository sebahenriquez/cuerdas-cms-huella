import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { CMSAuthProvider } from "@/contexts/CMSAuthContext";
import Index from "./pages/Index";
import RecorreLaHuella from "./pages/RecorreLaHuella";
import EscuchaLaHuella from "./pages/EscuchaLaHuella";
import SobreElProyecto from "./pages/SobreElProyecto";
import Contacto from "./pages/Contacto";
import NotFound from "./pages/NotFound";
import CMSLogin from "./components/admin/CMSLogin";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPages from "./pages/admin/AdminPages";
import AdminTracks from "./pages/admin/AdminTracks";
import AdminMedia from "./pages/admin/AdminMedia";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CMSAuthProvider>
      <LanguageProvider>
        <AudioPlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/recorre-la-huella" element={<RecorreLaHuella />} />
                <Route path="/escucha-la-huella" element={<EscuchaLaHuella />} />
                <Route path="/sobre-el-proyecto" element={<SobreElProyecto />} />
                <Route path="/contacto" element={<Contacto />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<CMSLogin />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="tracks" element={<AdminTracks />} />
                  <Route path="media" element={<AdminMedia />} />
                </Route>
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AudioPlayerProvider>
      </LanguageProvider>
    </CMSAuthProvider>
  </QueryClientProvider>
);

export default App;
