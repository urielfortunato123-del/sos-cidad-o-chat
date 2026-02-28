import { MapPin, Search, Loader2, Navigation, AlertTriangle, Phone, Heart, Shield, Flame, HandHeart, Car, MapPinned, Users, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { smartLookup } from "@/utils/addressLookup";
import { getLocationWithAddress } from "@/utils/geolocation";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import WeatherBadge from "@/components/WeatherBadge";
import WeatherForecastCard from "@/components/WeatherForecastCard";

interface HeroSectionProps {
  onStartChat: (cep: string, cityInfo?: { city: string; state: string }) => void;
}

const emergencyButtons = [
  { number: "190", label: "Polícia", emoji: "🚓", icon: Shield, bgClass: "bg-primary", hoverClass: "hover:bg-primary/90" },
  { number: "192", label: "SAMU", emoji: "🚑", icon: Heart, bgClass: "bg-accent", hoverClass: "hover:bg-accent/90" },
  { number: "193", label: "Bombeiros", emoji: "🚒", icon: Flame, bgClass: "bg-warning", hoverClass: "hover:bg-warning/90" },
  { number: "188", label: "CVV", emoji: "🧠", icon: HandHeart, bgClass: "bg-success", hoverClass: "hover:bg-success/90" },
];

const HeroSection = ({ onStartChat }: HeroSectionProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast({ title: "Campo vazio", description: "Digite um CEP, cidade ou endereço.", variant: "destructive" });
      return;
    }
    setIsSearching(true);
    try {
      const result = await smartLookup(searchValue);
      if (result) {
        onStartChat(result.cep, { city: result.city, state: result.state });
      } else {
        const cleanNumbers = searchValue.replace(/\D/g, "");
        if (cleanNumbers.length === 8) {
          onStartChat(searchValue, undefined);
        } else {
          toast({ title: "Não encontrado", description: "Tente o CEP completo ou cidade com estado.", variant: "destructive" });
        }
      }
    } catch {
      toast({ title: "Erro na busca", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getLocationWithAddress();
      if (location.city && location.state) {
        toast({ title: "📍 Localização encontrada!", description: `${location.city}, ${location.state}` });
        if (location.cep && location.cep.length >= 5) {
          onStartChat(location.cep.padEnd(8, '0'), { city: location.city, state: location.state });
        } else {
          const result = await smartLookup(`${location.city}, ${location.state}`);
          if (result) {
            onStartChat(result.cep, { city: result.city, state: result.state });
          } else {
            onStartChat("00000000", { city: location.city, state: location.state });
          }
        }
      } else {
        toast({ title: "Localização parcial", description: "Digite manualmente.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro de localização", description: error instanceof Error ? error.message : "Não foi possível obter sua localização.", variant: "destructive" });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const isLoading = isSearching || isGettingLocation;

  return (
    <section className="relative min-h-[85vh] flex flex-col gradient-hero overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex-1 flex flex-col">
        {/* Header badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-3 flex-wrap justify-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-primary-foreground/90">Disponível 24 horas</span>
            </div>
            <WeatherBadge />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-2 leading-tight">
            🆘 SOS Cidadão
          </h1>
          <p className="text-base md:text-lg text-primary-foreground/70 max-w-md mx-auto">
            Sistema Nacional de Emergência — Proteção para famílias brasileiras
          </p>
        </motion.div>

        {/* Emergency Buttons — BIG & Accessible */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full mb-6"
        >
          {emergencyButtons.map((btn, i) => (
            <motion.button
              key={btn.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => handleCall(btn.number)}
              className={`${btn.bgClass} ${btn.hoverClass} text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition-all min-h-[100px]`}
            >
              <span className="text-3xl">{btn.emoji}</span>
              <span className="text-2xl md:text-3xl font-black">{btn.number}</span>
              <span className="text-xs font-semibold opacity-90">{btn.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Quick Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full mb-6"
        >
          <button
            onClick={() => navigate("/alerta-desastre")}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all animate-pulse-emergency min-h-[80px]"
          >
            <AlertTriangle className="w-7 h-7" />
            <span className="text-sm font-bold">⚠️ ALERTA DESASTRE</span>
          </button>
          <button
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="bg-primary-foreground/15 hover:bg-primary-foreground/25 backdrop-blur-sm text-primary-foreground border border-primary-foreground/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all min-h-[80px]"
          >
            {isGettingLocation ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <Navigation className="w-7 h-7" />
            )}
            <span className="text-sm font-bold">📍 Enviar Localização</span>
          </button>
        </motion.div>

        {/* Search bar */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit} 
          className="max-w-md mx-auto w-full mb-6"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="CEP, cidade ou endereço"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 h-12 text-base bg-card border-border rounded-xl shadow-medium"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" variant="emergency" className="h-12 px-4 rounded-xl" disabled={isLoading || !searchValue.trim()}>
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </Button>
          </div>
        </motion.form>

        {/* Feature links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-2 max-w-lg mx-auto w-full"
        >
          {[
            { label: "Veicular", emoji: "🚗", icon: Car, path: "/emergencia-veicular" },
            { label: "Mapa Segurança", emoji: "🗺️", icon: MapPinned, path: "/mapa-seguranca" },
            { label: "Perfil Médico", emoji: "🏥", icon: UserCircle, path: "/perfil-medico" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground rounded-xl p-3 flex flex-col items-center gap-1 transition-all active:scale-95 border border-primary-foreground/10"
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Weather Forecast Card */}
        <WeatherForecastCard />
      </div>

      {/* Bottom wave */}
      <div className="relative">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L60 73C120 67 240 53 360 48C480 43 600 48 720 53C840 58 960 63 1080 60C1200 57 1320 47 1380 42L1440 37V80H0Z" className="fill-background" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
