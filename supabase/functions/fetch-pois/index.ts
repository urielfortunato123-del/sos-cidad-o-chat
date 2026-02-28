import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// In-memory cache with TTL
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(lat: number, lng: number, radius: number, category?: string): string {
  // Round coords to ~500m grid for cache hits
  const rlat = Math.round(lat * 200) / 200;
  const rlng = Math.round(lng * 200) / 200;
  return `${rlat},${rlng},${radius},${category || 'all'}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '');
    const lng = parseFloat(url.searchParams.get('lng') || '');
    const radius = Math.min(Math.max(parseInt(url.searchParams.get('radius') || '5000'), 100), 50000);
    const category = url.searchParams.get('category') || undefined;

    if (isNaN(lat) || isNaN(lng)) {
      return new Response(JSON.stringify({ error: 'lat and lng are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache
    const key = getCacheKey(lat, lng, radius, category);
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }

    // Build Overpass query
    const amenityMap: Record<string, string> = {
      hospital: '["amenity"~"hospital|clinic"]',
      upa: '["healthcare"="centre"]["healthcare:speciality"~"emergency|urgency"]',
      ubs: '["amenity"="clinic"]["healthcare"="centre"]',
      school: '["amenity"="school"]',
      church: '["amenity"="place_of_worship"]',
      fire_station: '["amenity"="fire_station"]',
      shelter: '["amenity"~"community_centre|social_facility"]["emergency"="assembly_point"]',
      police: '["amenity"="police"]',
    };

    let filters: string;
    if (category && amenityMap[category]) {
      filters = `node${amenityMap[category]}(around:${radius},${lat},${lng});`;
    } else {
      filters = [
        `node["amenity"="school"](around:${radius},${lat},${lng});`,
        `node["amenity"~"hospital|clinic"](around:${radius},${lat},${lng});`,
        `node["amenity"="place_of_worship"](around:${radius},${lat},${lng});`,
        `node["amenity"="fire_station"](around:${radius},${lat},${lng});`,
        `node["amenity"="police"](around:${radius},${lat},${lng});`,
        `node["amenity"~"community_centre|social_facility"](around:${radius},${lat},${lng});`,
        `node["emergency"="assembly_point"](around:${radius},${lat},${lng});`,
      ].join('\n');
    }

    const query = `[out:json][timeout:15];\n(\n${filters}\n);\nout body 100;`;

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Overpass error: ${res.status} - ${text}`);
    }

    const data = await res.json();

    // Haversine distance
    const toRad = (d: number) => d * Math.PI / 180;
    const dist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const categoryMap: Record<string, { type: string; emoji: string; label: string }> = {
      school: { type: 'school', emoji: '🏫', label: 'Escola' },
      hospital: { type: 'hospital', emoji: '🏥', label: 'Unidade de Saúde' },
      clinic: { type: 'hospital', emoji: '🏥', label: 'Unidade de Saúde' },
      place_of_worship: { type: 'church', emoji: '⛪', label: 'Igreja' },
      fire_station: { type: 'fire_station', emoji: '🚒', label: 'Bombeiros' },
      police: { type: 'police', emoji: '🚔', label: 'Polícia' },
      community_centre: { type: 'shelter', emoji: '🏛️', label: 'Abrigo' },
      social_facility: { type: 'shelter', emoji: '🏛️', label: 'Abrigo' },
    };

    const items = (data.elements || []).map((el: any) => {
      const amenity = el.tags?.amenity || el.tags?.emergency || '';
      const info = categoryMap[amenity] || { type: 'shelter', emoji: '🏛️', label: 'Abrigo' };
      const distance_km = dist(lat, lng, el.lat, el.lon);
      return {
        id: el.id.toString(),
        name: el.tags?.name || `${info.emoji} ${info.label}`,
        type: info.type,
        emoji: info.emoji,
        lat: el.lat,
        lng: el.lon,
        distance_km: Math.round(distance_km * 100) / 100,
        phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
        address: el.tags?.['addr:street'] ? `${el.tags['addr:street']}, ${el.tags['addr:housenumber'] || ''}` : null,
      };
    }).sort((a: any, b: any) => a.distance_km - b.distance_km);

    const result = { items, count: items.length, radius_m: radius, center: { lat, lng } };

    // Store in cache
    cache.set(key, { data: result, expires: Date.now() + CACHE_TTL_MS });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
