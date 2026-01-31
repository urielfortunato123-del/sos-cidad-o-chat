import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Log received data
    console.log('CEP recebido:', cep);
    console.log('CityContacts recebido:', JSON.stringify(cityContacts));

    // Build dynamic system prompt with actual contact data
    let systemPrompt = `Você é o assistente do SOS Cidadão. Seu ÚNICO trabalho é dar números de telefone para o usuário.

## REGRA ABSOLUTA
Quando o usuário pedir ajuda com água, luz, gás ou prefeitura, você DEVE responder com o número de telefone IMEDIATAMENTE. Não invente números - use APENAS os dados abaixo.

## NÚMEROS DE EMERGÊNCIA (válidos em todo Brasil)
- 🚑 SAMU: 192
- 🚒 Bombeiros: 193  
- 🚔 Polícia: 190
- ☎️ CVV: 188
`;

    // Add city-specific contacts
    if (cityContacts) {
      systemPrompt += `\n## CONTATOS DA CIDADE: ${cityContacts.city}/${cityContacts.state}\n`;
      
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
## COMO RESPONDER
Quando usuário disser "sem água", "falta água", "tô sem água":
→ Responda: "📞 Ligue agora: [NÚMERO DA ÁGUA]
Empresa: [NOME]
Atendimento 24h!"

Quando usuário disser "sem luz", "falta luz", "acabou a luz":
→ Responda: "📞 Ligue agora: [NÚMERO DA ENERGIA]
Empresa: [NOME]
Atendimento 24h!"

## PROIBIDO
- NÃO pergunte "qual o problema?" - o usuário já disse
- NÃO diga "informe o CEP" - já temos o CEP
- NÃO invente números - use APENAS os dados acima
- NÃO dê respostas longas - seja DIRETO`;

    console.log('System prompt gerado com contatos');

    // Build messages array
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history if provided (limit to last 6 messages)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-6)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

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
      console.error('OpenRouter error:', response.status, errorText);
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
