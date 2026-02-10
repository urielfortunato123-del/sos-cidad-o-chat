import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'meta-llama/Llama-3.3-70B-Instruct';

function buildSystemPrompt(cityContacts: any): string {
  let systemPrompt = `Você é o assistente do SOS Cidadão. Seu trabalho é ajudar cidadãos a encontrar números de telefone de serviços públicos.

## REGRAS IMPORTANTES
1. Quando o usuário pedir ajuda com água, luz, gás, prefeitura ou emergência, responda com o número IMEDIATAMENTE
2. Se o usuário apenas cumprimentar ou enviar um CEP sozinho, pergunte: "Como posso te ajudar? Tá sem água? Sem luz? Precisa da prefeitura?"
3. NUNCA invente números - use APENAS os dados abaixo
4. Seja amigável mas DIRETO

## NÚMEROS DE EMERGÊNCIA (válidos em todo Brasil)
- 🚑 SAMU: 192
- 🚒 Bombeiros: 193  
- 🚔 Polícia: 190
- ☎️ CVV: 188
`;

  if (cityContacts) {
    systemPrompt += `\n## CONTATOS DA REGIÃO: ${cityContacts.city}/${cityContacts.state}\n`;
    
    if (cityContacts.agua) {
      systemPrompt += `\n### 💧 ÁGUA - ${cityContacts.agua.company}\n`;
      cityContacts.agua.phones.forEach((p: { label: string; number: string }) => {
        if (!p.number.includes('@')) {
          systemPrompt += `📞 ${p.label}: ${p.number}\n`;
        }
      });
    }
    
    if (cityContacts.energia) {
      systemPrompt += `\n### ⚡ ENERGIA - ${cityContacts.energia.company}\n`;
      cityContacts.energia.phones.forEach((p: { label: string; number: string }) => {
        systemPrompt += `📞 ${p.label}: ${p.number}\n`;
      });
    }
    
    if (cityContacts.gas) {
      systemPrompt += `\n### 🔥 GÁS - ${cityContacts.gas.company}\n`;
      cityContacts.gas.phones.forEach((p: { label: string; number: string }) => {
        systemPrompt += `📞 ${p.label}: ${p.number}\n`;
      });
    }
    
    if (cityContacts.prefeitura) {
      systemPrompt += `\n### 🏛️ PREFEITURA - ${cityContacts.prefeitura.name}\n`;
      cityContacts.prefeitura.phones.forEach((p: { label: string; number: string }) => {
        systemPrompt += `📞 ${p.label}: ${p.number}\n`;
      });
    }
  } else {
    systemPrompt += `\n## ATENÇÃO: Não tenho os contatos específicos desta cidade. Oriente o usuário a verificar na conta de água/luz ou ligar 156.\n`;
  }

  systemPrompt += `
## EXEMPLOS DE RESPOSTA

Se usuário disser "tô sem água", "falta água", "sem água":
→ "📞 Ligue agora: [NÚMERO DA ÁGUA]
Empresa: [NOME]
Atendimento 24h!"

Se usuário disser "sem luz", "falta luz", "acabou a luz":
→ "📞 Ligue agora: [NÚMERO DA ENERGIA]
Empresa: [NOME]"

Se usuário apenas cumprimentar (oi, olá) ou enviar só um CEP:
→ "Oi! 👋 Como posso te ajudar?
💧 Problema com água?
⚡ Falta de luz?
🏛️ Precisa da prefeitura?
🚨 Emergência (SAMU/Bombeiros/Polícia)?

É só me falar!"

## PROIBIDO
- NÃO diga "não posso ajudar" - sempre ofereça opções
- NÃO peça CEP - já temos essa informação
- NÃO invente números - use APENAS os dados acima
- NÃO dê respostas longas demais`;

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

    const HF_TOKEN = Deno.env.get('HUGGINGFACE_API_TOKEN');
    if (!HF_TOKEN) {
      console.error('HUGGINGFACE_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Token da Hugging Face não configurado' }),
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

    console.log('Sending request to Hugging Face...');

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
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

    console.log('HF response received successfully');

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
