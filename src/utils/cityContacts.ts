// Dados de contatos por cidade baseado em faixas de CEP
// CEP ranges: https://www.correios.com.br/enviar/precisa-de-ajuda/qual-meu-cep

export interface CityContacts {
  city: string;
  state: string;
  prefeitura: {
    name: string;
    phones: { label: string; number: string }[];
    website?: string;
  };
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

// Números de emergência são fixos em todo Brasil
export const emergencyNumbers = {
  samu: { number: "192", label: "SAMU - Emergência Médica" },
  policia: { number: "190", label: "Polícia Militar" },
  bombeiros: { number: "193", label: "Corpo de Bombeiros" },
  policiaFederal: { number: "194", label: "Polícia Federal" },
  defesaCivil: { number: "199", label: "Defesa Civil" },
};

// Base de dados de contatos por cidade
const cityDatabase: Record<string, CityContacts> = {
  // São Paulo Capital (01000-000 a 09999-999)
  "sao-paulo-sp": {
    city: "São Paulo",
    state: "SP",
    prefeitura: {
      name: "Prefeitura de São Paulo",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Atendimento", number: "1188" },
        { label: "Ouvidoria", number: "0800-174-1560" },
      ],
      website: "www.capital.sp.gov.br",
    },
    energia: {
      company: "Enel São Paulo",
      phones: [
        { label: "Central", number: "0800-72-72-120" },
        { label: "WhatsApp", number: "(11) 2550-1696" },
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

  // Campinas (13000-000 a 13139-999)
  "campinas-sp": {
    city: "Campinas",
    state: "SP",
    prefeitura: {
      name: "Prefeitura de Campinas",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(19) 3772-2827" },
        { label: "Defesa Civil", number: "(19) 3272-5011" },
      ],
      website: "www.campinas.sp.gov.br",
    },
    energia: {
      company: "CPFL Paulista",
      phones: [
        { label: "Central", number: "0800-010-0010" },
        { label: "WhatsApp", number: "(19) 99768-0010" },
      ],
      website: "www.cpfl.com.br",
    },
    agua: {
      company: "Sanasa",
      phones: [
        { label: "Central", number: "0800-772-1195" },
        { label: "WhatsApp", number: "(19) 99181-1195" },
      ],
      website: "www.sanasa.com.br",
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

  // Belo Horizonte (30000-000 a 34999-999)
  "belo-horizonte-mg": {
    city: "Belo Horizonte",
    state: "MG",
    prefeitura: {
      name: "Prefeitura de Belo Horizonte",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "BH Resolve", number: "(31) 3277-4000" },
        { label: "Ouvidoria", number: "(31) 3277-4007" },
      ],
      website: "www.pbh.gov.br",
    },
    energia: {
      company: "Cemig",
      phones: [
        { label: "Central", number: "116" },
        { label: "WhatsApp", number: "(31) 99413-4116" },
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

  // Rio de Janeiro (20000-000 a 28999-999)
  "rio-de-janeiro-rj": {
    city: "Rio de Janeiro",
    state: "RJ",
    prefeitura: {
      name: "Prefeitura do Rio de Janeiro",
      phones: [
        { label: "Central 1746", number: "1746" },
        { label: "Ouvidoria", number: "(21) 2976-1100" },
        { label: "Defesa Civil", number: "(21) 2293-9998" },
      ],
      website: "www.rio.rj.gov.br",
    },
    energia: {
      company: "Light",
      phones: [
        { label: "Central", number: "0800-021-0196" },
        { label: "WhatsApp", number: "(21) 99981-6059" },
      ],
      website: "www.light.com.br",
    },
    agua: {
      company: "Cedae",
      phones: [
        { label: "Central", number: "0800-282-1195" },
        { label: "Atendimento", number: "(21) 2332-3535" },
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

  // Curitiba (80000-000 a 83999-999)
  "curitiba-pr": {
    city: "Curitiba",
    state: "PR",
    prefeitura: {
      name: "Prefeitura de Curitiba",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(41) 3350-8484" },
        { label: "Defesa Civil", number: "(41) 3350-8475" },
      ],
      website: "www.curitiba.pr.gov.br",
    },
    energia: {
      company: "Copel",
      phones: [
        { label: "Central", number: "0800-51-00-116" },
        { label: "WhatsApp", number: "(41) 99175-9674" },
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

  // Salvador (40000-000 a 42999-999)
  "salvador-ba": {
    city: "Salvador",
    state: "BA",
    prefeitura: {
      name: "Prefeitura de Salvador",
      phones: [
        { label: "Fala Salvador", number: "156" },
        { label: "Ouvidoria", number: "(71) 2203-4000" },
        { label: "Defesa Civil", number: "(71) 3611-1990" },
      ],
      website: "www.salvador.ba.gov.br",
    },
    energia: {
      company: "Neoenergia Coelba",
      phones: [
        { label: "Central", number: "0800-071-0800" },
        { label: "WhatsApp", number: "(71) 3370-6350" },
      ],
      website: "www.neoenergia.com",
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

  // Porto Alegre (90000-000 a 91999-999)
  "porto-alegre-rs": {
    city: "Porto Alegre",
    state: "RS",
    prefeitura: {
      name: "Prefeitura de Porto Alegre",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(51) 3289-1240" },
        { label: "Defesa Civil", number: "(51) 3289-7990" },
      ],
      website: "www.portoalegre.rs.gov.br",
    },
    energia: {
      company: "CEEE Equatorial",
      phones: [
        { label: "Central", number: "0800-721-2333" },
        { label: "WhatsApp", number: "(51) 3382-5500" },
      ],
      website: "www.ceee.com.br",
    },
    agua: {
      company: "DMAE",
      phones: [
        { label: "Central", number: "156" },
        { label: "Emergência", number: "(51) 3289-9740" },
      ],
      website: "www2.portoalegre.rs.gov.br/dmae",
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

  // Bauru (17000-000 a 17109-999)
  "bauru-sp": {
    city: "Bauru",
    state: "SP",
    prefeitura: {
      name: "Prefeitura de Bauru",
      phones: [
        { label: "Câmara Municipal", number: "(14) 3235-0600" },
        { label: "Ouvidoria", number: "(14) 3235-0601" },
        { label: "Cohab", number: "(14) 3235-9222" },
      ],
      website: "www.bauru.sp.gov.br",
    },
    energia: {
      company: "CPFL Paulista",
      phones: [
        { label: "Central", number: "0800-010-0010" },
        { label: "WhatsApp", number: "(19) 99768-0010" },
      ],
      website: "www.cpfl.com.br",
    },
    agua: {
      company: "DAE Bauru",
      phones: [
        { label: "Central 24h", number: "0800-771-0195" },
        { label: "E-mail", number: "0800@daebauru.sp.gov.br" },
      ],
      website: "www.daebauru.sp.gov.br",
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
};

// Mapeamento de faixas de CEP para cidades
const cepRanges: { start: number; end: number; cityKey: string }[] = [
  // São Paulo Capital
  { start: 1000000, end: 9999999, cityKey: "sao-paulo-sp" },
  // Campinas e região
  { start: 13000000, end: 13139999, cityKey: "campinas-sp" },
  // Bauru
  { start: 17000000, end: 17109999, cityKey: "bauru-sp" },
  // Belo Horizonte
  { start: 30000000, end: 34999999, cityKey: "belo-horizonte-mg" },
  // Rio de Janeiro
  { start: 20000000, end: 28999999, cityKey: "rio-de-janeiro-rj" },
  // Curitiba
  { start: 80000000, end: 83999999, cityKey: "curitiba-pr" },
  // Salvador
  { start: 40000000, end: 42999999, cityKey: "salvador-ba" },
  // Porto Alegre
  { start: 90000000, end: 91999999, cityKey: "porto-alegre-rs" },
];

// Função para obter contatos baseado no CEP
export const getContactsByCep = (cep: string): CityContacts | null => {
  // Remove caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, "");
  
  if (cleanCep.length !== 8) {
    return null;
  }

  const cepNumber = parseInt(cleanCep, 10);

  for (const range of cepRanges) {
    if (cepNumber >= range.start && cepNumber <= range.end) {
      return cityDatabase[range.cityKey] || null;
    }
  }

  // Retorna contatos genéricos se não encontrar a cidade
  return {
    city: "Sua Cidade",
    state: "",
    prefeitura: {
      name: "Prefeitura Municipal",
      phones: [
        { label: "Central 156", number: "156" },
      ],
    },
    energia: {
      company: "Distribuidora Local",
      phones: [
        { label: "Aneel", number: "0800-727-0003" },
      ],
    },
    agua: {
      company: "Companhia de Água Local",
      phones: [
        { label: "ANA", number: "0800-725-2255" },
      ],
    },
  };
};

// Função para formatar número de telefone para link
export const formatPhoneLink = (number: string): string => {
  const cleanNumber = number.replace(/\D/g, "");
  return `tel:${cleanNumber}`;
};
