// Contatos por ESTADO para fallback quando cidade específica não estiver cadastrada
// Dados baseados na lista oficial da ANEEL e concessionárias de saneamento

export interface StateContacts {
  state: string;
  stateName: string;
  energia: {
    company: string;
    phones: { label: string; number: string }[];
    website?: string;
  };
  agua: {
    company: string;
    phones: { label: string; number: string }[];
    website?: string;
  };
  gas?: {
    company: string;
    phones: { label: string; number: string }[];
    website?: string;
  };
}

// Base de dados de contatos por estado
export const stateDatabase: Record<string, StateContacts> = {
  // NORTE
  AC: {
    state: "AC",
    stateName: "Acre",
    energia: {
      company: "Energisa Acre",
      phones: [
        { label: "Central", number: "0800-647-7196" },
        { label: "Ouvidoria", number: "(68) 3212-5740" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Depasa",
      phones: [
        { label: "Central", number: "(68) 3223-4100" },
      ],
    },
  },

  AM: {
    state: "AM",
    stateName: "Amazonas",
    energia: {
      company: "Amazonas Energia",
      phones: [
        { label: "Central", number: "0800-701-3001" },
        { label: "Ouvidoria", number: "0800-095-1247" },
      ],
      website: "www.amazonasenergia.com",
    },
    agua: {
      company: "Águas de Manaus",
      phones: [
        { label: "Central", number: "0800-092-0195" },
        { label: "Atendimento", number: "(92) 2129-0195" },
      ],
      website: "www.aguasdemanaus.com.br",
    },
  },

  AP: {
    state: "AP",
    stateName: "Amapá",
    energia: {
      company: "CEA (Companhia de Eletricidade do Amapá)",
      phones: [
        { label: "Ouvidoria", number: "0800-096-1406" },
        { label: "Atendimento", number: "(96) 3212-1393" },
      ],
      website: "cea.amapa.gov.br",
    },
    agua: {
      company: "Caesa",
      phones: [
        { label: "Central", number: "(96) 3212-3200" },
      ],
    },
  },

  PA: {
    state: "PA",
    stateName: "Pará",
    energia: {
      company: "Equatorial Pará (Celpa)",
      phones: [
        { label: "Central", number: "0800-910-196" },
        { label: "Ouvidoria", number: "0800-091-8500" },
      ],
      website: "pa.equatorialenergia.com.br",
    },
    agua: {
      company: "Cosanpa",
      phones: [
        { label: "Central", number: "0800-280-0115" },
        { label: "Atendimento", number: "(91) 3321-2000" },
      ],
      website: "www.cosanpa.pa.gov.br",
    },
  },

  RO: {
    state: "RO",
    stateName: "Rondônia",
    energia: {
      company: "Energisa Rondônia",
      phones: [
        { label: "Central", number: "0800-647-0120" },
        { label: "Ouvidoria", number: "0800-647-7992" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Caerd",
      phones: [
        { label: "Central", number: "(69) 3216-8800" },
      ],
    },
  },

  RR: {
    state: "RR",
    stateName: "Roraima",
    energia: {
      company: "Roraima Energia",
      phones: [
        { label: "Central", number: "0800-070-19120" },
        { label: "Ouvidoria", number: "0800-095-1152" },
      ],
      website: "www.roraimaenergia.com.br",
    },
    agua: {
      company: "Caer",
      phones: [
        { label: "Central", number: "(95) 2121-1200" },
      ],
    },
  },

  TO: {
    state: "TO",
    stateName: "Tocantins",
    energia: {
      company: "Energisa Tocantins",
      phones: [
        { label: "Central", number: "0800-721-3330" },
        { label: "Ouvidoria", number: "0800-646-1196" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Saneatins (BRK)",
      phones: [
        { label: "Central", number: "0800-644-0195" },
      ],
      website: "www.brkambiental.com.br",
    },
  },

  // NORDESTE
  AL: {
    state: "AL",
    stateName: "Alagoas",
    energia: {
      company: "Equatorial Alagoas",
      phones: [
        { label: "Central", number: "0800-082-0196" },
        { label: "Ouvidoria", number: "0800-721-0082" },
      ],
      website: "al.equatorialenergia.com.br",
    },
    agua: {
      company: "Casal",
      phones: [
        { label: "Central", number: "0800-082-0115" },
        { label: "Atendimento", number: "(82) 3315-3300" },
      ],
    },
  },

  BA: {
    state: "BA",
    stateName: "Bahia",
    energia: {
      company: "Neoenergia Coelba",
      phones: [
        { label: "Central", number: "116" },
        { label: "Ouvidoria", number: "0800-071-7676" },
      ],
      website: "www.neoenergia.com/web/bahia",
    },
    agua: {
      company: "Embasa",
      phones: [
        { label: "Central", number: "0800-071-5195" },
        { label: "Atendimento", number: "(71) 3370-5195" },
      ],
      website: "www.embasa.ba.gov.br",
    },
  },

  CE: {
    state: "CE",
    stateName: "Ceará",
    energia: {
      company: "Enel Ceará",
      phones: [
        { label: "Central", number: "0800-285-0196" },
        { label: "Ouvidoria", number: "0800-280-4100" },
      ],
      website: "www.enel.com.br/pt-ceara",
    },
    agua: {
      company: "Cagece",
      phones: [
        { label: "Central", number: "0800-275-0195" },
        { label: "Atendimento", number: "(85) 3195-3195" },
      ],
      website: "www.cagece.com.br",
    },
  },

  MA: {
    state: "MA",
    stateName: "Maranhão",
    energia: {
      company: "Equatorial Maranhão (Cemar)",
      phones: [
        { label: "Central", number: "116" },
        { label: "Ouvidoria", number: "0800-286-9803" },
      ],
      website: "ma.equatorialenergia.com.br",
    },
    agua: {
      company: "Caema",
      phones: [
        { label: "Central", number: "0800-085-0115" },
        { label: "Atendimento", number: "(98) 3232-2000" },
      ],
    },
  },

  PB: {
    state: "PB",
    stateName: "Paraíba",
    energia: {
      company: "Energisa Paraíba",
      phones: [
        { label: "Central", number: "0800-083-0196" },
        { label: "Ouvidoria", number: "0800-083-8585" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Cagepa",
      phones: [
        { label: "Central", number: "0800-083-0195" },
        { label: "Atendimento", number: "(83) 3218-5000" },
      ],
      website: "www.cagepa.pb.gov.br",
    },
  },

  PE: {
    state: "PE",
    stateName: "Pernambuco",
    energia: {
      company: "Neoenergia Pernambuco (Celpe)",
      phones: [
        { label: "Central", number: "116" },
        { label: "Ouvidoria", number: "0800-282-5599" },
      ],
      website: "www.neoenergia.com/web/pernambuco",
    },
    agua: {
      company: "Compesa",
      phones: [
        { label: "Central", number: "0800-081-0195" },
        { label: "Atendimento", number: "(81) 3412-9600" },
      ],
      website: "www.compesa.com.br",
    },
  },

  PI: {
    state: "PI",
    stateName: "Piauí",
    energia: {
      company: "Equatorial Piauí (Cepisa)",
      phones: [
        { label: "Central", number: "0800-086-800" },
        { label: "Ouvidoria", number: "0800-721-0164" },
      ],
      website: "pi.equatorialenergia.com.br",
    },
    agua: {
      company: "Agespisa",
      phones: [
        { label: "Central", number: "0800-086-0195" },
        { label: "Atendimento", number: "(86) 3228-8200" },
      ],
    },
  },

  RN: {
    state: "RN",
    stateName: "Rio Grande do Norte",
    energia: {
      company: "Neoenergia Cosern",
      phones: [
        { label: "Central", number: "116" },
        { label: "Ouvidoria", number: "0800-084-0404" },
      ],
      website: "www.neoenergia.com/web/rn",
    },
    agua: {
      company: "Caern",
      phones: [
        { label: "Central", number: "0800-081-0115" },
        { label: "Atendimento", number: "(84) 3232-4001" },
      ],
      website: "www.caern.com.br",
    },
  },

  SE: {
    state: "SE",
    stateName: "Sergipe",
    energia: {
      company: "Energisa Sergipe",
      phones: [
        { label: "Central", number: "0800-079-0196" },
        { label: "Ouvidoria", number: "0800-079-0903" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Deso",
      phones: [
        { label: "Central", number: "0800-079-0195" },
        { label: "Atendimento", number: "(79) 3226-6800" },
      ],
    },
  },

  // CENTRO-OESTE
  DF: {
    state: "DF",
    stateName: "Distrito Federal",
    energia: {
      company: "Neoenergia Brasília",
      phones: [
        { label: "Central", number: "0800-644-6116" },
        { label: "Emergência", number: "116" },
      ],
      website: "www.neoenergia.com/web/brasilia",
    },
    agua: {
      company: "Caesb",
      phones: [
        { label: "Central", number: "115" },
        { label: "Atendimento", number: "(61) 3213-0115" },
      ],
      website: "www.caesb.df.gov.br",
    },
  },

  GO: {
    state: "GO",
    stateName: "Goiás",
    energia: {
      company: "Equatorial Goiás",
      phones: [
        { label: "Central", number: "0800-062-0196" },
        { label: "Ouvidoria", number: "0800-062-1500" },
      ],
      website: "go.equatorialenergia.com.br",
    },
    agua: {
      company: "Saneago",
      phones: [
        { label: "Central", number: "0800-645-0115" },
        { label: "Atendimento", number: "(62) 4002-9998" },
      ],
      website: "www.saneago.com.br",
    },
  },

  MS: {
    state: "MS",
    stateName: "Mato Grosso do Sul",
    energia: {
      company: "Energisa Mato Grosso do Sul",
      phones: [
        { label: "Central", number: "0800-722-7272" },
        { label: "Ouvidoria", number: "0800-722-0446" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Sanesul",
      phones: [
        { label: "Central", number: "0800-647-0195" },
        { label: "Atendimento", number: "(67) 3320-6000" },
      ],
      website: "www.sanesul.ms.gov.br",
    },
  },

  MT: {
    state: "MT",
    stateName: "Mato Grosso",
    energia: {
      company: "Energisa Mato Grosso",
      phones: [
        { label: "Central", number: "0800-646-4196" },
        { label: "Ouvidoria", number: "0800-651-111" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Águas Cuiabá",
      phones: [
        { label: "Central", number: "0800-646-6115" },
        { label: "Atendimento", number: "(65) 3612-4000" },
      ],
    },
  },

  // SUDESTE
  ES: {
    state: "ES",
    stateName: "Espírito Santo",
    energia: {
      company: "EDP Espírito Santo",
      phones: [
        { label: "Central", number: "0800-721-0707" },
        { label: "Ouvidoria", number: "0800-721-3321" },
      ],
      website: "www.edp.com.br",
    },
    agua: {
      company: "Cesan",
      phones: [
        { label: "Central", number: "0800-727-0115" },
        { label: "Atendimento", number: "(27) 3198-0115" },
      ],
      website: "www.cesan.com.br",
    },
    gas: {
      company: "BR Distribuidora / GNV",
      phones: [
        { label: "Emergência Gás", number: "193" },
      ],
    },
  },

  MG: {
    state: "MG",
    stateName: "Minas Gerais",
    energia: {
      company: "Cemig",
      phones: [
        { label: "Central", number: "116" },
        { label: "Ouvidoria", number: "0800-728-3838" },
      ],
      website: "www.cemig.com.br",
    },
    agua: {
      company: "Copasa",
      phones: [
        { label: "Central", number: "115" },
        { label: "Atendimento", number: "0800-0-115-115" },
      ],
      website: "www.copasa.com.br",
    },
    gas: {
      company: "Gasmig",
      phones: [
        { label: "Emergência", number: "0800-720-0117" },
        { label: "Atendimento", number: "(31) 3516-3100" },
      ],
      website: "www.gasmig.com.br",
    },
  },

  RJ: {
    state: "RJ",
    stateName: "Rio de Janeiro",
    energia: {
      company: "Enel Rio / Light",
      phones: [
        { label: "Enel RJ", number: "0800-2800-120" },
        { label: "Light", number: "0800-021-0196" },
        { label: "Ouvidoria Enel", number: "0800-00-120-00" },
      ],
      website: "www.enel.com.br",
    },
    agua: {
      company: "Cedae / Águas do Rio",
      phones: [
        { label: "Cedae", number: "0800-282-1195" },
        { label: "Águas do Rio", number: "0800-195-0195" },
      ],
      website: "www.cedae.com.br",
    },
    gas: {
      company: "Naturgy",
      phones: [
        { label: "Emergência", number: "0800-024-0197" },
        { label: "Atendimento", number: "0800-760-8000" },
      ],
      website: "www.naturgy.com.br",
    },
  },

  SP: {
    state: "SP",
    stateName: "São Paulo",
    energia: {
      company: "Enel SP / CPFL / EDP",
      phones: [
        { label: "Enel SP", number: "0800-72-72-120" },
        { label: "CPFL", number: "0800-010-0010" },
        { label: "EDP SP", number: "0800-721-0707" },
      ],
      website: "www.enel.com.br",
    },
    agua: {
      company: "Sabesp",
      phones: [
        { label: "Central", number: "195" },
        { label: "Atendimento", number: "0800-055-0195" },
      ],
      website: "www.sabesp.com.br",
    },
    gas: {
      company: "Comgás",
      phones: [
        { label: "Emergência", number: "0800-011-0197" },
        { label: "Atendimento", number: "0800-011-1850" },
      ],
      website: "www.comgas.com.br",
    },
  },

  // SUL
  PR: {
    state: "PR",
    stateName: "Paraná",
    energia: {
      company: "Copel",
      phones: [
        { label: "Central", number: "0800-510-0116" },
        { label: "Ouvidoria", number: "0800-647-0606" },
      ],
      website: "www.copel.com",
    },
    agua: {
      company: "Sanepar",
      phones: [
        { label: "Central", number: "0800-200-0115" },
        { label: "Atendimento", number: "(41) 3330-3115" },
      ],
      website: "www.sanepar.com.br",
    },
    gas: {
      company: "Compagas",
      phones: [
        { label: "Emergência", number: "0800-41-9197" },
        { label: "Atendimento", number: "(41) 3312-1800" },
      ],
      website: "www.compagas.com.br",
    },
  },

  RS: {
    state: "RS",
    stateName: "Rio Grande do Sul",
    energia: {
      company: "CEEE Equatorial / RGE",
      phones: [
        { label: "CEEE", number: "0800-721-2333" },
        { label: "RGE", number: "0800-970-0900" },
      ],
      website: "ceee.equatorialenergia.com.br",
    },
    agua: {
      company: "Corsan",
      phones: [
        { label: "Central", number: "0800-646-6444" },
        { label: "Atendimento", number: "(51) 3215-5000" },
      ],
      website: "www.corsan.com.br",
    },
    gas: {
      company: "Sulgás",
      phones: [
        { label: "Emergência", number: "0800-51-00-197" },
        { label: "Atendimento", number: "(51) 3216-9300" },
      ],
      website: "www.sulgas.rs.gov.br",
    },
  },

  SC: {
    state: "SC",
    stateName: "Santa Catarina",
    energia: {
      company: "Celesc",
      phones: [
        { label: "Central", number: "0800-48-00-196" },
        { label: "Ouvidoria", number: "0800-048-3232" },
      ],
      website: "www.celesc.com.br",
    },
    agua: {
      company: "Casan",
      phones: [
        { label: "Central", number: "0800-048-0195" },
        { label: "Atendimento", number: "(48) 3231-4000" },
      ],
      website: "www.casan.com.br",
    },
    gas: {
      company: "SCGás",
      phones: [
        { label: "Emergência", number: "0800-048-0197" },
        { label: "Atendimento", number: "(48) 3221-7700" },
      ],
      website: "www.scgas.com.br",
    },
  },
};

// Mapeamento dos 2 primeiros dígitos do CEP para o estado
const cepToState: Record<string, string> = {
  // SP
  "01": "SP", "02": "SP", "03": "SP", "04": "SP", "05": "SP",
  "06": "SP", "07": "SP", "08": "SP", "09": "SP",
  "11": "SP", "12": "SP", "13": "SP", "14": "SP", "15": "SP",
  "16": "SP", "17": "SP", "18": "SP", "19": "SP",
  // RJ
  "20": "RJ", "21": "RJ", "22": "RJ", "23": "RJ", "24": "RJ",
  "25": "RJ", "26": "RJ", "27": "RJ", "28": "RJ",
  // ES
  "29": "ES",
  // MG
  "30": "MG", "31": "MG", "32": "MG", "33": "MG", "34": "MG",
  "35": "MG", "36": "MG", "37": "MG", "38": "MG", "39": "MG",
  // BA
  "40": "BA", "41": "BA", "42": "BA", "43": "BA", "44": "BA",
  "45": "BA", "46": "BA", "47": "BA", "48": "BA",
  // SE
  "49": "SE",
  // PE
  "50": "PE", "51": "PE", "52": "PE", "53": "PE", "54": "PE",
  "55": "PE", "56": "PE",
  // AL
  "57": "AL",
  // PB
  "58": "PB",
  // RN
  "59": "RN",
  // CE
  "60": "CE", "61": "CE", "62": "CE", "63": "CE",
  // PI
  "64": "PI",
  // MA
  "65": "MA",
  // PA
  "66": "PA", "67": "PA", "68": "PA",
  // AM / AC / RR / AP
  "69": "AM", // Parte do AM, AC, RR
  // DF / GO
  "70": "DF", "71": "DF", "72": "DF", "73": "DF",
  "74": "GO", "75": "GO", "76": "GO",
  // TO
  "77": "TO",
  // MT
  "78": "MT",
  // MS
  "79": "MS",
  // PR
  "80": "PR", "81": "PR", "82": "PR", "83": "PR",
  "84": "PR", "85": "PR", "86": "PR", "87": "PR",
  // SC
  "88": "SC", "89": "SC",
  // RS
  "90": "RS", "91": "RS", "92": "RS", "93": "RS",
  "94": "RS", "95": "RS", "96": "RS", "97": "RS",
  "98": "RS", "99": "RS",
};

// Função para obter o estado a partir do CEP
export const getStateFromCep = (cep: string): string | null => {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length < 2) return null;
  
  const prefix = cleanCep.substring(0, 2);
  return cepToState[prefix] || null;
};

// Função para obter contatos estaduais
export const getStateContacts = (cep: string): StateContacts | null => {
  const state = getStateFromCep(cep);
  if (!state) return null;
  
  return stateDatabase[state] || null;
};
