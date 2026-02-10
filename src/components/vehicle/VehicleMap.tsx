import { useState, useEffect } from "react";
import { Navigation, Phone, Loader2, AlertTriangle, RefreshCw, ExternalLink, Fuel, Wrench, Zap, Car, Droplets, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagnosisResult } from "@/pages/EmergenciaVeicular";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface VehicleMapProps {
  diagnosis: DiagnosisResult | null;
  onBack: () => void;
  onEmergency: () => void;
}

interface NearbyPlace {
  id: number;
  name: string;
  type: string;
  emoji: string;
  lat: number;
  lon: number;
  distance?: number;
  phone?: string;
}

type ServiceFilter = "todos" | "oficina" | "posto" | "autoeletrica" | "autopecas" | "troca_oleo" | "guincho";

const serviceFilters: { key: ServiceFilter; label: string; emoji: string; icon: any }[] = [
  { key: "todos", label: "Todos", emoji: "📍", icon: Filter },
  { key: "oficina", label: "Oficinas", emoji: "🔧", icon: Wrench },
  { key: "posto", label: "Postos", emoji: "⛽", icon: Fuel },
  { key: "autoeletrica", label: "Autoelétrica", emoji: "⚡", icon: Zap },
  { key: "autopecas", label: "Autopeças", emoji: "🔩", icon: Car },
  { key: "troca_oleo", label: "Troca de Óleo", emoji: "🛢️", icon: Droplets },
];

const markerColors: Record<string, string> = {
  oficina: "#f59e0b",
  posto: "#22c55e",
  autoeletrica: "#8b5cf6",
  autopecas: "#ef4444",
  troca_oleo: "#06b6d4",
  guincho: "#ec4899",
};

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 14);
  }, [lat, lon, map]);
  return null;
}

