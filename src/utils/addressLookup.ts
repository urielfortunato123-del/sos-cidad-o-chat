// Utilitário para buscar endereços via ViaCEP API
// Permite buscar por CEP, cidade ou endereço

export interface AddressResult {
  cep: string;
  city: string;
  state: string;
  neighborhood?: string;
  street?: string;
  fullAddress?: string;
}

// Busca por CEP direto
export const lookupByCep = async (cep: string): Promise<AddressResult | null> => {
  const cleanCep = cep.replace(/\D/g, "");
  
  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return null;
    }

    return {
      cep: data.cep,
      city: data.localidade,
      state: data.uf,
      neighborhood: data.bairro,
      street: data.logradouro,
      fullAddress: `${data.logradouro ? data.logradouro + ", " : ""}${data.bairro ? data.bairro + " - " : ""}${data.localidade}/${data.uf}`,
    };
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
};

// Busca por cidade/endereço (retorna lista de resultados)
export const lookupByAddress = async (
  state: string,
  city: string,
  street?: string
): Promise<AddressResult[]> => {
  try {
    const url = street
      ? `https://viacep.com.br/ws/${state}/${encodeURIComponent(city)}/${encodeURIComponent(street)}/json/`
      : `https://viacep.com.br/ws/${state}/${encodeURIComponent(city)}/json/`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.erro || !Array.isArray(data)) {
      return [];
    }

    return data.slice(0, 10).map((item: any) => ({
      cep: item.cep,
      city: item.localidade,
      state: item.uf,
      neighborhood: item.bairro,
      street: item.logradouro,
      fullAddress: `${item.logradouro ? item.logradouro + ", " : ""}${item.bairro ? item.bairro + " - " : ""}${item.localidade}/${item.uf}`,
    }));
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    return [];
  }
};

