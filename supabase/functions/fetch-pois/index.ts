import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

function getCacheKey(lat: number, lng: number, radius: number, category?: string): string {
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
    const radius = Math.min(Math.max(parseInt(url.searchParams.get('radius') || '10000'), 100), 50000);
    const category = url.searchParams.get('category') || undefined;

    if (isNaN(lat) || isNaN(lng)) {
      return new Response(JSON.stringify({ error: 'lat and lng are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const key = getCacheKey(lat, lng, radius, category);
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }

    // Build Overpass query - use nwr (node/way/relation) to catch buildings
    const categoryQueries: Record<string, string[]> = {
      hospital: [
        `nwr["amenity"="hospital"](around:${radius},${lat},${lng});`,
        `nwr["amenity"="clinic"](around:${radius},${lat},${lng});`,
        `nwr["healthcare"="hospital"](around:${radius},${lat},${lng});`,
        `nwr["healthcare"="clinic"](around:${radius},${lat},${lng});`,
        `nwr["amenity"="doctors"](around:${radius},${lat},${lng});`,
        `nwr["healthcare"="centre"](around:${radius},${lat},${lng});`,
      ],
      upa: [
        `nwr["healthcare"="centre"]["healthcare:speciality"~"emergency|urgency"](around:${radius},${lat},${lng});`,
        `nwr["emergency"="yes"]["amenity"="clinic"](around:${radius},${lat},${lng});`,
      ],
      ubs: [
        `nwr["amenity"="clinic"]["healthcare"="centre"](around:${radius},${lat},${lng});`,
        `nwr["healthcare"="centre"]["operator:type"="public"](around:${radius},${lat},${lng});`,
      ],
      school: [
        `nwr["amenity"="school"](around:${radius},${lat},${lng});`,
        `nwr["amenity"="kindergarten"](around:${radius},${lat},${lng});`,
        `nwr["amenity"="college"](around:${radius},${lat},${lng});`,
        `nwr["amenity"="university"](around:${radius},${lat},${lng});`,
      ],
      church: [
        `nwr["amenity"="place_of_worship"](around:${radius},${lat},${lng});`,
      ],
      fire_station: [
        `nwr["amenity"="fire_station"](around:${radius},${lat},${lng});`,
      ],
      police: [
        `nwr["amenity"="police"](around:${radius},${lat},${lng});`,
      ],
      shelter: [
        `nwr["amenity"="community_centre"](around:${radius},${lat},${lng});`,
        `nwr["amenity"="social_facility"](around:${radius},${lat},${lng});`,
        `nwr["emergency"="assembly_point"](around:${radius},${lat},${lng});`,
        `nwr["amenity"="shelter"](around:${radius},${lat},${lng});`,
        `nwr["social_facility"="shelter"](around:${radius},${lat},${lng});`,
        `nwr["building"="civic"](around:${radius},${lat},${lng});`,
      ],
    };

    let queryParts: string[];
    if (category && categoryQueries[category]) {
      queryParts = categoryQueries[category];
    } else {
      // All categories
      queryParts = Object.values(categoryQueries).flat();
    }

    const query = `[out:json][timeout:25];\n(\n${queryParts.join('\n')}\n);\nout center 300;`;

    console.log('Overpass query:', query);

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
      kindergarten: { type: 'school', emoji: '🏫', label: 'Escola' },
      college: { type: 'school', emoji: '🏫', label: 'Escola' },
      university: { type: 'school', emoji: '🎓', label: 'Universidade' },
      hospital: { type: 'hospital', emoji: '🏥', label: 'Hospital' },
      clinic: { type: 'hospital', emoji: '🏥', label: 'Posto de Saúde' },
      doctors: { type: 'hospital', emoji: '🏥', label: 'Consultório' },
      place_of_worship: { type: 'church', emoji: '⛪', label: 'Igreja' },
      fire_station: { type: 'fire_station', emoji: '🚒', label: 'Bombeiros' },
      police: { type: 'police', emoji: '🚔', label: 'Polícia' },
      community_centre: { type: 'shelter', emoji: '🏛️', label: 'Centro Comunitário' },
      social_facility: { type: 'shelter', emoji: '🏛️', label: 'Assistência Social' },
      shelter: { type: 'shelter', emoji: '🏛️', label: 'Abrigo' },
      assembly_point: { type: 'shelter', emoji: '🏛️', label: 'Ponto de Encontro' },
    };

    const seen = new Set<string>();
    const items = (data.elements || [])
      .map((el: any) => {
        // For ways/relations, use center coordinates
        const elLat = el.lat || el.center?.lat;
        const elLng = el.lon || el.center?.lon;
        if (!elLat || !elLng) return null;

        const amenity = el.tags?.amenity || el.tags?.emergency || el.tags?.healthcare || el.tags?.social_facility || '';
        const info = categoryMap[amenity] || { type: 'shelter', emoji: '🏛️', label: 'Local' };
        
        // Detect healthcare type more precisely
        if (el.tags?.healthcare === 'hospital') {
          info.type = 'hospital';
          info.emoji = '🏥';
          info.label = 'Hospital';
        } else if (el.tags?.healthcare === 'clinic' || el.tags?.healthcare === 'centre') {
          info.type = 'hospital';
          info.emoji = '🏥';
          info.label = 'Posto de Saúde';
        }
        
        // Skip civic buildings without names
        if (el.tags?.building === 'civic' && !el.tags?.name) return null;

        const distance_km = dist(lat, lng, elLat, elLng);
        const name = el.tags?.name || el.tags?.['name:pt'] || `${info.emoji} ${info.label}`;
        
        // Dedup by name+type proximity
        const dedupKey = `${name}-${info.type}-${Math.round(elLat * 1000)}-${Math.round(elLng * 1000)}`;
        if (seen.has(dedupKey)) return null;
        seen.add(dedupKey);

        return {
          id: el.id.toString(),
          name,
          type: info.type,
          emoji: info.emoji,
          lat: elLat,
          lng: elLng,
          distance_km: Math.round(distance_km * 100) / 100,
          phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
          address: el.tags?.['addr:street'] 
            ? `${el.tags['addr:street']}${el.tags['addr:housenumber'] ? ', ' + el.tags['addr:housenumber'] : ''}`
            : null,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.distance_km - b.distance_km);

    const result = { items, count: items.length, radius_m: radius, center: { lat, lng } };

    cache.set(key, { data: result, expires: Date.now() + CACHE_TTL_MS });

    console.log(`Found ${items.length} POIs for ${lat},${lng} within ${radius}m`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('fetch-pois error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
