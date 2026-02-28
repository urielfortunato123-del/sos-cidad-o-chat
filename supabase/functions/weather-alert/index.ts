import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all subscriptions with lat/lng
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .not("lat", "is", null)
      .not("lng", "is", null);

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ message: "No subscriptions", alerts: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by unique lat/lng (rounded to 2 decimals to avoid duplicate calls)
    const uniqueLocations = new Map<string, { lat: number; lng: number }>();
    for (const sub of subs) {
      const key = `${sub.lat!.toFixed(2)},${sub.lng!.toFixed(2)}`;
      if (!uniqueLocations.has(key)) {
        uniqueLocations.set(key, { lat: sub.lat!, lng: sub.lng! });
      }
    }

    const weatherCache = new Map<string, { precipProb: number; precip: number; wind: number }>();

    // Fetch weather for each unique location
    for (const [key, loc] of uniqueLocations) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&hourly=precipitation,precipitation_probability,wind_speed_10m&forecast_hours=3&timezone=America/Sao_Paulo`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const hourly = data.hourly;
          // Get max values in next 3 hours
          const maxPrecipProb = Math.max(...(hourly.precipitation_probability || [0]));
          const maxPrecip = Math.max(...(hourly.precipitation || [0]));
          const maxWind = Math.max(...(hourly.wind_speed_10m || [0]));
          weatherCache.set(key, { precipProb: maxPrecipProb, precip: maxPrecip, wind: maxWind });
        }
      } catch (e) {
        console.error(`Weather fetch error for ${key}:`, e);
      }
    }

    let alertsSent = 0;
    const alerts: Array<{ endpoint: string; level: string; message: string }> = [];

    for (const sub of subs) {
      const key = `${sub.lat!.toFixed(2)},${sub.lng!.toFixed(2)}`;
      const weather = weatherCache.get(key);
      if (!weather) continue;

      let level = "";
      let message = "";

      if (weather.precipProb >= 90 && weather.precip >= 10) {
        level = "extreme";
        message = "🚨 Risco alto de enchente/deslizamento. Evite áreas de risco e procure local seguro.";
      } else if (weather.precipProb >= 80 && weather.precip >= 5) {
        level = "warning";
        message = "⚠️ Alerta de chuva forte na sua região. Prepare-se.";
      } else if (weather.wind >= 60) {
        level = "wind";
        message = `🌬️ Ventos fortes de ${Math.round(weather.wind)}km/h previstos. Cuidado com objetos soltos.`;
      }

      if (level) {
        alerts.push({ endpoint: sub.endpoint, level, message });
        alertsSent++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${subs.length} subscriptions, ${alertsSent} alerts triggered`,
        alerts,
        weatherData: Object.fromEntries(weatherCache),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Weather alert error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