const createColorIcon = (color: string, emoji: string) => {
  return new L.DivIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const userIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:4px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.4),0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const VehicleMap = ({ diagnosis, onBack, onEmergency }: VehicleMapProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [locationError, setLocationError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ServiceFilter>("todos");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setLocationError(true);
        setError("Não foi possível obter sua localização. Ative o GPS.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  const fetchNearbyPlaces = async (location: { lat: number; lon: number }) => {
    setLoading(true);
    setError(null);
    try {
      const radius = diagnosis?.risk === "red" ? 3000 : 10000;
      const query = `
        [out:json][timeout:15];
        (
          node["shop"="car_repair"](around:${radius},${location.lat},${location.lon});
          node["amenity"="fuel"](around:${radius},${location.lat},${location.lon});
          node["shop"="car_parts"](around:${radius},${location.lat},${location.lon});
          node["shop"="car"](around:${radius},${location.lat},${location.lon});
          node["craft"="electrician"]["service"~"car|auto|vehicle"](around:${radius},${location.lat},${location.lon});
        );
        out body 40;
      `;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      // Try primary Overpass endpoint, fallback to alternative
      let response: Response;
      try {
        response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          signal: controller.signal,
        });
      } catch {
        // Fallback to alternative Overpass server
        response = await fetch("https://overpass.kumi.systems/api/interpreter", {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          signal: controller.signal,
        });
      }
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const mapped: NearbyPlace[] = (data.elements || []).map((el: any) => {
        const tags = el.tags || {};
        const isFuel = tags.amenity === "fuel";
        const isCarParts = tags.shop === "car_parts";
        const isOilChange = tags["service:vehicle:oil_change"] === "yes";
        const isElectric = tags.craft === "electrician" || (tags.name && /eletri/i.test(tags.name));

        let type = "oficina";
        let emoji = "🔧";
        let name = tags.name || "Oficina Mecânica";

        if (isFuel) {
          type = "posto";
          emoji = "⛽";
          name = tags.name || "Posto de Combustível";
        } else if (isElectric) {
          type = "autoeletrica";
          emoji = "⚡";
          name = tags.name || "Autoelétrica";
        } else if (isCarParts) {
          type = "autopecas";
          emoji = "🔩";
          name = tags.name || "Autopeças";
        } else if (isOilChange) {
          type = "troca_oleo";
          emoji = "🛢️";
          name = tags.name || "Troca de Óleo";
        }

        const dist = getDistance(location.lat, location.lon, el.lat, el.lon);
        return {
          id: el.id,
          name,
          type,
          emoji,
          lat: el.lat,
          lon: el.lon,
          distance: dist,
          phone: tags.phone || tags["contact:phone"] || undefined,
        };
      });

      mapped.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setPlaces(mapped);
    } catch (err) {
      console.error("Overpass API error:", err);
      setError("Não foi possível buscar serviços próximos. O mapa está disponível abaixo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLocation) return;
    fetchNearbyPlaces(userLocation);
  }, [userLocation, diagnosis, retryCount]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const r1 = (lat1 * Math.PI) / 180;
    const r2 = (lat2 * Math.PI) / 180;
    const d1 = ((lat2 - lat1) * Math.PI) / 180;
    const d2 = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(d1 / 2) ** 2 + Math.cos(r1) * Math.cos(r2) * Math.sin(d2 / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const openNativeNavigation = (lat: number, lon: number) => {
    // Try native geo: URI first (works on Android/iOS), fallback to Google Maps
    const geoUri = `geo:${lat},${lon}?q=${lat},${lon}`;
    const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;

    // Check if on mobile
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = geoUri;
      // Fallback after short delay if geo: doesn't work
      setTimeout(() => {
        window.open(googleUrl, "_blank");
      }, 500);
    } else {
      window.open(googleUrl, "_blank");
    }
  };

  const filteredPlaces = activeFilter === "todos"
    ? places
    : places.filter(p => p.type === activeFilter);

  const filterCounts = serviceFilters.reduce((acc, f) => {
    acc[f.key] = f.key === "todos" ? places.length : places.filter(p => p.type === f.key).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-10 h-10 text-primary" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-muted-foreground">
          Obtendo localização e buscando serviços...
        </motion.p>
      </div>
    );
  }

  const openGoogleMapsSearch = () => {
    const url = userLocation
      ? `https://www.google.com/maps/search/oficina+mecanica+posto+combustivel/@${userLocation.lat},${userLocation.lon},14z`
      : `https://www.google.com/maps/search/oficina+mecanica+posto+combustivel`;
    window.open(url, "_blank");
  };

  if (error && !userLocation) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center py-8">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
        <p className="text-foreground font-medium">{error}</p>
        <div className="space-y-3">
          <Button onClick={openGoogleMapsSearch} className="w-full h-12 rounded-2xl bg-success text-success-foreground">
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir no Google Maps
          </Button>
          <Button onClick={onBack} variant="outline" className="w-full h-12 rounded-2xl">Voltar</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground text-center">
        Serviços Próximos
      </motion.h2>

      {/* Error banner with retry - still shows map below */}
      {error && userLocation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-foreground flex-1">Erro ao buscar serviços. O mapa está disponível.</p>
          <Button size="sm" variant="outline" onClick={() => setRetryCount(c => c + 1)} className="shrink-0 rounded-xl">
            <RefreshCw className="w-3 h-3 mr-1" />
            Tentar
          </Button>
        </motion.div>
      )}

      {/* Filter chips */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
      >
        {serviceFilters.map((filter) => {
          const count = filterCounts[filter.key] || 0;
          const isActive = activeFilter === filter.key;
          if (filter.key !== "todos" && count === 0) return null;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              }`}
            >
              <span>{filter.emoji}</span>
              <span>{filter.label}</span>
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${isActive ? "bg-primary-foreground/20" : "bg-muted"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Map */}
      {userLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden border border-border shadow-soft"
          style={{ height: 320 }}
        >
          <MapContainer
            center={[userLocation.lat, userLocation.lon]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap lat={userLocation.lat} lon={userLocation.lon} />
            <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
              <Popup>📍 Você está aqui</Popup>
            </Marker>
            {filteredPlaces.map((place) => (
              <Marker
                key={place.id}
                position={[place.lat, place.lon]}
                icon={createColorIcon(markerColors[place.type] || "#f59e0b", place.emoji)}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <strong>{place.emoji} {place.name}</strong>
                    {place.distance && <div>{(place.distance / 1000).toFixed(1)} km</div>}
                    {place.phone && <div>📞 {place.phone}</div>}
                    <button
                      onClick={() => openNativeNavigation(place.lat, place.lon)}
                      style={{
                        background: "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        marginTop: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      🧭 Navegar até aqui
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>
      )}

      {/* Places list */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {filteredPlaces.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-muted-foreground py-4"
            >
              Nenhum serviço encontrado para este filtro.
            </motion.p>
          ) : (
            <motion.div key={activeFilter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {filteredPlaces.slice(0, 10).map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.25 }}
                  className="bg-card rounded-xl p-3 shadow-soft border border-border flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${markerColors[place.type] || "#f59e0b"}20` }}
                  >
                    {place.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm truncate">{place.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {place.distance ? `${(place.distance / 1000).toFixed(1)} km` : ""}
                      {place.phone ? ` • ${place.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {place.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `tel:${place.phone}`}
                        className="rounded-xl h-9 w-9 p-0"
                        aria-label="Ligar"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => openNativeNavigation(place.lat, place.lon)}
                      className="rounded-xl bg-success text-success-foreground h-9 px-3 transition-transform active:scale-95"
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Ir
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3 pt-2">
        {/* Share / open my location */}
        {userLocation && (
          <Button
            onClick={() => {
              const url = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lon}`;
              if (navigator.share) {
                navigator.share({ title: "Minha localização", url }).catch(() => window.open(url, "_blank"));
              } else {
                window.open(url, "_blank");
              }
            }}
            variant="outline"
            className="w-full h-12 rounded-2xl border-primary/30 text-primary"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Compartilhar minha localização
          </Button>
        )}

        {filteredPlaces.length > 0 && (
          <Button
            onClick={() => {
              const nearest = filteredPlaces[0];
              if (nearest) openNativeNavigation(nearest.lat, nearest.lon);
            }}
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-success text-success-foreground transition-transform active:scale-[0.98]"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Me leve ao local mais seguro agora
          </Button>
        )}

        <Button
          onClick={onEmergency}
          className="w-full h-14 text-lg font-semibold rounded-2xl gradient-emergency text-accent-foreground shadow-emergency transition-transform active:scale-[0.98]"
        >
          <Phone className="w-5 h-5 mr-2" />
          Chamar guincho / emergência
        </Button>

        <Button onClick={onBack} variant="outline" className="w-full h-12 rounded-2xl">
          Voltar para orientação
        </Button>
      </motion.div>
    </div>
  );
};

export default VehicleMap;
