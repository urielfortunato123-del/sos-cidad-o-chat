import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import EmergenciaVeicular from "./pages/EmergenciaVeicular";
import OcrPage from "./pages/OcrPage";
import AlertaDesastre from "./pages/AlertaDesastre";
import PerfilMedico from "./pages/PerfilMedico";
import MapaAbrigos from "./pages/MapaAbrigos";
import ComunidadeSOS from "./pages/ComunidadeSOS";
import VehicleFloatingButton from "./components/VehicleFloatingButton";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <VehicleFloatingButton />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/install" element={<Install />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/emergencia-veicular" element={<EmergenciaVeicular />} />
          <Route path="/ocr" element={<OcrPage />} />
          <Route path="/alerta-desastre" element={<AlertaDesastre />} />
          <Route path="/perfil-medico" element={<PerfilMedico />} />
          <Route path="/mapa-abrigos" element={<MapaAbrigos />} />
          <Route path="/comunidade-sos" element={<ComunidadeSOS />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
