import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Plus, AlertTriangle, Loader2, Navigation, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCurrentPosition } from "@/utils/geolocation";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessLog } from "@/hooks/useAccessLog";
import "leaflet/dist/leaflet.css";

interface CommunityReport {
  id: string;
  type: string;
  emoji: string;
  label: string;
  description: string;
  lat: number;
  lng: number;
  timestamp: number;
  distance?: number;
}

const reportTypes = [
  { id: "alagamento", emoji: "🌊", label: "Rua Alagada", color: "bg-primary" },
  { id: "deslizamento", emoji: "⛰️", label: "Deslizamento", color: "bg-warning" },
  { id: "ponte", emoji: "🌉", label: "Ponte Caída", color: "bg-destructive" },
  { id: "incendio", emoji: "🔥", label: "Incêndio", color: "bg-accent" },
  { id: "queda_arvore", emoji: "🌳", label: "Queda de Árvore", color: "bg-success" },
  { id: "buraco", emoji: "🕳️", label: "Buraco na Via", color: "bg-muted" },
];

const STORAGE_KEY = "sos-cidadao-community-reports";

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(position, 13); }, [position, map]);
  return null;
}

function createIcon(emoji: string, color: string) {
  return L.divIcon({
    html: `<div style="background:${color};width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${emoji}</div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

const userIcon = L.divIcon({
  html: `<div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.5)"></div>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const ComunidadeSOS = () => {
  useAccessLog('/comunidade-sos');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load saved reports from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CommunityReport[];
        // Filter reports from last 24h
        const recent = parsed.filter(r => Date.now() - r.timestamp < 24 * 60 * 60 * 1000);
        setReports(recent);
      } catch {}
    }

    (async () => {
      try {
        const pos = await getCurrentPosition();
        setUserPos([pos.latitude, pos.longitude]);
      } catch {
        toast({ title: "Erro de GPS", description: "Ative a localização.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleReport = async (typeId: string) => {
    if (!userPos) {
      toast({ title: "GPS necessário", description: "Ative a localização.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const type = reportTypes.find(r => r.id === typeId)!;

    const newReport: CommunityReport = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: typeId,
      emoji: type.emoji,
      label: type.label,
      description: `${type.label} reportado na região`,
      lat: userPos[0],
      lng: userPos[1],
      timestamp: Date.now(),
    };

    const updated = [...reports, newReport];
    setReports(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setSubmitting(false);
    setShowReportModal(false);

    toast({ title: `${type.emoji} Ocorrência registrada!`, description: `${type.label} marcado no mapa. Obrigado por ajudar!` });
  };

  const timeAgo = (timestamp: number) => {
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    return `${hours}h atrás`;
  };

  const iconColors: Record<string, string> = {
    alagamento: "#3b82f6",
    deslizamento: "#f59e0b",
    ponte: "#ef4444",
    incendio: "#dc2626",
    queda_arvore: "#22c55e",
    buraco: "#6b7280",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-primary-foreground hover:bg-primary-foreground/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Users className="w-6 h-6" />
          <h1 className="text-lg font-bold flex-1">Comunidade SOS</h1>
          <Button
            onClick={() => setShowReportModal(true)}
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full gap-1 font-bold"
          >
            <Plus className="w-4 h-4" />
            Reportar
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground">Carregando mapa...</p>
          </div>
        </div>
      ) : userPos ? (
        <div className="flex-1 flex flex-col">
          {/* Map */}
          <div className="h-[50vh]">
            <MapContainer center={userPos} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
              <RecenterMap position={userPos} />
              <Marker position={userPos} icon={userIcon}>
                <Popup>📍 Você está aqui</Popup>
              </Marker>
              {reports.map(report => (
                <Marker key={report.id} position={[report.lat, report.lng]} icon={createIcon(report.emoji, iconColors[report.type] || "#6b7280")}>
                  <Popup>
                    <div className="text-center">
                      <strong>{report.emoji} {report.label}</strong>
                      <br />
                      <span className="text-xs text-gray-500">{timeAgo(report.timestamp)}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Reports list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-foreground text-lg">
                {reports.length} ocorrência{reports.length !== 1 ? "s" : ""} nas últimas 24h
              </h3>
            </div>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma ocorrência registrada na região.</p>
                <Button onClick={() => setShowReportModal(true)} className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Ser o primeiro a reportar
                </Button>
              </div>
            ) : (
              reports.sort((a, b) => b.timestamp - a.timestamp).map(report => (
                <div key={report.id} className="bg-card rounded-xl p-4 border border-border shadow-soft flex items-center gap-3">
                  <span className="text-2xl">{report.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{report.label}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(report.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">GPS necessário</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Tentar novamente</Button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card w-full rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-1 text-center">O que está acontecendo?</h2>
              <p className="text-sm text-muted-foreground text-center mb-4">Sua localização será usada para marcar no mapa</p>

              <div className="grid grid-cols-2 gap-3">
                {reportTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleReport(type.id)}
                    disabled={submitting}
                    className={`${type.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md active:scale-95 transition-all`}
                  >
                    <span className="text-3xl">{type.emoji}</span>
                    <span className="text-sm font-bold">{type.label}</span>
                  </button>
                ))}
              </div>

              <Button variant="ghost" onClick={() => setShowReportModal(false)} className="w-full mt-4 text-muted-foreground">
                Cancelar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComunidadeSOS;
