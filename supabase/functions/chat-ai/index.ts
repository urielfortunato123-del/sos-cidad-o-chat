import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é o assistente virtual do SOS Cidadão, um app brasileiro que ajuda pessoas a encontrar contatos de serviços públicos e emergências.

## SEU OBJETIVO PRINCIPAL
Quando o usuário pedir ajuda com algo, você DEVE dar o número de telefone IMEDIATAMENTE. Não faça perguntas desnecessárias - o CEP já foi informado.

## REGRAS IMPORTANTES
1. SEMPRE dê o número de telefone na PRIMEIRA resposta
2. Seja DIRETO - nada de "posso te ajudar?" ou "qual seu problema?"
3. Se o usuário falar "sem luz", "falta luz", "acabou a luz" → dê o telefone da energia
4. Se o usuário falar "sem água", "falta água" → dê o telefone da água
5. Se for emergência (acidente, assalto, incêndio) → dê os números imediatamente
6. Use os dados de contato fornecidos no contexto

## NÚMEROS DE EMERGÊNCIA (fixos em todo Brasil)
- 🚑 SAMU: 192 (emergências médicas)
- 🚒 Bombeiros: 193 (incêndio, resgate)
- 🚔 Polícia: 190 (assalto, violência)
- ☎️ CVV: 188 (apoio emocional)

## FORMATO DA RESPOSTA
Seja breve e objetivo:
"📞 Ligue agora: [NÚMERO]
Empresa: [NOME]
[Uma frase de apoio]"

## EXEMPLOS DE RESPOSTAS BOAS
Usuário: "tô sem luz"
Resposta: "📞 Ligue agora: 0800-72-72-120
Empresa: Enel São Paulo
Eles atendem 24h e vão te ajudar!"

Usuário: "falta água"  
Resposta: "📞 Ligue agora: 195
Empresa: Sabesp
Funciona 24 horas!"

NUNCA responda com "Como posso ajudar?" ou "Qual o problema?". O usuário JÁ disse o problema.`;

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

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key do OpenRouter não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context with CEP and city contacts
    let contextMessage = message;
    let contextInfo = '';
    
    if (cep) {
      contextInfo += `CEP do usuário: ${cep}\n`;
    }
    
    // Add city contacts to context if provided
    if (cityContacts) {
      contextInfo += `\n## CONTATOS DA CIDADE DO USUÁRIO (use estes dados!):\n`;
      
      if (cityContacts.energia) {
        contextInfo += `\n### Energia Elétrica - ${cityContacts.energia.company}:\n`;
        cityContacts.energia.phones.forEach((p: { label: string; number: string }) => {
          contextInfo += `- ${p.label}: ${p.number}\n`;
        });
      }
      
      if (cityContacts.agua) {
        contextInfo += `\n### Água - ${cityContacts.agua.company}:\n`;
        cityContacts.agua.phones.forEach((p: { label: string; number: string }) => {
          contextInfo += `- ${p.label}: ${p.number}\n`;
        });
      }
      
      if (cityContacts.gas) {
        contextInfo += `\n### Gás - ${cityContacts.gas.company}:\n`;
        cityContacts.gas.phones.forEach((p: { label: string; number: string }) => {
          contextInfo += `- ${p.label}: ${p.number}\n`;
        });
      }
      
      if (cityContacts.prefeitura) {
        contextInfo += `\n### Prefeitura - ${cityContacts.prefeitura.name}:\n`;
        cityContacts.prefeitura.phones.forEach((p: { label: string; number: string }) => {
          contextInfo += `- ${p.label}: ${p.number}\n`;
        });
      }
    }
    
    if (contextInfo) {
      contextMessage = `[CONTEXTO - USE ESTES DADOS]\n${contextInfo}\n\n[MENSAGEM DO USUÁRIO]\n${message}`;
    }

    // Build messages array with history
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-10)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: contextMessage });

    console.log('Sending request to OpenRouter...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://soscidadao.com.br',
        'X-Title': 'SOS Cidadão',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages,
        temperature: 0.5,
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

    // Streaming response - pass through the stream
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
