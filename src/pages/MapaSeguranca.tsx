import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Loader2, Navigation, Plus, Clock, Shield, AlertTriangle, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getCurrentPosition } from "@/utils/geolocation";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useAccessLog } from "@/hooks/useAccessLog";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";

// ─── Types ──────────────────────────────────────────────
interface MapPlace {
  id: string;
  name: string;
  type: string;
  layer: "safe" | "danger" | "realtime";
  lat: number;
  lng: number;
  distance?: number;
  emoji: string;
  timestamp?: number;
  severity?: number;
  expires_at?: string;
  phone?: string | null;
  address?: string | null;
}

// ─── Layer definitions ──────────────────────────────────
const safePlaceFilters = [
  { id: "all", label: "Todos", emoji: "📍" },
  { id: "school", label: "Escolas", emoji: "🏫" },
  { id: "hospital", label: "Saúde", emoji: "🏥" },
  { id: "church", label: "Igrejas", emoji: "⛪" },
  { id: "fire_station", label: "Bombeiros", emoji: "🚒" },
  { id: "shelter", label: "Abrigos", emoji: "🏛️" },
];

const dangerZoneTypes = [
  { id: "encosta", emoji: "⛰️", label: "Encosta de risco", color: "bg-destructive" },
  { id: "alagavel", emoji: "🌊", label: "Área alagável", color: "bg-primary" },
  { id: "ponte", emoji: "🌉", label: "Ponte perigosa", color: "bg-warning" },
  { id: "deslizamento", emoji: "🏔️", label: "Histórico deslizamento", color: "bg-accent" },
];

const realtimeEventTypes = [
  { id: "alagamento", emoji: "🌊", label: "Rua Alagada", color: "bg-primary" },
  { id: "acidente", emoji: "🚗", label: "Acidente", color: "bg-warning" },
  { id: "incendio", emoji: "🔥", label: "Incêndio", color: "bg-destructive" },
  { id: "energia", emoji: "⚡", label: "Falta de Energia", color: "bg-accent" },
  { id: "deslizamento_rt", emoji: "⛰️", label: "Deslizamento", color: "bg-warning" },
  { id: "queda_arvore", emoji: "🌳", label: "Queda de Árvore", color: "bg-success" },
];


// ─── Map helpers ────────────────────────────────────────
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(position, 14); }, [position, map]);
  return null;
}

