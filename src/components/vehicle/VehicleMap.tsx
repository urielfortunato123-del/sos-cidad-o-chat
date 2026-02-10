import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, Phone, Loader2, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagnosisResult } from "@/pages/EmergenciaVeicular";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

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
}

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 14);
  }, [lat, lon, map]);
  return null;
}

const createColorIcon = (color: string) => {
  return new L.DivIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const VehicleMap = ({ diagnosis, onBack, onEmergency }: VehicleMapProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);
  const [locationError, setLocationError] = useState(false);

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

  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const radius = diagnosis?.risk === "red" ? 3000 : 10000;
        const query = `
          [out:json][timeout:15];
          (
            node["shop"="car_repair"](around:${radius},${userLocation.lat},${userLocation.lon});
            node["amenity"="fuel"](around:${radius},${userLocation.lat},${userLocation.lon});
            node["shop"="car_parts"](around:${radius},${userLocation.lat},${userLocation.lon});
          );
          out body 20;
        `;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        const mapped: NearbyPlace[] = (data.elements || []).map((el: any) => {
          const isFuel = el.tags?.amenity === "fuel";
          const name = el.tags?.name || (isFuel ? "Posto de Combustível" : "Oficina / Autopeças");
          const dist = getDistance(userLocation.lat, userLocation.lon, el.lat, el.lon);
          return {
            id: el.id,
            name,
            type: isFuel ? "posto" : "oficina",
            emoji: isFuel ? "⛽" : "🔧",
            lat: el.lat,
            lon: el.lon,
            distance: dist,
          };
        });

        mapped.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setPlaces(mapped);
      } catch (err) {
        console.error("Overpass API error:", err);
        setError("Não foi possível buscar serviços próximos.");
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyPlaces();
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

  const openNavigation = (lat: number, lon: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-primary" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground"
        >
          Buscando serviços próximos...
        </motion.p>
      </div>
    );
  }

  const openGoogleMapsSearch = () => {
    const query = locationError
      ? "oficina mecânica OR posto de combustível"
      : `oficina mecânica OR posto de combustível`;
    const url = userLocation
      ? `https://www.google.com/maps/search/oficina+mecanica+posto+combustivel/@${userLocation.lat},${userLocation.lon},14z`
      : `https://www.google.com/maps/search/oficina+mecanica+posto+combustivel`;
    window.open(url, "_blank");
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-5 text-center py-8"
      >
        <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
        <p className="text-foreground font-medium">{error}</p>

        <div className="space-y-3">
          {!locationError && (
            <Button
              onClick={() => setRetryCount(c => c + 1)}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          )}

          <Button
            onClick={openGoogleMapsSearch}
            className="w-full h-12 rounded-2xl bg-success text-success-foreground"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir no Google Maps
          </Button>

          <Button onClick={onBack} variant="outline" className="w-full h-12 rounded-2xl">
            Voltar
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold text-foreground text-center"
      >
        Serviços Próximos
      </motion.h2>

      {userLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden border border-border shadow-soft"
          style={{ height: 300 }}
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
            <Marker
              position={[userLocation.lat, userLocation.lon]}
              icon={createColorIcon("#3b82f6")}
            >
              <Popup>Você está aqui</Popup>
            </Marker>
            {places.map((place) => (
              <Marker
                key={place.id}
                position={[place.lat, place.lon]}
                icon={createColorIcon(place.type === "posto" ? "#22c55e" : "#f59e0b")}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{place.emoji} {place.name}</strong>
                    <br />
                    {place.distance && `${(place.distance / 1000).toFixed(1)} km`}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>
      )}

      {/* Places list */}
      <div className="space-y-2">
        {places.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nenhum serviço encontrado próximo. Tente ampliar a busca.
          </p>
        ) : (
          places.slice(0, 8).map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.06, duration: 0.3 }}
              className="bg-card rounded-xl p-4 shadow-soft border border-border flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{place.emoji}</span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{place.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {place.distance ? `${(place.distance / 1000).toFixed(1)} km` : ""}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => openNavigation(place.lat, place.lon, place.name)}
                className="rounded-xl bg-success text-success-foreground shrink-0 transition-transform active:scale-95"
              >
                <Navigation className="w-4 h-4 mr-1" />
                Ir
              </Button>
            </motion.div>
          ))
        )}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 pt-2"
      >
        {places.length > 0 && (
          <Button
            onClick={() => {
              const nearest = places[0];
              if (nearest) openNavigation(nearest.lat, nearest.lon, nearest.name);
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
