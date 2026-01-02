import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é o assistente virtual do SOS Cidadão, um app brasileiro que ajuda pessoas a encontrar contatos de serviços públicos e emergências.

Seu trabalho é:
1. Entender o que o usuário precisa de forma natural (ele pode falar de vários jeitos)
2. Identificar qual serviço está relacionado
3. Dar uma resposta útil e amigável

SERVIÇOS DISPONÍVEIS:
- SAMU (192): emergências médicas, ambulância, primeiros socorros, mal súbito, acidente
- Bombeiros (193): incêndio, resgate, afogamento, desabamento, animais presos
- Polícia (190): assalto, roubo, violência, emergência policial
- Água: falta de água, vazamento, conta de água, problema com água, sem água, caixa d'água
- Energia: falta de luz, queda de energia, sem energia, poste caído, fio solto, conta de luz
- Gás: vazamento de gás, cheiro de gás, problema com gás
- Prefeitura: buraco na rua, iluminação pública, lixo, esgoto, problemas urbanos

COMO RESPONDER:
- Seja natural e empático, como um amigo ajudando
- Use português brasileiro informal mas respeitoso
- Se identificar o serviço, mencione o número/contato
- Se for emergência de vida (SAMU/Bombeiros/Polícia), seja direto e urgente
- Para serviços de concessionárias (água/luz/gás), pergunte o CEP se ainda não souber
- Pode fazer perguntas para entender melhor a situação

Responda de forma concisa (máximo 3-4 frases) a menos que precise de mais detalhes.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, cep, conversationHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context with CEP if available
    let contextMessage = message;
    if (cep) {
      contextMessage = `[Contexto: CEP do usuário é ${cep}]\n\nUsuário: ${message}`;
    }

    // Build messages array with history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-10)) { // Keep last 10 messages for context
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: contextMessage });

    console.log('Sending request to AI gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 500,
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
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar mensagem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    console.log('AI response received successfully');

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