function createIcon(emoji: string, color: string, size = 36) {
  return L.divIcon({
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.5}px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${emoji}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const userIcon = L.divIcon({
  html: `<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(59,130,246,0.6)"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const iconColors: Record<string, string> = {
  school: "#3b82f6", hospital: "#ef4444", church: "#8b5cf6", fire_station: "#f97316", shelter: "#22c55e",
  encosta: "#dc2626", alagavel: "#3b82f6", ponte: "#f59e0b", deslizamento: "#9333ea",
  alagamento: "#3b82f6", acidente: "#f59e0b", incendio: "#dc2626", energia: "#eab308", deslizamento_rt: "#f59e0b", queda_arvore: "#22c55e",
};

// ─── Component ──────────────────────────────────────────
const MapaSeguranca = () => {
  useAccessLog("/mapa-seguranca");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendDisasterAlert, sendProximityAlert, requestPermission, permission } = useNotifications();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("safe");

  // Safe places
  const [safePlaces, setSafePlaces] = useState<MapPlace[]>([]);
  const [safeFilter, setSafeFilter] = useState("all");

  // Danger zones (from database)
  const [dangerZones, setDangerZones] = useState<MapPlace[]>([]);

  // Realtime events (from database)
  const [realtimeEvents, setRealtimeEvents] = useState<MapPlace[]>([]);

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLayer, setReportLayer] = useState<"danger" | "realtime">("realtime");
  const [reportSeverity, setReportSeverity] = useState(3);
  const [reportTtl, setReportTtl] = useState(180); // minutes

  // Load reports from database (filter expired)
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("community_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (data && !error) {
        const now = new Date().toISOString();
        const mapped: MapPlace[] = data
          .filter((r: any) => !r.expires_at || r.expires_at > now)
          .map((r: any) => ({
            id: r.id,
            type: r.type,
            layer: r.layer as "danger" | "realtime",
            emoji: r.emoji,
            name: r.name,
            lat: r.lat,
            lng: r.lng,
            timestamp: new Date(r.created_at).getTime(),
            severity: r.severity || 3,
            expires_at: r.expires_at,
          }));
        setDangerZones(mapped.filter(m => m.layer === "danger"));
        setRealtimeEvents(mapped.filter(m => m.layer === "realtime"));
      }
    };
    fetchReports();

    // Realtime subscription with proximity alerts
    const channel = supabase
      .channel("community-reports-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_reports" },
        (payload) => {
          const r = payload.new as any;
          const newPlace: MapPlace = {
            id: r.id,
            type: r.type,
            layer: r.layer as "danger" | "realtime",
            emoji: r.emoji,
            name: r.name,
            lat: r.lat,
            lng: r.lng,
            timestamp: new Date(r.created_at).getTime(),
          };
          if (newPlace.layer === "danger") {
            setDangerZones(prev => [newPlace, ...prev]);
          } else {
            setRealtimeEvents(prev => [newPlace, ...prev]);
          }

          // Proximity notification: alert if event is within 5km of user
          setUserPos(currentPos => {
            if (currentPos) {
              const dist = getDistance(currentPos[0], currentPos[1], newPlace.lat, newPlace.lng);
              if (dist <= 5) {
                sendProximityAlert(newPlace.name, newPlace.emoji, dist);
              }
            }
            return currentPos;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const pos = await getCurrentPosition();
        setUserPos([pos.latitude, pos.longitude]);
        await fetchSafePlaces(pos.latitude, pos.longitude);
      } catch {
        toast({ title: "Erro de GPS", description: "Ative a localização.", variant: "destructive" });
        setLoading(false);
      }
    })();
  }, []);

  const fetchSafePlaces = async (lat: number, lng: number) => {
    try {
      // Use edge function via URL with query params
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/fetch-pois?lat=${lat}&lng=${lng}&radius=5000`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch POIs');
      
      const data = await response.json();
      const results: MapPlace[] = (data.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        layer: "safe" as const,
        lat: item.lat,
        lng: item.lng,
        distance: item.distance_km,
        emoji: item.emoji,
        phone: item.phone,
        address: item.address,
      }));
      setSafePlaces(results);
    } catch {
      // Fallback to direct Overpass if edge function fails
      try {
        const radius = 5000;
        const query = `[out:json][timeout:15];(node["amenity"="school"](around:${radius},${lat},${lng});node["amenity"~"hospital|clinic"](around:${radius},${lat},${lng});node["amenity"="place_of_worship"](around:${radius},${lat},${lng});node["amenity"="fire_station"](around:${radius},${lat},${lng});node["amenity"="police"](around:${radius},${lat},${lng});node["amenity"~"community_centre|social_facility"](around:${radius},${lat},${lng});node["emergency"="assembly_point"](around:${radius},${lat},${lng}););out body 80;`;
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST", body: `data=${encodeURIComponent(query)}`,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        const data = await res.json();
        const results: MapPlace[] = (data.elements || []).map((el: any) => {
          const amenity = el.tags?.amenity || el.tags?.emergency || "";
          let type = "shelter", emoji = "🏛️";
          if (amenity === "school") { type = "school"; emoji = "🏫"; }
          else if (["hospital", "clinic"].includes(amenity)) { type = "hospital"; emoji = "🏥"; }
          else if (amenity === "place_of_worship") { type = "church"; emoji = "⛪"; }
          else if (amenity === "fire_station") { type = "fire_station"; emoji = "🚒"; }
          else if (amenity === "police") { type = "police"; emoji = "🚔"; }
          return {
            id: el.id.toString(),
            name: el.tags?.name || `${emoji} ${type}`,
            type, layer: "safe" as const, lat: el.lat, lng: el.lon,
            distance: getDistance(lat, lng, el.lat, el.lon), emoji,
          };
        });
        results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setSafePlaces(results);
      } catch {
        toast({ title: "Erro ao buscar locais", description: "Tente novamente.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (typeId: string, layer: "danger" | "realtime") => {
    if (!userPos) {
      toast({ title: "GPS necessário", description: "Ative a localização.", variant: "destructive" });
      return;
    }
    const types = layer === "danger" ? dangerZoneTypes : realtimeEventTypes;
    const t = types.find(x => x.id === typeId)!;

    // Save to database with severity and TTL
    const expiresAt = new Date(Date.now() + reportTtl * 60 * 1000).toISOString();
    const { error } = await supabase.from("community_reports").insert({
      type: typeId,
      layer,
      emoji: t.emoji,
      name: t.label,
      lat: userPos[0],
      lng: userPos[1],
      severity: reportSeverity,
      expires_at: expiresAt,
    } as any);

    if (error) {
      toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
      return;
    }

    setShowReportModal(false);
    // Send push notification for the report
    sendDisasterAlert(t.label, t.emoji, { lat: userPos[0], lng: userPos[1] });
    toast({ title: `${t.emoji} Marcação registrada!`, description: `${t.label} adicionado ao mapa. Visível para todos!` });
  };

  const openNavigation = (lat: number, lng: number) => {
    const url = /iPhone|iPad/i.test(navigator.userAgent) ? `maps://maps.apple.com/?daddr=${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const timeAgo = (ts?: number) => {
    if (!ts) return "";
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 60) return `${mins}min`;
    return `${Math.floor(mins / 60)}h`;
  };

  const filteredSafe = safeFilter === "all" ? safePlaces : safePlaces.filter(p => p.type === safeFilter);

  const currentMarkers = activeTab === "safe" ? filteredSafe : activeTab === "danger" ? dangerZones : realtimeEvents;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary-foreground hover:bg-primary-foreground/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Shield className="w-6 h-6" />
          <h1 className="text-lg font-bold flex-1">Mapa de Segurança</h1>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border bg-card h-auto p-1 gap-1">
          <TabsTrigger value="safe" className="flex-1 gap-1.5 data-[state=active]:bg-green-500/15 data-[state=active]:text-green-700 rounded-lg py-2.5 text-xs font-bold">
            <span>🟢</span> Seguros
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex-1 gap-1.5 data-[state=active]:bg-red-500/15 data-[state=active]:text-red-700 rounded-lg py-2.5 text-xs font-bold">
            <span>🔴</span> Perigo
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex-1 gap-1.5 data-[state=active]:bg-yellow-500/15 data-[state=active]:text-yellow-700 rounded-lg py-2.5 text-xs font-bold">
            <span>🟡</span> Ao Vivo
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground">Carregando mapa...</p>
              <p className="text-sm text-muted-foreground">Obtendo sua localização</p>
            </div>
          </div>
        ) : userPos ? (
          <>
            {/* Safe filters */}
            <TabsContent value="safe" className="mt-0">
              <div className="bg-card border-b border-border px-4 py-2 overflow-x-auto">
                <div className="flex gap-2">
                  {safePlaceFilters.map(f => (
                    <button key={f.id} onClick={() => setSafeFilter(f.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        safeFilter === f.id ? "bg-green-600 text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}>
                      {f.emoji} {f.label}
                      {f.id !== "all" && ` (${safePlaces.filter(p => p.type === f.id).length})`}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Danger header */}
            <TabsContent value="danger" className="mt-0">
              <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">🔴 {dangerZones.length} zona{dangerZones.length !== 1 ? "s" : ""} de perigo</p>
                <Button size="sm" variant="destructive" className="gap-1 rounded-full text-xs" onClick={() => { setReportLayer("danger"); setShowReportModal(true); }}>
                  <Plus className="w-3 h-3" /> Marcar
                </Button>
              </div>
            </TabsContent>

            {/* Realtime header */}
            <TabsContent value="realtime" className="mt-0">
              <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">🟡 {realtimeEvents.length} evento{realtimeEvents.length !== 1 ? "s" : ""} ao vivo</p>
                <Button size="sm" className="gap-1 rounded-full text-xs bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => { setReportLayer("realtime"); setShowReportModal(true); }}>
                  <Plus className="w-3 h-3" /> Reportar
                </Button>
              </div>
            </TabsContent>

            {/* Map (shared across all tabs) */}
            <div className="h-[42vh]">
              <MapContainer center={userPos} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
                <RecenterMap position={userPos} />
                <Marker position={userPos} icon={userIcon}>
                  <Popup>📍 Você está aqui</Popup>
                </Marker>

                {/* Danger zone circles */}
                {activeTab === "danger" && dangerZones.map(dz => (
                  <Circle key={`c-${dz.id}`} center={[dz.lat, dz.lng]} radius={200}
                    pathOptions={{ color: iconColors[dz.type] || "#dc2626", fillColor: iconColors[dz.type] || "#dc2626", fillOpacity: 0.15 }} />
                ))}

                {currentMarkers.map(place => (
                  <Marker key={place.id} position={[place.lat, place.lng]}
                    icon={createIcon(place.emoji, iconColors[place.type] || "#6b7280", activeTab === "realtime" ? 30 + (place.severity || 3) * 4 : 36)}>
                    <Popup>
                      <div className="text-center">
                        <strong>{place.emoji} {place.name}</strong>
                        {place.distance != null && <><br /><span className="text-sm">{place.distance.toFixed(1)} km</span></>}
                        {place.timestamp && <><br /><span className="text-xs text-gray-500">⏱ {timeAgo(place.timestamp)}</span></>}
                        {place.layer === "safe" && (
                          <><br /><button onClick={() => openNavigation(place.lat, place.lng)} className="text-blue-600 underline text-sm mt-1">Navegar →</button></>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === "safe" && (
                <>
                  <h3 className="font-bold text-foreground text-base">{filteredSafe.length} lugares seguros</h3>
                  {filteredSafe.slice(0, 20).map(place => (
                    <motion.button key={place.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      onClick={() => openNavigation(place.lat, place.lng)}
                      className="w-full bg-card rounded-xl p-3 border border-border shadow-soft flex items-center gap-3 text-left active:scale-[0.98] transition-all">
                      <span className="text-2xl">{place.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate text-sm">{place.name}</p>
                        <p className="text-xs text-muted-foreground">{place.distance?.toFixed(1)} km</p>
                      </div>
                      <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
                    </motion.button>
                  ))}
                </>
              )}

              {activeTab === "danger" && (
                <>
                  {dangerZones.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Nenhuma zona de perigo marcada.</p>
                      <Button onClick={() => { setReportLayer("danger"); setShowReportModal(true); }} className="mt-3 gap-1" variant="destructive" size="sm">
                        <Plus className="w-4 h-4" /> Marcar zona de perigo
                      </Button>
                    </div>
                  ) : dangerZones.map(dz => (
                    <div key={dz.id} className="bg-card rounded-xl p-3 border border-destructive/30 shadow-soft flex items-center gap-3">
                      <span className="text-2xl">{dz.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">{dz.name}</p>
                        {dz.timestamp && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(dz.timestamp)}</p>}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeTab === "realtime" && (
                <>
                  {realtimeEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Nenhum evento ao vivo.</p>
                      <Button onClick={() => { setReportLayer("realtime"); setShowReportModal(true); }} className="mt-3 gap-1 bg-yellow-500 hover:bg-yellow-600 text-black" size="sm">
                        <Plus className="w-4 h-4" /> Reportar evento
                      </Button>
                    </div>
                  ) : realtimeEvents.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map(ev => (
                    <div key={ev.id} className="bg-card rounded-xl p-3 border border-warning/30 shadow-soft flex items-center gap-3">
                      <span className="text-2xl">{ev.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">{ev.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {ev.timestamp && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(ev.timestamp)}</span>}
                          {ev.severity && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                              ev.severity <= 2 ? "bg-success/20 text-success" : ev.severity === 3 ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
                            }`}>
                              Nível {ev.severity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">GPS não disponível</p>
              <p className="text-muted-foreground mb-4 text-sm">Ative a localização e tente novamente</p>
              <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
            </div>
          </div>
        )}
      </Tabs>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowReportModal(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card w-full rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-1 text-center">
                {reportLayer === "danger" ? "🔴 Marcar Zona de Perigo" : "🟡 Reportar Evento"}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-4">Sua localização será usada para marcar no mapa</p>
              
              {/* Severity selector */}
              <div className="mb-4">
                <p className="text-sm font-bold text-foreground mb-2">Gravidade</p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setReportSeverity(s)}
                      className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                        reportSeverity === s
                          ? s <= 2 ? "bg-success text-success-foreground" : s <= 3 ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {reportSeverity <= 2 ? "Baixa" : reportSeverity === 3 ? "Moderada" : reportSeverity === 4 ? "Alta" : "Crítica"}
                </p>
              </div>

              {/* TTL selector */}
              <div className="mb-4">
                <p className="text-sm font-bold text-foreground mb-2">Validade</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {[
                    { value: 60, label: "1h" },
                    { value: 180, label: "3h" },
                    { value: 360, label: "6h" },
                    { value: 720, label: "12h" },
                    { value: 1440, label: "24h" },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setReportTtl(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        reportTtl === opt.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(reportLayer === "danger" ? dangerZoneTypes : realtimeEventTypes).map(type => (
                  <button key={type.id} onClick={() => handleReport(type.id, reportLayer)}
                    className={`${type.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md active:scale-95 transition-all`}>
                    <span className="text-3xl">{type.emoji}</span>
                    <span className="text-sm font-bold">{type.label}</span>
                  </button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setShowReportModal(false)} className="w-full mt-4 text-muted-foreground">Cancelar</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapaSeguranca;
