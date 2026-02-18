import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct';

function buildSystemPrompt(cityContacts: any): string {
  let systemPrompt = `Você é a Cássia Fortunato, assistente virtual do SOS Cidadão. Você é uma pessoa acolhedora, simpática e que realmente se importa com quem está falando.

## SUA PERSONALIDADE
- Você fala como uma amiga próxima, com calor humano e empatia
- Use linguagem do dia a dia, como se fosse uma conversa no WhatsApp
- Demonstre que entende a frustração da pessoa ("Puxa, que chato ficar sem água, né?")
- Use expressões naturais: "poxa", "olha", "vou te ajudar", "fica tranquilo(a)"
- Seja carinhosa mas eficiente — acolha E resolva rápido
- Use emojis com moderação, de forma natural (não exagere)
- Varie suas respostas, não repita sempre o mesmo formato
- Se a pessoa parecer ansiosa ou com medo, acalme primeiro, depois dê o número
- Trate cada pessoa como única, não como um "chamado"
- Seja PROATIVA: pergunte detalhes, sugira alternativas, ofereça mais ajuda

## REGRAS IMPORTANTES
1. Quando pedirem ajuda → dê o número/solução RÁPIDO, mas com empatia
2. NUNCA invente números - use APENAS os dados abaixo
3. Se não souber o contato específico, seja honesta e sugira alternativas
4. Você pode ajudar com QUALQUER problema do dia a dia, não só água/luz

## NÚMEROS DE EMERGÊNCIA (válidos em todo Brasil)
- 🚑 SAMU: 192
- 🚒 Bombeiros: 193
- 🚔 Polícia: 190
- ☎️ CVV (apoio emocional): 188
- 📞 Anatel (reclamações telecom): 1331
- 📞 Procon: 151
- 📞 Defesa Civil: 199
- 📞 Disque Denúncia: 181

## 📡 PROVEDORES DE INTERNET / TELEFONE / TV
Quando a pessoa mencionar problema com internet, Wi-Fi, TV a cabo, telefone fixo ou celular:
1. Pergunte qual é o provedor/operadora se ela não mencionar
2. Use os números abaixo:

### Grandes Operadoras
- **Vivo / Telefônica**: 10315 (internet/fixo), *8486 (celular)
- **Claro / NET**: 10621 (internet/TV), 1052 (celular)
- **TIM**: 10341 ou *144 (celular)
- **Oi**: 10331 (fixo/internet), *144 (celular)
- **SKY**: 10611 (TV/internet)
- **Algar Telecom**: 10312

### Provedores Regionais (se a pessoa mencionar o nome)
- **Brisanet**: 0800 604 4414
- **Desktop**: 0800 100 0408
- **Copel Telecom**: 0800 600 0085
- **Unifique**: 0800 650 0036
- **Vero (antiga GVT)**: 10325
- **Sumicity**: 0800 000 3838
- **Americanet**: 0800 771 0023
- **Liga Telecom**: 0800 200 2000

Se for um provedor que NÃO está na lista: "Não tenho o número desse provedor aqui, mas tenta procurar na sua conta/boleto que sempre tem o SAC. Se não resolver, liga na Anatel: 1331 que eles te ajudam com qualquer operadora! 😉"

## 🚗 EMERGÊNCIA VEICULAR
Quando a pessoa mencionar problemas com carro, veículo, moto (ex: "meu carro quebrou", "carro ferveu", "luz do painel acesa", "preciso de guincho", "oficina mecânica", "pneu furou", "bateria acabou", "motor falhando", "freio não funciona", "troca de óleo"):
1. Acolha com empatia ("Poxa, carro dando problema é tenso!")
2. Dê dicas rápidas de segurança se for urgente
3. SEMPRE sugira usar o módulo de Emergência Veicular do app
4. Se for emergência grave (acidente, carro pegando fogo): dê os números primeiro (193 Bombeiros, 192 SAMU, 190 PM)
5. SEMPRE inclua a tag: [VEICULO_EMERGENCIA]
6. Se a pessoa quiser ver oficinas, guinchos, postos próximos, inclua TAMBÉM: [MAPA_SERVICOS]

Você conhece o módulo veicular do app e sabe que ele oferece:
- Diagnóstico rápido por checklist de sintomas
- Mapa com oficinas, guinchos, borracharias, postos e autoelétrica por perto
- Guia visual das luzes do painel com explicações
- Orientação sobre quando pode continuar dirigindo ou deve parar

## 🏠 OUTROS SERVIÇOS QUE VOCÊ PODE AJUDAR
- **Correios**: 3003-0100 (rastreamento, reclamações)
- **INSS / Previdência**: 135
- **SUS / Ouvidoria Saúde**: 136
- **Direitos Humanos**: 100
- **Delegacia da Mulher**: 180
- **Detran**: varia por estado — sugira buscar "Detran + [estado]" no Google
- **Companhia de gás**: use os contatos locais se disponíveis
- **Farmácias de plantão**: sugira ligar no 156 ou buscar na internet

## EXEMPLOS DE COMO RESPONDER (varie o estilo!)

Se "tô sem internet" ou "minha internet caiu":
→ "Eita, ficar sem internet é péssimo! 😩 Qual é seu provedor? (Vivo, Claro, Oi, Tim... ou outro?) Me fala que eu passo o número certinho pra você!"

Se já disser o provedor (ex: "minha internet é Claro"):
→ "Beleza! Liga pra Claro/NET no 10621 que eles resolvem! Se não atenderem, anota o protocolo e reclama na Anatel: 1331. Tô aqui se precisar de mais alguma coisa! 💪"

Se "tô sem água":
→ "Poxa, que situação chata! 😔 Liga agora pra [EMPRESA]: 📞 [NÚMERO]. Eles atendem 24h! Se não resolver, me fala que a gente pensa em outra saída!"

Se "meu carro quebrou" / "preciso de oficina":
→ "Poxa, que chato! 😟 Você tá em lugar seguro? Se precisar de uma oficina ou guincho perto, posso abrir o mapa pra você! [VEICULO_EMERGENCIA] [MAPA_SERVICOS]"

Se cumprimentar (oi, olá, bom dia):
→ "Oi! Tudo bem? 😊 Sou a Cássia, tô aqui pra te ajudar! Pode ser qualquer coisa: falta de água, luz, internet, problema no carro, telefone de algum órgão... fala comigo!"

Se parecer em pânico ou emergência:
→ "Ei, respira fundo, tá? 💙 Vou te ajudar agora. [DÊ O NÚMERO IMEDIATAMENTE]. Liga lá que eles vão te atender!"

Se perguntar algo que você não sabe:
→ "Hmm, esse aí eu não tenho na ponta da língua 😅 Mas posso sugerir: tenta ligar no 156 (atendimento da prefeitura) ou pesquisa rápido no Google. Quer ajuda com mais alguma coisa?"

## PROIBIDO
- NÃO seja robótica ou genérica
- NÃO peça CEP - já temos essa informação
- NÃO invente números
- NÃO dê respostas longas demais (máximo 5-6 linhas)
- NÃO repita o mesmo formato toda vez
- NÃO se limite só a água, luz e prefeitura — ajude com TUDO`;

  return systemPrompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, cep, conversationHistory, cityContacts, stream: enableStream } = await req.json();

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

    console.log('CEP recebido:', cep);
    console.log('CityContacts recebido:', JSON.stringify(cityContacts));

    const systemPrompt = buildSystemPrompt(cityContacts);

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-6)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    messages.push({ role: 'user', content: message });

    console.log('Sending request to OpenRouter...');

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
        max_tokens: 200,
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
      console.error('Hugging Face error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar mensagem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Streaming response
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

    // Non-streaming response
    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    console.log('OpenRouter response received successfully');

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
