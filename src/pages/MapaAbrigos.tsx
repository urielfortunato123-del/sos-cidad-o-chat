import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Loader2, Navigation, Phone, School, Church, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCurrentPosition } from "@/utils/geolocation";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import { useAccessLog } from "@/hooks/useAccessLog";
import "leaflet/dist/leaflet.css";

interface ShelterPlace {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  distance?: number;
  emoji: string;
}

const shelterFilters = [
  { id: "all", label: "Todos", emoji: "📍" },
  { id: "school", label: "Escolas", emoji: "🏫" },
  { id: "hospital", label: "Saúde", emoji: "🏥" },
  { id: "church", label: "Igrejas", emoji: "⛪" },
  { id: "shelter", label: "Abrigos", emoji: "🏛️" },
];

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(position, 14); }, [position, map]);
  return null;
}

function createIcon(emoji: string, color: string) {
  return L.divIcon({
    html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${emoji}</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

const userIcon = L.divIcon({
  html: `<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.5)"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const MapaAbrigos = () => {
  useAccessLog('/mapa-abrigos');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [places, setPlaces] = useState<ShelterPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const pos = await getCurrentPosition();
        setUserPos([pos.latitude, pos.longitude]);
        await fetchShelters(pos.latitude, pos.longitude);
      } catch {
        toast({ title: "Erro de GPS", description: "Ative a localização.", variant: "destructive" });
        setLoading(false);
      }
    })();
  }, []);

  const fetchShelters = async (lat: number, lng: number) => {
    try {
      const radius = 5000;
      const query = `
        [out:json][timeout:15];
        (
          node["amenity"="school"](around:${radius},${lat},${lng});
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="clinic"](around:${radius},${lat},${lng});
          node["amenity"="place_of_worship"](around:${radius},${lat},${lng});
          node["amenity"="community_centre"](around:${radius},${lat},${lng});
          node["amenity"="social_facility"](around:${radius},${lat},${lng});
          node["emergency"="assembly_point"](around:${radius},${lat},${lng});
        );
        out body 50;
      `;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const data = await res.json();
      const results: ShelterPlace[] = data.elements?.map((el: any) => {
        const amenity = el.tags?.amenity || el.tags?.emergency || "";
        let type = "shelter";
        let emoji = "🏛️";

        if (amenity === "school") { type = "school"; emoji = "🏫"; }
        else if (["hospital", "clinic"].includes(amenity)) { type = "hospital"; emoji = "🏥"; }
        else if (amenity === "place_of_worship") { type = "church"; emoji = "⛪"; }
        else { type = "shelter"; emoji = "🏛️"; }

        const dist = getDistance(lat, lng, el.lat, el.lon);

        return {
          id: el.id.toString(),
          name: el.tags?.name || `${emoji} ${type === "school" ? "Escola" : type === "hospital" ? "Unidade de Saúde" : type === "church" ? "Igreja" : "Abrigo"}`,
          type,
          lat: el.lat,
          lng: el.lon,
          distance: dist,
          emoji,
        };
      }) || [];

      results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setPlaces(results);
    } catch {
      toast({ title: "Erro ao buscar abrigos", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const openNavigation = (lat: number, lng: number) => {
    const url = /iPhone|iPad/i.test(navigator.userAgent) ? `maps://maps.apple.com/?daddr=${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const filtered = activeFilter === "all" ? places : places.filter(p => p.type === activeFilter);
  const iconColors: Record<string, string> = { school: "#3b82f6", hospital: "#ef4444", church: "#8b5cf6", shelter: "#22c55e" };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary-foreground hover:bg-primary-foreground/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <MapPin className="w-6 h-6" />
          <h1 className="text-lg font-bold flex-1">Mapa de Abrigos</h1>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-card border-b border-border px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {shelterFilters.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeFilter === f.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f.emoji} {f.label}
              {f.id !== "all" && ` (${places.filter(p => p.type === f.id).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground">Buscando abrigos próximos...</p>
            <p className="text-muted-foreground">Obtendo sua localização</p>
          </div>
        </div>
      ) : userPos ? (
        <div className="flex-1 flex flex-col">
          {/* Map */}
          <div className="h-[45vh]">
            <MapContainer center={userPos} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
              <RecenterMap position={userPos} />
              <Marker position={userPos} icon={userIcon}>
                <Popup>📍 Você está aqui</Popup>
              </Marker>
              {filtered.map(place => (
                <Marker key={place.id} position={[place.lat, place.lng]} icon={createIcon(place.emoji, iconColors[place.type] || "#22c55e")}>
                  <Popup>
                    <div className="text-center">
                      <strong>{place.name}</strong>
                      <br />
                      <span className="text-sm">{place.distance?.toFixed(1)} km</span>
                      <br />
                      <button onClick={() => openNavigation(place.lat, place.lng)} className="text-blue-600 underline text-sm mt-1">Navegar →</button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="font-bold text-foreground text-lg">{filtered.length} locais encontrados</h3>
            {filtered.slice(0, 20).map(place => (
              <motion.button
                key={place.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => openNavigation(place.lat, place.lng)}
                className="w-full bg-card rounded-xl p-4 border border-border shadow-soft flex items-center gap-3 text-left active:scale-[0.98] transition-all"
              >
                <span className="text-2xl">{place.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{place.name}</p>
                  <p className="text-sm text-muted-foreground">{place.distance?.toFixed(1)} km de distância</p>
                </div>
                <Navigation className="w-5 h-5 text-primary flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">GPS não disponível</p>
            <p className="text-muted-foreground mb-4">Ative a localização e tente novamente</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaAbrigos;
