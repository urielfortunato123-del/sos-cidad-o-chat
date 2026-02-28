import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Navigation, Share2, MapPin, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomSheetItem {
  id: string;
  name: string;
  emoji: string;
  type: string;
  layer: "safe" | "danger" | "realtime";
  lat: number;
  lng: number;
  distance?: number;
  phone?: string | null;
  address?: string | null;
  timestamp?: number;
  severity?: number;
  expires_at?: string;
}

interface MapBottomSheetProps {
  item: BottomSheetItem | null;
  onClose: () => void;
}

const layerLabels: Record<string, { label: string; color: string }> = {
  safe: { label: "Local Seguro", color: "bg-success/15 text-success" },
  danger: { label: "Zona de Perigo", color: "bg-destructive/15 text-destructive" },
  realtime: { label: "Evento ao Vivo", color: "bg-warning/15 text-warning" },
};

const typeLabels: Record<string, string> = {
  school: "Escola", hospital: "Saúde", church: "Igreja", fire_station: "Bombeiros",
  police: "Polícia", shelter: "Abrigo", encosta: "Encosta", alagavel: "Área Alagável",
  ponte: "Ponte", deslizamento: "Deslizamento", alagamento: "Alagamento",
  acidente: "Acidente", incendio: "Incêndio", energia: "Falta de Energia",
  deslizamento_rt: "Deslizamento", queda_arvore: "Queda de Árvore",
};

const MapBottomSheet = ({ item, onClose }: MapBottomSheetProps) => {
  if (!item) return null;

  const openNavigation = () => {
    const url = /iPhone|iPad/i.test(navigator.userAgent)
      ? `maps://maps.apple.com/?daddr=${item.lat},${item.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;
    window.open(url, "_blank");
  };

  const handleCall = () => {
    if (item.phone) window.location.href = `tel:${item.phone}`;
  };

  const handleShare = async () => {
    const text = `📍 ${item.name} — ${item.lat.toFixed(5)},${item.lng.toFixed(5)}`;
    if (navigator.share) {
      await navigator.share({ title: item.name, text, url: `https://www.google.com/maps?q=${item.lat},${item.lng}` });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  const timeAgo = (ts?: number) => {
    if (!ts) return "";
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 60) return `${mins}min atrás`;
    return `${Math.floor(mins / 60)}h atrás`;
  };

  const layer = layerLabels[item.layer] || layerLabels.safe;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-black/30"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-lg border-t border-border max-h-[55vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1.5 bg-border rounded-full" />
          </div>

          <div className="px-5 pb-6 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <span className="text-4xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground leading-tight">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${layer.color}`}>
                    {typeLabels[item.type] || item.type}
                  </span>
                  {item.distance != null && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.distance.toFixed(1)} km
                    </span>
                  )}
                  {item.timestamp && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(item.timestamp)}
                    </span>
                  )}
                </div>
                {item.address && (
                  <p className="text-xs text-muted-foreground mt-1">{item.address}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mt-1">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Severity */}
            {item.severity && item.layer !== "safe" && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-sm font-semibold text-foreground">
                  Gravidade: {item.severity}/5
                </span>
                <div className="flex gap-0.5 ml-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-3 h-3 rounded-full ${
                      i <= (item.severity || 0)
                        ? i <= 2 ? "bg-success" : i <= 3 ? "bg-warning" : "bg-destructive"
                        : "bg-muted"
                    }`} />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {item.phone && (
                <Button onClick={handleCall} className="flex-1 h-12 rounded-xl gap-2 bg-success hover:bg-success/90 text-success-foreground font-bold">
                  <Phone className="w-5 h-5" /> Ligar
                </Button>
              )}
              <Button onClick={openNavigation} className="flex-1 h-12 rounded-xl gap-2 font-bold" variant={item.phone ? "outline" : "default"}>
                <Navigation className="w-5 h-5" /> Ir
              </Button>
              <Button onClick={handleShare} variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MapBottomSheet;
