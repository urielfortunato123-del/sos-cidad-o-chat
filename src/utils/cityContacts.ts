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

  // Fortaleza (60000-000 a 61999-999)
  "fortaleza-ce": {
    city: "Fortaleza",
    state: "CE",
    prefeitura: {
      name: "Prefeitura de Fortaleza",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(85) 3452-5921" },
        { label: "Defesa Civil", number: "(85) 3101-2699" },
      ],
      website: "www.fortaleza.ce.gov.br",
    },
    energia: {
      company: "Enel Ceará",
      phones: [
        { label: "Central", number: "0800-285-0196" },
        { label: "WhatsApp", number: "(85) 99969-0196" },
      ],
      website: "www.enel.com.br",
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

  // Recife (50000-000 a 54999-999)
  "recife-pe": {
    city: "Recife",
    state: "PE",
    prefeitura: {
      name: "Prefeitura do Recife",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(81) 3355-8080" },
        { label: "Defesa Civil", number: "(81) 3355-3711" },
      ],
      website: "www.recife.pe.gov.br",
    },
    energia: {
      company: "Neoenergia Pernambuco",
      phones: [
        { label: "Central", number: "0800-081-0196" },
        { label: "WhatsApp", number: "(81) 3217-6990" },
      ],
      website: "www.neoenergia.com",
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

  // Brasília (70000-000 a 73999-999)
  "brasilia-df": {
    city: "Brasília",
    state: "DF",
    prefeitura: {
      name: "GDF - Governo do DF",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(61) 3962-4990" },
        { label: "Defesa Civil", number: "(61) 3910-1125" },
      ],
      website: "www.df.gov.br",
    },
    energia: {
      company: "Neoenergia Brasília",
      phones: [
        { label: "Central", number: "0800-061-0196" },
        { label: "WhatsApp", number: "(61) 3465-9318" },
      ],
      website: "www.neoenergia.com",
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

  // Goiânia (74000-000 a 74999-999)
  "goiania-go": {
    city: "Goiânia",
    state: "GO",
    prefeitura: {
      name: "Prefeitura de Goiânia",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(62) 3524-3040" },
        { label: "Defesa Civil", number: "(62) 3524-2400" },
      ],
      website: "www.goiania.go.gov.br",
    },
    energia: {
      company: "Equatorial Goiás",
      phones: [
        { label: "Central", number: "0800-062-0196" },
        { label: "Atendimento", number: "(62) 3243-2000" },
      ],
      website: "www.equatorialenergia.com.br",
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

  // Manaus (69000-000 a 69299-999)
  "manaus-am": {
    city: "Manaus",
    state: "AM",
    prefeitura: {
      name: "Prefeitura de Manaus",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(92) 3625-4765" },
        { label: "Defesa Civil", number: "(92) 3236-6001" },
      ],
      website: "www.manaus.am.gov.br",
    },
    energia: {
      company: "Amazonas Energia",
      phones: [
        { label: "Central", number: "0800-701-3330" },
        { label: "Atendimento", number: "(92) 3621-1000" },
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

  // Belém (66000-000 a 67999-999)
  "belem-pa": {
    city: "Belém",
    state: "PA",
    prefeitura: {
      name: "Prefeitura de Belém",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(91) 3084-5500" },
        { label: "Defesa Civil", number: "(91) 3244-1694" },
      ],
      website: "www.belem.pa.gov.br",
    },
    energia: {
      company: "Equatorial Pará",
      phones: [
        { label: "Central", number: "0800-091-0196" },
        { label: "WhatsApp", number: "(91) 99298-0000" },
      ],
      website: "www.equatorialenergia.com.br",
    },
    agua: {
      company: "Cosanpa",
      phones: [
        { label: "Central", number: "0800-280-0195" },
        { label: "Atendimento", number: "(91) 3202-8600" },
      ],
      website: "www.cosanpa.pa.gov.br",
    },
  },

  // Florianópolis (88000-000 a 88099-999)
  "florianopolis-sc": {
    city: "Florianópolis",
    state: "SC",
    prefeitura: {
      name: "Prefeitura de Florianópolis",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(48) 3251-6000" },
        { label: "Defesa Civil", number: "(48) 3239-8000" },
      ],
      website: "www.pmf.sc.gov.br",
    },
    energia: {
      company: "Celesc",
      phones: [
        { label: "Central", number: "0800-48-00-196" },
        { label: "WhatsApp", number: "(48) 99117-0800" },
      ],
      website: "www.celesc.com.br",
    },
    agua: {
      company: "Casan",
      phones: [
        { label: "Central", number: "0800-643-0195" },
        { label: "Atendimento", number: "(48) 3221-0000" },
      ],
      website: "www.casan.com.br",
    },
  },

  // Vitória (29000-000 a 29099-999)
  "vitoria-es": {
    city: "Vitória",
    state: "ES",
    prefeitura: {
      name: "Prefeitura de Vitória",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(27) 3382-6015" },
        { label: "Defesa Civil", number: "(27) 3382-4700" },
      ],
      website: "www.vitoria.es.gov.br",
    },
    energia: {
      company: "EDP Espírito Santo",
      phones: [
        { label: "Central", number: "0800-721-0707" },
        { label: "WhatsApp", number: "(27) 99772-0707" },
      ],
      website: "www.edp.com.br",
    },
    agua: {
      company: "Cesan",
      phones: [
        { label: "Central", number: "0800-283-0115" },
        { label: "Atendimento", number: "(27) 2127-5115" },
      ],
      website: "www.cesan.com.br",
    },
  },

  // Natal (59000-000 a 59139-999)
  "natal-rn": {
    city: "Natal",
    state: "RN",
    prefeitura: {
      name: "Prefeitura de Natal",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(84) 3232-8200" },
        { label: "Defesa Civil", number: "(84) 3232-4795" },
      ],
      website: "www.natal.rn.gov.br",
    },
    energia: {
      company: "Neoenergia Cosern",
      phones: [
        { label: "Central", number: "0800-701-0102" },
        { label: "Atendimento", number: "(84) 3215-6001" },
      ],
      website: "www.neoenergia.com",
    },
    agua: {
      company: "Caern",
      phones: [
        { label: "Central", number: "0800-281-0195" },
        { label: "Atendimento", number: "(84) 3232-1400" },
      ],
      website: "www.caern.rn.gov.br",
    },
  },

  // João Pessoa (58000-000 a 58099-999)
  "joao-pessoa-pb": {
    city: "João Pessoa",
    state: "PB",
    prefeitura: {
      name: "Prefeitura de João Pessoa",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(83) 3218-9021" },
        { label: "Defesa Civil", number: "(83) 3213-2662" },
      ],
      website: "www.joaopessoa.pb.gov.br",
    },
    energia: {
      company: "Energisa Paraíba",
      phones: [
        { label: "Central", number: "0800-701-3420" },
        { label: "Atendimento", number: "(83) 3216-6010" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Cagepa",
      phones: [
        { label: "Central", number: "0800-083-0195" },
        { label: "Atendimento", number: "(83) 3218-6000" },
      ],
      website: "www.cagepa.pb.gov.br",
    },
  },

  // Maceió (57000-000 a 57099-999)
  "maceio-al": {
    city: "Maceió",
    state: "AL",
    prefeitura: {
      name: "Prefeitura de Maceió",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(82) 3315-4500" },
        { label: "Defesa Civil", number: "(82) 3315-1717" },
      ],
      website: "www.maceio.al.gov.br",
    },
    energia: {
      company: "Equatorial Alagoas",
      phones: [
        { label: "Central", number: "0800-082-0196" },
        { label: "Atendimento", number: "(82) 2126-9400" },
      ],
      website: "www.equatorialenergia.com.br",
    },
    agua: {
      company: "Casal",
      phones: [
        { label: "Central", number: "0800-082-0195" },
        { label: "Atendimento", number: "(82) 3315-3580" },
      ],
      website: "www.casal.al.gov.br",
    },
  },

  // Aracaju (49000-000 a 49099-999)
  "aracaju-se": {
    city: "Aracaju",
    state: "SE",
    prefeitura: {
      name: "Prefeitura de Aracaju",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(79) 3179-1700" },
        { label: "Defesa Civil", number: "(79) 3179-1285" },
      ],
      website: "www.aracaju.se.gov.br",
    },
    energia: {
      company: "Energisa Sergipe",
      phones: [
        { label: "Central", number: "0800-079-0196" },
        { label: "Atendimento", number: "(79) 2106-7100" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Deso",
      phones: [
        { label: "Central", number: "0800-079-0195" },
        { label: "Atendimento", number: "(79) 3205-3000" },
      ],
      website: "www.deso-se.com.br",
    },
  },

  // Teresina (64000-000 a 64099-999)
  "teresina-pi": {
    city: "Teresina",
    state: "PI",
    prefeitura: {
      name: "Prefeitura de Teresina",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(86) 3215-7624" },
        { label: "Defesa Civil", number: "(86) 3222-5047" },
      ],
      website: "www.teresina.pi.gov.br",
    },
    energia: {
      company: "Equatorial Piauí",
      phones: [
        { label: "Central", number: "0800-086-0800" },
        { label: "Atendimento", number: "(86) 3228-8100" },
      ],
      website: "www.equatorialenergia.com.br",
    },
    agua: {
      company: "Agespisa",
      phones: [
        { label: "Central", number: "0800-280-0195" },
        { label: "Atendimento", number: "(86) 3226-2000" },
      ],
      website: "www.agespisa.com.br",
    },
  },

  // São Luís (65000-000 a 65109-999)
  "sao-luis-ma": {
    city: "São Luís",
    state: "MA",
    prefeitura: {
      name: "Prefeitura de São Luís",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(98) 3212-9100" },
        { label: "Defesa Civil", number: "(98) 3212-6801" },
      ],
      website: "www.saoluis.ma.gov.br",
    },
    energia: {
      company: "Equatorial Maranhão",
      phones: [
        { label: "Central", number: "0800-086-0800" },
        { label: "Atendimento", number: "(98) 3217-2100" },
      ],
      website: "www.equatorialenergia.com.br",
    },
    agua: {
      company: "Caema",
      phones: [
        { label: "Central", number: "0800-098-0195" },
        { label: "Atendimento", number: "(98) 3231-4400" },
      ],
      website: "www.caema.ma.gov.br",
    },
  },

  // Cuiabá (78000-000 a 78099-999)
  "cuiaba-mt": {
    city: "Cuiabá",
    state: "MT",
    prefeitura: {
      name: "Prefeitura de Cuiabá",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(65) 3645-6000" },
        { label: "Defesa Civil", number: "(65) 3617-1970" },
      ],
      website: "www.cuiaba.mt.gov.br",
    },
    energia: {
      company: "Energisa Mato Grosso",
      phones: [
        { label: "Central", number: "0800-647-0120" },
        { label: "Atendimento", number: "(65) 3612-3500" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Águas Cuiabá",
      phones: [
        { label: "Central", number: "0800-646-6115" },
        { label: "Atendimento", number: "(65) 3645-6000" },
      ],
      website: "www.aguascuiaba.com.br",
    },
  },

  // Campo Grande (79000-000 a 79124-999)
  "campo-grande-ms": {
    city: "Campo Grande",
    state: "MS",
    prefeitura: {
      name: "Prefeitura de Campo Grande",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(67) 4042-1320" },
        { label: "Defesa Civil", number: "(67) 3314-3510" },
      ],
      website: "www.campogrande.ms.gov.br",
    },
    energia: {
      company: "Energisa MS",
      phones: [
        { label: "Central", number: "0800-722-7272" },
        { label: "Atendimento", number: "(67) 3311-3311" },
      ],
      website: "www.energisa.com.br",
    },
    agua: {
      company: "Águas Guariroba",
      phones: [
        { label: "Central", number: "0800-642-0115" },
        { label: "Atendimento", number: "(67) 3348-0115" },
      ],
      website: "www.aguasguariroba.com.br",
    },
  },

  // Ribeirão Preto (14000-000 a 14109-999)
  "ribeirao-preto-sp": {
    city: "Ribeirão Preto",
    state: "SP",
    prefeitura: {
      name: "Prefeitura de Ribeirão Preto",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(16) 3977-9350" },
        { label: "Defesa Civil", number: "(16) 3977-9312" },
      ],
      website: "www.ribeiraopreto.sp.gov.br",
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
      company: "DAERP",
      phones: [
        { label: "Central", number: "(16) 3977-8200" },
        { label: "Atendimento", number: "(16) 3977-8220" },
      ],
      website: "www.ribeiraopreto.sp.gov.br/daerp",
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

  // Santos (11000-000 a 11099-999)
  "santos-sp": {
    city: "Santos",
    state: "SP",
    prefeitura: {
      name: "Prefeitura de Santos",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(13) 3201-5656" },
        { label: "Defesa Civil", number: "(13) 3201-5909" },
      ],
      website: "www.santos.sp.gov.br",
    },
    energia: {
      company: "EDP São Paulo",
      phones: [
        { label: "Central", number: "0800-721-0707" },
        { label: "Atendimento", number: "(13) 3227-0707" },
      ],
      website: "www.edp.com.br",
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

  // Sorocaba (18000-000 a 18109-999)
  "sorocaba-sp": {
    city: "Sorocaba",
    state: "SP",
    prefeitura: {
      name: "Prefeitura de Sorocaba",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(15) 3238-1180" },
        { label: "Defesa Civil", number: "(15) 3219-1900" },
      ],
      website: "www.sorocaba.sp.gov.br",
    },
    energia: {
      company: "CPFL Piratininga",
      phones: [
        { label: "Central", number: "0800-010-0010" },
        { label: "WhatsApp", number: "(19) 99768-0010" },
      ],
      website: "www.cpfl.com.br",
    },
    agua: {
      company: "Saae Sorocaba",
      phones: [
        { label: "Central", number: "0800-770-1580" },
        { label: "Atendimento", number: "(15) 3419-5000" },
      ],
      website: "www.saaesorocaba.com.br",
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

  // Londrina (86000-000 a 86099-999)
  "londrina-pr": {
    city: "Londrina",
    state: "PR",
    prefeitura: {
      name: "Prefeitura de Londrina",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(43) 3372-4680" },
        { label: "Defesa Civil", number: "(43) 3372-4730" },
      ],
      website: "www.londrina.pr.gov.br",
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
        { label: "Atendimento", number: "(43) 3371-3030" },
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

  // Joinville (89200-000 a 89239-999)
  "joinville-sc": {
    city: "Joinville",
    state: "SC",
    prefeitura: {
      name: "Prefeitura de Joinville",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(47) 3431-3250" },
        { label: "Defesa Civil", number: "(47) 3423-6211" },
      ],
      website: "www.joinville.sc.gov.br",
    },
    energia: {
      company: "Celesc",
      phones: [
        { label: "Central", number: "0800-48-00-196" },
        { label: "WhatsApp", number: "(48) 99117-0800" },
      ],
      website: "www.celesc.com.br",
    },
    agua: {
      company: "Águas de Joinville",
      phones: [
        { label: "Central", number: "0800-726-7111" },
        { label: "Atendimento", number: "(47) 3461-5700" },
      ],
      website: "www.aguasdejoinville.com.br",
    },
  },

  // Uberlândia (38400-000 a 38449-999)
  "uberlandia-mg": {
    city: "Uberlândia",
    state: "MG",
    prefeitura: {
      name: "Prefeitura de Uberlândia",
      phones: [
        { label: "Central 156", number: "156" },
        { label: "Ouvidoria", number: "(34) 3239-2800" },
        { label: "Defesa Civil", number: "(34) 3239-2700" },
      ],
      website: "www.uberlandia.mg.gov.br",
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
      company: "DMAE",
      phones: [
        { label: "Central", number: "(34) 3239-3700" },
        { label: "Atendimento", number: "(34) 3239-3700" },
      ],
      website: "www.uberlandia.mg.gov.br/dmae",
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
};

// Mapeamento de faixas de CEP para cidades
const cepRanges: { start: number; end: number; cityKey: string }[] = [
  // São Paulo Capital
  { start: 1000000, end: 9999999, cityKey: "sao-paulo-sp" },
  // Santos
  { start: 11000000, end: 11099999, cityKey: "santos-sp" },
  // Campinas e região
  { start: 13000000, end: 13139999, cityKey: "campinas-sp" },
  // Ribeirão Preto
  { start: 14000000, end: 14109999, cityKey: "ribeirao-preto-sp" },
  // Bauru
  { start: 17000000, end: 17109999, cityKey: "bauru-sp" },
  // Sorocaba
  { start: 18000000, end: 18109999, cityKey: "sorocaba-sp" },
  // Rio de Janeiro
  { start: 20000000, end: 28999999, cityKey: "rio-de-janeiro-rj" },
  // Vitória
  { start: 29000000, end: 29099999, cityKey: "vitoria-es" },
  // Belo Horizonte
  { start: 30000000, end: 34999999, cityKey: "belo-horizonte-mg" },
  // Uberlândia
  { start: 38400000, end: 38449999, cityKey: "uberlandia-mg" },
  // Salvador
  { start: 40000000, end: 42999999, cityKey: "salvador-ba" },
  // Aracaju
  { start: 49000000, end: 49099999, cityKey: "aracaju-se" },
  // Recife
  { start: 50000000, end: 54999999, cityKey: "recife-pe" },
  // Maceió
  { start: 57000000, end: 57099999, cityKey: "maceio-al" },
  // João Pessoa
  { start: 58000000, end: 58099999, cityKey: "joao-pessoa-pb" },
  // Natal
  { start: 59000000, end: 59139999, cityKey: "natal-rn" },
  // Fortaleza
  { start: 60000000, end: 61999999, cityKey: "fortaleza-ce" },
  // Teresina
  { start: 64000000, end: 64099999, cityKey: "teresina-pi" },
  // São Luís
  { start: 65000000, end: 65109999, cityKey: "sao-luis-ma" },
  // Belém
  { start: 66000000, end: 67999999, cityKey: "belem-pa" },
  // Manaus
  { start: 69000000, end: 69299999, cityKey: "manaus-am" },
  // Brasília
  { start: 70000000, end: 73999999, cityKey: "brasilia-df" },
  // Goiânia
  { start: 74000000, end: 74999999, cityKey: "goiania-go" },
  // Cuiabá
  { start: 78000000, end: 78099999, cityKey: "cuiaba-mt" },
  // Campo Grande
  { start: 79000000, end: 79124999, cityKey: "campo-grande-ms" },
  // Curitiba
  { start: 80000000, end: 83999999, cityKey: "curitiba-pr" },
  // Londrina
  { start: 86000000, end: 86099999, cityKey: "londrina-pr" },
  // Florianópolis
  { start: 88000000, end: 88099999, cityKey: "florianopolis-sc" },
  // Joinville
  { start: 89200000, end: 89239999, cityKey: "joinville-sc" },
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
