import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CloudRain, Mountain, Zap, Car, Heart, Navigation, Phone, MessageSquare, Loader2, Share2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCurrentPosition } from "@/utils/geolocation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessLog } from "@/hooks/useAccessLog";

const disasterTypes = [
  { id: "enchente", label: "Enchente", emoji: "🌧️", icon: CloudRain, color: "bg-primary", description: "Alagamento ou inundação na região" },
  { id: "deslizamento", label: "Deslizamento", emoji: "⛰️", icon: Mountain, color: "bg-warning", description: "Deslizamento de terra ou desmoronamento" },
  { id: "energia", label: "Falta de Energia", emoji: "⚡", icon: Zap, color: "bg-warning", description: "Queda de energia na região" },
  { id: "acidente", label: "Acidente", emoji: "🚗", icon: Car, color: "bg-accent", description: "Acidente de trânsito ou veicular" },
  { id: "ambulancia", label: "Preciso de Ambulância", emoji: "🏥", icon: Heart, color: "bg-destructive", description: "Emergência médica urgente" },
];

const AlertaDesastre = () => {
  useAccessLog('/alerta-desastre');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [locationSent, setLocationSent] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleDisasterSelect = async (typeId: string) => {
    setSelectedType(typeId);
    setIsSending(true);

    try {
      // Get location
      const pos = await getCurrentPosition();
      const loc = { lat: pos.latitude, lng: pos.longitude };
      setUserLocation(loc);
      setLocationSent(true);

      const disasterType = disasterTypes.find(d => d.id === typeId);
      const gpsLink = `https://maps.google.com/?q=${loc.lat},${loc.lng}`;
      const message = `🆘 Emergência SOS Cidadão!\n\n⚠️ ${disasterType?.label}\n📍 Minha localização: ${gpsLink}\n\nEstou em risco. Por favor envie ajuda!`;

      toast({
        title: "📍 Localização obtida!",
        description: "Sua localização foi capturada com sucesso.",
      });

      // Show action buttons
      setTimeout(() => {
        setIsSending(false);
      }, 500);

    } catch (error) {
      setIsSending(false);
      toast({
        title: "Erro ao obter localização",
        description: "Verifique se o GPS está ativado.",
        variant: "destructive",
      });
    }
  };

  const handleCallEmergency = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleShareWhatsApp = () => {
    if (!userLocation) return;
    const disasterType = disasterTypes.find(d => d.id === selectedType);
    const gpsLink = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    const message = encodeURIComponent(`🆘 Emergência SOS Cidadão!\n\n⚠️ ${disasterType?.label}\n📍 Minha localização: ${gpsLink}\n\nEstou em risco. Por favor envie ajuda!`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareSMS = () => {
    if (!userLocation) return;
    const disasterType = disasterTypes.find(d => d.id === selectedType);
    const gpsLink = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    const message = `SOS! ${disasterType?.label}. Localização: ${gpsLink}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  const handleShareNative = async () => {
    if (!userLocation) return;
    const disasterType = disasterTypes.find(d => d.id === selectedType);
    const gpsLink = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    const message = `🆘 Emergência SOS Cidadão!\n⚠️ ${disasterType?.label}\n📍 ${gpsLink}\nEstou em risco!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "SOS Emergência", text: message });
      } catch {}
    } else {
      handleShareWhatsApp();
    }
  };

  const handleNavigateToShelter = () => {
    navigate("/mapa-abrigos");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-destructive text-destructive-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-destructive-foreground hover:bg-destructive-foreground/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <AlertTriangle className="w-6 h-6 animate-pulse" />
          <h1 className="text-lg font-bold flex-1">Alerta de Desastre</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <AnimatePresence mode="wait">
          {!selectedType ? (
            /* Step 1: Choose disaster type */
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">O que está acontecendo?</h2>
                <p className="text-muted-foreground">Selecione o tipo de emergência</p>
              </div>

              <div className="space-y-3">
                {disasterTypes.map((type, i) => (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleDisasterSelect(type.id)}
                    className={`w-full ${type.color} text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-all`}
                  >
                    <span className="text-4xl">{type.emoji}</span>
                    <div className="text-left flex-1">
                      <span className="text-xl font-bold block">{type.label}</span>
                      <span className="text-sm opacity-80">{type.description}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Step 2: Actions after selection */
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {isSending ? (
                <div className="text-center py-16">
                  <Loader2 className="w-16 h-16 animate-spin text-accent mx-auto mb-4" />
                  <p className="text-xl font-bold text-foreground">Obtendo sua localização...</p>
                  <p className="text-muted-foreground mt-2">Ative o GPS se solicitado</p>
                </div>
              ) : (
                <>
                  {/* Status */}
                  <div className="bg-success/10 border border-success/30 rounded-2xl p-4 text-center">
                    <p className="text-success font-bold text-lg">✅ Localização capturada!</p>
                    {userLocation && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                      </p>
                    )}
                  </div>

                  {/* Emergency Calls */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-foreground text-lg">📞 Ligar Emergência</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { number: "190", label: "Polícia", emoji: "🚓", color: "bg-primary" },
                        { number: "192", label: "SAMU", emoji: "🚑", color: "bg-accent" },
                        { number: "193", label: "Bombeiros", emoji: "🚒", color: "bg-warning" },
                      ].map(item => (
                        <button
                          key={item.number}
                          onClick={() => handleCallEmergency(item.number)}
                          className={`${item.color} text-white rounded-xl p-4 flex flex-col items-center gap-1 shadow-md active:scale-95 transition-all`}
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-xl font-black">{item.number}</span>
                          <span className="text-[10px] font-semibold opacity-80">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Share Location */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-foreground text-lg">📤 Compartilhar Localização</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <Button onClick={handleShareWhatsApp} className="h-14 rounded-xl bg-success hover:bg-success/90 text-success-foreground text-base font-bold gap-3">
                        <MessageSquare className="w-5 h-5" />
                        WhatsApp — Enviar para contatos
                      </Button>
                      <Button onClick={handleShareSMS} variant="outline" className="h-14 rounded-xl text-base font-bold gap-3">
                        <Phone className="w-5 h-5" />
                        SMS — Funciona sem internet
                      </Button>
                      <Button onClick={handleShareNative} variant="outline" className="h-14 rounded-xl text-base font-bold gap-3">
                        <Share2 className="w-5 h-5" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>

                  {/* Navigate to Shelter */}
                  <Button
                    onClick={handleNavigateToShelter}
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold gap-3"
                  >
                    <Navigation className="w-6 h-6" />
                    🏠 Encontrar Abrigo Seguro
                  </Button>

                  {/* Reset */}
                  <Button variant="ghost" onClick={() => { setSelectedType(null); setLocationSent(false); }} className="w-full text-muted-foreground">
                    ← Voltar e escolher outro tipo
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AlertaDesastre;
