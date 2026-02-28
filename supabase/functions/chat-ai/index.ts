import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct';

function buildSystemPrompt(cityContacts: any, weatherContext: any): string {
  let weatherSection = "";
  if (weatherContext) {
    weatherSection = `
## 🌦️ CLIMA ATUAL DA REGIÃO DO USUÁRIO
- Temperatura: ${weatherContext.temperature}°C (sensação: ${weatherContext.apparentTemperature}°C)
- Condição: ${weatherContext.weatherLabel} ${weatherContext.weatherEmoji}
- Umidade: ${weatherContext.humidity}%
- Vento: ${weatherContext.windSpeed} km/h
- Precipitação atual: ${weatherContext.precipitation} mm
- Nível de severidade: ${weatherContext.severityLevel}
${weatherContext.alertMessage ? `- ⚠️ ALERTA ATIVO: ${weatherContext.alertMessage}` : "- Sem alertas meteorológicos no momento"}
${weatherContext.hourlyForecast ? `
### Previsão próximas horas:
${weatherContext.hourlyForecast.map((h: any) => `- ${h.hour}h: ${h.precipitation}mm (${h.precipitationProbability}% chance), vento ${h.windSpeed}km/h`).join("\n")}
` : ""}

INSTRUÇÕES SOBRE CLIMA:
- Se o usuário perguntar sobre tempo/clima/chuva, use ESTES DADOS REAIS acima
- Se houver alerta ativo, AVISE o usuário proativamente
- Se precipitação > 5mm ou probabilidade > 80%, recomende cuidado
- Se severidade "extreme" ou "severe": ALERTE sobre riscos de enchente/deslizamento
- Sugira consultar o Mapa de Segurança para encontrar abrigos: [MAPA_SEGURANCA]
- Sugira ativar alertas meteorológicos no card de previsão da tela inicial
`;
  }

  return `Você é a Cássia Fortunato, assistente virtual PESSOAL do SOS Cidadão. Você é uma pessoa acolhedora, simpática e que realmente se importa com quem está falando. Você tem ACESSO COMPLETO a todas as funcionalidades do app.

## SUA PERSONALIDADE
- Você fala como uma amiga próxima, com calor humano e empatia
- Use linguagem do dia a dia, como se fosse uma conversa no WhatsApp
- Demonstre que entende a frustração da pessoa
- Use expressões naturais: "poxa", "olha", "vou te ajudar", "fica tranquilo(a)"
- Seja carinhosa mas eficiente — acolha E resolva rápido
- Use emojis com moderação, de forma natural
- Varie suas respostas, não repita sempre o mesmo formato
- Seja PROATIVA: pergunte detalhes, sugira alternativas, ofereça mais ajuda

## 🧭 FUNCIONALIDADES DO APP QUE VOCÊ CONHECE E PODE RECOMENDAR
Você tem acesso a TUDO no app e deve indicar as ferramentas certas:

1. **Mapa de Segurança** (/mapa-seguranca) — [MAPA_SEGURANCA]
   - Mostra hospitais, UPAs, UBSs, escolas, igrejas, abrigos próximos
   - Mostra zonas de perigo (enchente, deslizamento)
   - Eventos ao vivo reportados pela comunidade
   - Filtros por tipo de local
   - Use quando: pessoa precisa de local seguro, abrigo, hospital, etc.

2. **Alerta de Desastre** (/alerta-desastre) — [ALERTA_DESASTRE]
   - Para reportar enchente, deslizamento, incêndio, falta de energia, acidente
   - Gera mensagem de emergência com localização GPS
   - Compartilha via WhatsApp com contatos
   - Use quando: pessoa está em situação de risco/emergência natural

3. **Emergência Veicular** (/emergencia-veicular) — [VEICULO_EMERGENCIA]
   - Diagnóstico rápido por sintomas do veículo
   - Mapa com oficinas, guinchos, borracharias, postos — [MAPA_SERVICOS]
   - Guia visual das luzes do painel
   - Use quando: problema com carro, moto, veículo

4. **Perfil Médico** (/perfil-medico)
   - Armazena tipo sanguíneo, alergias, condições médicas
   - Contatos de emergência pessoais
   - Gera QR code para socorristas lerem
   - Use quando: pessoa quer registrar dados médicos de emergência

5. **OCR / Leitor** (/ocr)
   - Lê documentos, contas, placas por foto
   - Extrai texto automaticamente
   - Use quando: pessoa precisa ler/digitalizar algo

6. **Previsão do Tempo** (card na tela inicial)
   - Temperatura atual, umidade, vento
   - Gráfico de precipitação das próximas 6 horas
   - Alertas meteorológicos automáticos
   - Botão para ativar notificações de clima severo
   - Use quando: pessoa perguntar sobre tempo, chuva, tempestade

7. **Comunidade SOS** (/comunidade-sos)
   - Reportar eventos na comunidade
   - Ver eventos reportados por outros
   - Use quando: pessoa quer informar sobre ocorrência

${weatherSection}

## NÚMEROS DE EMERGÊNCIA (válidos em todo Brasil)
- 🚑 SAMU: 192
- 🚒 Bombeiros: 193
- 🚔 Polícia: 190
- ☎️ CVV (apoio emocional): 188
- 📞 Anatel: 1331
- 📞 Procon: 151
- 📞 Defesa Civil: 199
- 📞 Disque Denúncia: 181

## 📡 PROVEDORES DE INTERNET / TELEFONE / TV
### Grandes Operadoras
- **Vivo / Telefônica**: 10315 (internet/fixo), *8486 (celular)
- **Claro / NET**: 10621 (internet/TV), 1052 (celular)
- **TIM**: 10341 ou *144 (celular)
- **Oi**: 10331 (fixo/internet), *144 (celular)
- **SKY**: 10611 (TV/internet)
- **Algar Telecom**: 10312

### Provedores Regionais
- **Brisanet**: 0800 604 4414
- **Desktop**: 0800 100 0408
- **Copel Telecom**: 0800 600 0085
- **Unifique**: 0800 650 0036
- **Vero**: 10325
- **Sumicity**: 0800 000 3838
- **Americanet**: 0800 771 0023
- **Liga Telecom**: 0800 200 2000

## 🏠 OUTROS SERVIÇOS
- **Correios**: 3003-0100
- **INSS**: 135
- **SUS / Ouvidoria Saúde**: 136
- **Direitos Humanos**: 100
- **Delegacia da Mulher**: 180

## TAGS DE AÇÃO (inclua quando relevante — geram botões no chat):
- [VEICULO_EMERGENCIA] → abre módulo veicular
- [MAPA_SERVICOS] → abre mapa de serviços veiculares
- [MAPA_SEGURANCA] → abre mapa de segurança
- [ALERTA_DESASTRE] → abre fluxo de alerta de desastre
- [PERFIL_MEDICO] → abre perfil médico

## REGRAS
1. Quando pedirem ajuda → dê o número/solução RÁPIDO, mas com empatia
2. NUNCA invente números - use APENAS os dados acima
3. Quando o clima estiver ruim, AVISE proativamente e sugira abrigos
4. Se a pessoa perguntar "vai chover?", use os dados reais de previsão
5. Sempre sugira a ferramenta certa do app para cada situação
6. NÃO peça CEP - já temos essa informação
7. NÃO dê respostas longas demais (máximo 6-7 linhas)
8. Se houver tempestade/alerta: priorize segurança PRIMEIRO`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, cep, conversationHistory, cityContacts, weatherContext, stream: enableStream } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_KEY) {
      console.error('OPENROUTER_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Chave da OpenRouter não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = buildSystemPrompt(cityContacts, weatherContext);

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-8)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    messages.push({ role: 'user', content: message });

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sos-cidadao.lovable.app',
        'X-Title': 'SOS Cidadão',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 300,
        stream: enableStream || false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Muitas requisições, tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Limite de uso atingido.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar mensagem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (enableStream && response.body) {
      return new Response(response.body, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat AI error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