// Mapeamento de cidades para estados (para facilitar busca)
export const cityStateMap: Record<string, string> = {
  // São Paulo
  "são paulo": "SP",
  "sao paulo": "SP",
  "sp": "SP",
  "campinas": "SP",
  "bauru": "SP",
  "santos": "SP",
  "sorocaba": "SP",
  "ribeirão preto": "SP",
  "ribeirao preto": "SP",
  "são josé dos campos": "SP",
  "sao jose dos campos": "SP",
  "osasco": "SP",
  "guarulhos": "SP",
  "piracicaba": "SP",
  "jundiaí": "SP",
  "jundiai": "SP",
  "marília": "SP",
  "marilia": "SP",
  "presidente prudente": "SP",
  "araçatuba": "SP",
  "aracatuba": "SP",
  "araraquara": "SP",
  "são carlos": "SP",
  "sao carlos": "SP",
  "franca": "SP",
  "botucatu": "SP",
  
  // Rio de Janeiro
  "rio de janeiro": "RJ",
  "rio": "RJ",
  "rj": "RJ",
  "niterói": "RJ",
  "niteroi": "RJ",
  "petrópolis": "RJ",
  "petropolis": "RJ",
  "nova iguaçu": "RJ",
  "nova iguacu": "RJ",
  "duque de caxias": "RJ",
  
  // Minas Gerais
  "belo horizonte": "MG",
  "bh": "MG",
  "mg": "MG",
  "uberlândia": "MG",
  "uberlandia": "MG",
  "contagem": "MG",
  "juiz de fora": "MG",
  "betim": "MG",
  "uberaba": "MG",
  "montes claros": "MG",
  "poços de caldas": "MG",
  "pocos de caldas": "MG",
  
  // Paraná
  "curitiba": "PR",
  "cwb": "PR",
  "pr": "PR",
  "londrina": "PR",
  "maringá": "PR",
  "maringa": "PR",
  "ponta grossa": "PR",
  "cascavel": "PR",
  "foz do iguaçu": "PR",
  "foz do iguacu": "PR",
  
  // Rio Grande do Sul
  "porto alegre": "RS",
  "poa": "RS",
  "rs": "RS",
  "caxias do sul": "RS",
  "pelotas": "RS",
  "canoas": "RS",
  "santa maria": "RS",
  "novo hamburgo": "RS",
  "gravataí": "RS",
  "gravatai": "RS",
  
  // Bahia
  "salvador": "BA",
  "ssa": "BA",
  "ba": "BA",
  "feira de santana": "BA",
  "vitória da conquista": "BA",
  "vitoria da conquista": "BA",
  "camaçari": "BA",
  "camacari": "BA",
  
  // Santa Catarina
  "florianópolis": "SC",
  "florianopolis": "SC",
  "floripa": "SC",
  "sc": "SC",
  "joinville": "SC",
  "blumenau": "SC",
  "balneário camboriú": "SC",
  "balneario camboriu": "SC",
  "chapecó": "SC",
  "chapeco": "SC",
  
  // Goiás
  "goiânia": "GO",
  "goiania": "GO",
  "go": "GO",
  "aparecida de goiânia": "GO",
  "aparecida de goiania": "GO",
  "anápolis": "GO",
  "anapolis": "GO",
  
  // Pernambuco
  "recife": "PE",
  "pe": "PE",
  "olinda": "PE",
  "jaboatão dos guararapes": "PE",
  "jaboatao dos guararapes": "PE",
  
  // Ceará
  "fortaleza": "CE",
  "ce": "CE",
  "caucaia": "CE",
  "juazeiro do norte": "CE",
  
  // Distrito Federal
  "brasília": "DF",
  "brasilia": "DF",
  "df": "DF",
  
  // Espírito Santo
  "vitória": "ES",
  "vitoria": "ES",
  "es": "ES",
  "vila velha": "ES",
  "serra": "ES",
  "cariacica": "ES",
  
  // Pará
  "belém": "PA",
  "belem": "PA",
  "pa": "PA",
  "ananindeua": "PA",
  
  // Maranhão
  "são luís": "MA",
  "sao luis": "MA",
  "ma": "MA",
  
  // Amazonas
  "manaus": "AM",
  "am": "AM",
  
  // Mato Grosso
  "cuiabá": "MT",
  "cuiaba": "MT",
  "mt": "MT",
  "várzea grande": "MT",
  "varzea grande": "MT",
  
  // Mato Grosso do Sul
  "campo grande": "MS",
  "ms": "MS",
  "dourados": "MS",
  
  // Paraíba
  "joão pessoa": "PB",
  "joao pessoa": "PB",
  "pb": "PB",
  "campina grande": "PB",
  
  // Rio Grande do Norte
  "natal": "RN",
  "rn": "RN",
  "mossoró": "RN",
  "mossoro": "RN",
  
  // Alagoas
  "maceió": "AL",
  "maceio": "AL",
  "al": "AL",
  
  // Piauí
  "teresina": "PI",
  "pi": "PI",
  
  // Sergipe
  "aracaju": "SE",
  "se": "SE",
  
  // Rondônia
  "porto velho": "RO",
  "ro": "RO",
  
  // Tocantins
  "palmas": "TO",
  "to": "TO",
  
  // Acre
  "rio branco": "AC",
  "ac": "AC",
  
  // Amapá
  "macapá": "AP",
  "macapa": "AP",
  "ap": "AP",
  
  // Roraima
  "boa vista": "RR",
  "rr": "RR",
};

// Detecta se o input é CEP ou cidade/endereço
export const detectInputType = (input: string): "cep" | "address" => {
  const cleanInput = input.replace(/\D/g, "");
  
  // Se tem 8 dígitos, provavelmente é CEP
  if (cleanInput.length >= 5 && cleanInput.length <= 8 && /^\d+$/.test(cleanInput)) {
    return "cep";
  }
  
  return "address";
};

// Busca inteligente - aceita CEP, cidade ou endereço
export const smartLookup = async (
  input: string
): Promise<AddressResult | null> => {
  const trimmedInput = input.trim().toLowerCase();
  
  if (!trimmedInput) {
    return null;
  }

  // Primeiro, verifica se parece ser um CEP
  const cleanNumbers = trimmedInput.replace(/\D/g, "");
  if (cleanNumbers.length === 8) {
    return await lookupByCep(cleanNumbers);
  }

  // Tenta encontrar o estado pela cidade
  const state = cityStateMap[trimmedInput];
  if (state) {
    // Busca um CEP da cidade
    const results = await lookupByAddress(state, trimmedInput);
    if (results.length > 0) {
      return results[0];
    }
  }

  // Tenta parsear como "cidade, estado" ou "cidade - estado"
  const cityStateMatch = trimmedInput.match(/^(.+?)[,\-]\s*([a-z]{2})$/i);
  if (cityStateMatch) {
    const [, city, stateCode] = cityStateMatch;
    const results = await lookupByAddress(stateCode.toUpperCase(), city.trim());
    if (results.length > 0) {
      return results[0];
    }
  }

  // Se não encontrou, retorna null (podemos mostrar uma mensagem de erro)
  return null;
};
