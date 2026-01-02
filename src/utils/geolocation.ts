// Utilitário para geolocalização e geocodificação reversa

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  cep?: string;
  city?: string;
  state?: string;
  address?: string;
}

// Obtém a posição atual do usuário via GPS
export const getCurrentPosition = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada neste navegador"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Permissão de localização negada. Ative nas configurações do seu navegador."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Localização indisponível. Verifique se o GPS está ativado."));
            break;
          case error.TIMEOUT:
            reject(new Error("Tempo esgotado ao tentar obter localização."));
            break;
          default:
            reject(new Error("Erro ao obter localização."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

// Geocodificação reversa usando Nominatim (OpenStreetMap)
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeolocationResult> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR`,
      {
        headers: {
          "User-Agent": "SOS-Cidadao-App/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar endereço");
    }

    const data = await response.json();
    const address = data.address || {};

    // Extrai informações do endereço
    const city = address.city || address.town || address.village || address.municipality || "";
    const state = address.state || "";
    const postcode = address.postcode || "";
    const road = address.road || "";
    const neighbourhood = address.suburb || address.neighbourhood || "";

    // Mapeia estado para sigla
    const stateAbbr = getStateAbbreviation(state);

    return {
      latitude,
      longitude,
      cep: postcode.replace(/\D/g, ""),
      city,
      state: stateAbbr,
      address: [road, neighbourhood, city].filter(Boolean).join(", "),
    };
  } catch (error) {
    console.error("Erro na geocodificação reversa:", error);
    throw error;
  }
};

// Função principal: obtém localização e faz geocodificação reversa
export const getLocationWithAddress = async (): Promise<GeolocationResult> => {
  const coords = await getCurrentPosition();
  const result = await reverseGeocode(coords.latitude, coords.longitude);
  return result;
};

// Mapeia nome do estado para sigla
const getStateAbbreviation = (stateName: string): string => {
  const stateMap: Record<string, string> = {
    "acre": "AC",
    "alagoas": "AL",
    "amapá": "AP",
    "amazonas": "AM",
    "bahia": "BA",
    "ceará": "CE",
    "distrito federal": "DF",
    "espírito santo": "ES",
    "goiás": "GO",
    "maranhão": "MA",
    "mato grosso": "MT",
    "mato grosso do sul": "MS",
    "minas gerais": "MG",
    "pará": "PA",
    "paraíba": "PB",
    "paraná": "PR",
    "pernambuco": "PE",
    "piauí": "PI",
    "rio de janeiro": "RJ",
    "rio grande do norte": "RN",
    "rio grande do sul": "RS",
    "rondônia": "RO",
    "roraima": "RR",
    "santa catarina": "SC",
    "são paulo": "SP",
    "sergipe": "SE",
    "tocantins": "TO",
  };

  const normalized = stateName.toLowerCase().trim();
  return stateMap[normalized] || stateName.substring(0, 2).toUpperCase();
};
