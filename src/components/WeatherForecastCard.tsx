import { useState, useEffect } from "react";
import { useWeather, getWeatherInfo, type HourlyForecast } from "@/hooks/useWeather";
import { getCurrentPosition } from "@/utils/geolocation";
import { Cloud, Droplets, Wind, Bell, BellOff, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WeatherForecastCard = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentPosition()
      .then((pos) => setCoords({ lat: pos.latitude, lng: pos.longitude }))
      .catch(() => {});
  }, []);

  // Check if alerts were enabled previously
  useEffect(() => {
    const stored = localStorage.getItem("sos-weather-alerts-enabled");
    if (stored === "true") setAlertsEnabled(true);
  }, []);

  const { weather, loading } = useWeather(coords?.lat, coords?.lng);

  const toggleAlerts = async () => {
    setSubscribing(true);
    try {
      if (alertsEnabled) {
        // Unsubscribe - remove from DB
        await supabase.from("push_subscriptions").delete().eq("endpoint", `browser-${window.location.hostname}`);
        localStorage.setItem("sos-weather-alerts-enabled", "false");
        setAlertsEnabled(false);
        toast({ title: "🔕 Alertas desativados" });
      } else {
        // Request notification permission
        if ("Notification" in window) {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            toast({ title: "Permissão negada", description: "Ative nas configurações do navegador.", variant: "destructive" });
            return;
          }
        }

        // Store subscription for the edge function to query weather
        const subData = {
          endpoint: `browser-${window.location.hostname}`,
          p256dh: "browser-notification",
          auth: "browser-notification",
          lat: coords?.lat,
          lng: coords?.lng,
        };

        await supabase.from("push_subscriptions").upsert(subData as any, { onConflict: "endpoint" });
        localStorage.setItem("sos-weather-alerts-enabled", "true");
        setAlertsEnabled(true);
        toast({ title: "🔔 Alertas ativados!", description: "Você receberá avisos de clima severo." });
      }
    } catch (err) {
      console.error("Push subscription error:", err);
      toast({ title: "Erro", description: "Não foi possível configurar alertas.", variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  if (!coords || loading) return null;
  if (!weather) return null;

  const info = getWeatherInfo(weather.weatherCode);
  const next6h = weather.hourlyForecast.slice(0, 6);
  const maxPrecip = Math.max(...next6h.map(h => h.precipitation), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="max-w-md mx-auto w-full"
    >
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-medium">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{info.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{Math.round(weather.temperature)}°C</span>
                <span className="text-sm text-muted-foreground">{info.label}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{weather.humidity}%</span>
                <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{Math.round(weather.windSpeed)}km/h</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {weather.hasSevereWeather && (
              <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full font-semibold">
                ⚠️ Alerta
              </span>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {/* Severe weather alert banner */}
                {weather.hasSevereWeather && (
                  <div className={`rounded-xl p-3 text-sm font-medium ${
                    weather.severityLevel === "extreme" ? "bg-destructive/20 text-destructive animate-pulse" :
                    weather.severityLevel === "severe" ? "bg-destructive/15 text-destructive" :
                    "bg-warning/20 text-warning"
                  }`}>
                    {weather.alertMessage}
                  </div>
                )}

                {/* 6h Precipitation chart */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Cloud className="w-3 h-3" /> Chuva nas próximas 6h
                  </h4>
                  <div className="flex items-end gap-1 h-16">
                    {next6h.map((h, i) => {
                      const height = maxPrecip > 0 ? (h.precipitation / maxPrecip) * 100 : 0;
                      const hour = new Date(h.time).getHours();
                      const barColor = h.precipitation >= 10 ? "bg-destructive" :
                        h.precipitation >= 5 ? "bg-warning" :
                        h.precipitation > 0 ? "bg-primary" : "bg-muted";

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">
                            {h.precipitation > 0 ? `${h.precipitation.toFixed(1)}` : ""}
                          </span>
                          <div className="w-full relative" style={{ height: "40px" }}>
                            <div
                              className={`absolute bottom-0 w-full rounded-t ${barColor} transition-all`}
                              style={{ height: `${Math.max(height, 4)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">{hour}h</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary" /> Leve</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-warning" /> Moderada</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-destructive" /> Forte</span>
                  </div>
                </div>

                {/* Precipitation probability for next 6h */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">Probabilidade de chuva</h4>
                  <div className="flex gap-1">
                    {next6h.map((h, i) => {
                      const hour = new Date(h.time).getHours();
                      return (
                        <div key={i} className="flex-1 text-center">
                          <div className="text-xs font-bold text-foreground">{h.precipitationProbability}%</div>
                          <div className="text-[10px] text-muted-foreground">{hour}h</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alert toggle */}
                <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    {alertsEnabled ? <Bell className="w-4 h-4 text-success" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        Alertas {alertsEnabled ? "ON" : "OFF"}
                      </span>
                      <p className="text-[10px] text-muted-foreground">Receba avisos de clima severo</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={alertsEnabled ? "outline" : "default"}
                    onClick={toggleAlerts}
                    disabled={subscribing}
                    className="rounded-lg text-xs h-8"
                  >
                    {subscribing ? <Loader2 className="w-3 h-3 animate-spin" /> : alertsEnabled ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default WeatherForecastCard;
