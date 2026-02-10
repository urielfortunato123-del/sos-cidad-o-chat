import { useState, useEffect } from "react";
import { MapPin, Navigation, Phone, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagnosisResult } from "@/pages/EmergenciaVeicular";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const serviceTypeMap: Record<string, { query: string; emoji: string; label: string }> = {
  oficina: { query: "car_repair", emoji: "🔧", label: "Oficina" },
  autoeletrica: { query: "car_repair", emoji: "⚡", label: "Autoelétrica" },
  guincho: { query: "car_repair", emoji: "🚗", label: "Guincho" },
  troca_oleo: { query: "car_repair", emoji: "🛢️", label: "Troca de Óleo" },
  posto: { query: "fuel", emoji: "⛽", label: "Posto" },
};

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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setError("Não foi possível obter sua localização. Ative o GPS.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyPlaces = async () => {
      setLoading(true);
      try {
        const radius = diagnosis?.risk === "red" ? 3000 : 10000;
        const query = `
          [out:json][timeout:10];
          (
            node["shop"="car_repair"](around:${radius},${userLocation.lat},${userLocation.lon});
            node["amenity"="fuel"](around:${radius},${userLocation.lat},${userLocation.lon});
            node["shop"="car_parts"](around:${radius},${userLocation.lat},${userLocation.lon});
          );
          out body 20;
        `;

        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

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
        setError("Não foi possível buscar serviços próximos. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyPlaces();
  }, [userLocation, diagnosis]);

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
      <div className="animate-slide-up flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Buscando serviços próximos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-slide-up space-y-4 text-center py-10">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
        <p className="text-foreground font-medium">{error}</p>
        <Button onClick={onBack} variant="outline" className="rounded-xl">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-4">
      <h2 className="text-xl font-bold text-foreground text-center">Serviços Próximos</h2>

      {userLocation && (
        <div className="rounded-2xl overflow-hidden border border-border shadow-soft" style={{ height: 300 }}>
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
        </div>
      )}

      {/* Places list */}
      <div className="space-y-2">
        {places.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nenhum serviço encontrado próximo. Tente ampliar a busca.
          </p>
        ) : (
          places.slice(0, 8).map((place) => (
            <div
              key={place.id}
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
                className="rounded-xl bg-success text-success-foreground shrink-0"
              >
                <Navigation className="w-4 h-4 mr-1" />
                Ir
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        {places.length > 0 && (
          <Button
            onClick={() => {
              const nearest = places[0];
              if (nearest) openNavigation(nearest.lat, nearest.lon, nearest.name);
            }}
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-success text-success-foreground"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Me leve ao local mais seguro agora
          </Button>
        )}

        <Button
          onClick={onEmergency}
          className="w-full h-14 text-lg font-semibold rounded-2xl gradient-emergency text-accent-foreground shadow-emergency"
        >
          <Phone className="w-5 h-5 mr-2" />
          Chamar guincho / emergência
        </Button>

        <Button onClick={onBack} variant="outline" className="w-full h-12 rounded-2xl">
          Voltar para orientação
        </Button>
      </div>
    </div>
  );
};

export default VehicleMap;
