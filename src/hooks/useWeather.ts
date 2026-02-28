import { useState, useEffect, useRef } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export interface HourlyForecast {
  time: string;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  // Alerts
  hasSevereWeather: boolean;
  severityLevel: "none" | "moderate" | "severe" | "extreme";
  alertMessage: string;
  // Hourly
  hourlyForecast: HourlyForecast[];
}

const WMO_CODES: Record<number, { label: string; emoji: string; severe: boolean }> = {
  0: { label: "Céu limpo", emoji: "☀️", severe: false },
  1: { label: "Poucas nuvens", emoji: "🌤️", severe: false },
  2: { label: "Parcialmente nublado", emoji: "⛅", severe: false },
  3: { label: "Nublado", emoji: "☁️", severe: false },
  45: { label: "Neblina", emoji: "🌫️", severe: false },
  48: { label: "Neblina com geada", emoji: "🌫️", severe: false },
  51: { label: "Garoa leve", emoji: "🌦️", severe: false },
  53: { label: "Garoa moderada", emoji: "🌦️", severe: false },
  55: { label: "Garoa forte", emoji: "🌧️", severe: false },
  61: { label: "Chuva leve", emoji: "🌧️", severe: false },
  63: { label: "Chuva moderada", emoji: "🌧️", severe: false },
  65: { label: "Chuva forte", emoji: "🌧️", severe: true },
  71: { label: "Neve leve", emoji: "🌨️", severe: false },
  73: { label: "Neve moderada", emoji: "🌨️", severe: false },
  75: { label: "Neve forte", emoji: "❄️", severe: true },
  77: { label: "Granizo", emoji: "🧊", severe: true },
  80: { label: "Pancadas leves", emoji: "🌦️", severe: false },
  81: { label: "Pancadas moderadas", emoji: "🌧️", severe: false },
  82: { label: "Pancadas fortes", emoji: "⛈️", severe: true },
  85: { label: "Neve em pancadas", emoji: "🌨️", severe: true },
  86: { label: "Neve forte em pancadas", emoji: "❄️", severe: true },
  95: { label: "Tempestade", emoji: "⛈️", severe: true },
  96: { label: "Tempestade com granizo", emoji: "⛈️", severe: true },
  99: { label: "Tempestade severa", emoji: "🌪️", severe: true },
};

export function getWeatherInfo(code: number) {
  return WMO_CODES[code] || { label: "Desconhecido", emoji: "🌡️", severe: false };
}

function getSeverity(code: number, windSpeed: number, precipitation: number): WeatherData["severityLevel"] {
  if (code >= 95 || windSpeed > 80 || precipitation > 30) return "extreme";
  if (code >= 82 || code === 77 || windSpeed > 60 || precipitation > 15) return "severe";
  if (code >= 65 || windSpeed > 40 || precipitation > 5) return "moderate";
  return "none";
}

function getAlertMessage(code: number, windSpeed: number, precipitation: number): string {
  const info = getWeatherInfo(code);
  const parts: string[] = [];
  if (info.severe) parts.push(info.label);
  if (windSpeed > 60) parts.push(`Ventos de ${Math.round(windSpeed)} km/h`);
  if (precipitation > 10) parts.push(`${Math.round(precipitation)}mm de chuva`);
  return parts.length > 0 ? `⚠️ ${parts.join(" • ")}` : "";
}

export function useWeather(lat?: number, lng?: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendNotification, requestPermission } = useNotifications();
  const lastAlertRef = useRef<string | null>(null);

  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    requestPermission();

    let cancelled = false;
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&hourly=precipitation,precipitation_probability,wind_speed_10m&forecast_hours=24&timezone=America%2FSao_Paulo`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather API error");
        const data = await res.json();
        const c = data.current;

        if (!cancelled) {
          const code = c.weather_code;
          const wind = c.wind_speed_10m;
          const precip = c.precipitation;
          const severity = getSeverity(code, wind, precip);

          // Parse hourly data
          const hourly: HourlyForecast[] = (data.hourly?.time || []).map((t: string, i: number) => ({
            time: t,
            precipitation: data.hourly.precipitation?.[i] ?? 0,
            precipitationProbability: data.hourly.precipitation_probability?.[i] ?? 0,
            windSpeed: data.hourly.wind_speed_10m?.[i] ?? 0,
          }));

          const newWeather: WeatherData = {
            temperature: c.temperature_2m,
            apparentTemperature: c.apparent_temperature,
            humidity: c.relative_humidity_2m,
            windSpeed: wind,
            weatherCode: code,
            isDay: c.is_day === 1,
            precipitation: precip,
            hasSevereWeather: severity !== "none",
            severityLevel: severity,
            alertMessage: getAlertMessage(code, wind, precip),
            hourlyForecast: hourly,
          };

          setWeather(newWeather);

          if (newWeather.hasSevereWeather && lastAlertRef.current !== newWeather.severityLevel) {
            lastAlertRef.current = newWeather.severityLevel;
            const info = getWeatherInfo(code);
            sendNotification(
              `${info.emoji} Alerta Meteorológico`,
              {
                body: newWeather.alertMessage,
                tag: "weather-alert",
                requireInteraction: newWeather.severityLevel === "extreme",
              }
            );
          } else if (!newWeather.hasSevereWeather) {
            lastAlertRef.current = null;
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [lat, lng]);

  return { weather, loading, error };
}
