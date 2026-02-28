import { useWeather, getWeatherInfo } from "@/hooks/useWeather";
import { useState, useEffect } from "react";
import { getCurrentPosition } from "@/utils/geolocation";
import { Loader2 } from "lucide-react";

const WeatherBadge = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then((pos) => setCoords({ lat: pos.latitude, lng: pos.longitude }))
      .catch(() => {});
  }, []);

  const { weather, loading } = useWeather(coords?.lat, coords?.lng);

  if (!coords || loading) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-secondary/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs">
        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Clima...</span>
      </div>
    );
  }

  if (!weather) return null;

  const info = getWeatherInfo(weather.weatherCode);
  const severityClasses = {
    none: "bg-secondary/50 text-secondary-foreground",
    moderate: "bg-warning/20 text-warning",
    severe: "bg-destructive/20 text-destructive",
    extreme: "bg-destructive text-destructive-foreground animate-pulse",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold ${severityClasses[weather.severityLevel]}`}>
      <span className="text-sm">{info.emoji}</span>
      <span>{Math.round(weather.temperature)}°C</span>
      {weather.hasSevereWeather && (
        <span className="hidden sm:inline">• {info.label}</span>
      )}
    </div>
  );
};

export default WeatherBadge;
