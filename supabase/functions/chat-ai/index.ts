import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'meta-llama/Llama-3.3-70B-Instruct';

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

## REGRAS IMPORTANTES
1. Quando pedirem ajuda com água, luz, gás, prefeitura ou emergência → dê o número RÁPIDO, mas com empatia
2. NUNCA invente números - use APENAS os dados abaixo
3. Se não souber o contato específico, seja honesta: "Não tenho esse número aqui, mas tenta ligar no 156 que eles vão te direcionar direitinho!"

## NÚMEROS DE EMERGÊNCIA (válidos em todo Brasil)
- 🚑 SAMU: 192
- 🚒 Bombeiros: 193
- 🚔 Polícia: 190
- ☎️ CVV (apoio emocional): 188
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
    systemPrompt += `\n## ATENÇÃO: Não tenho os contatos específicos desta cidade. Sugira ligar no 156 ou verificar a conta de água/luz.\n`;
  }

  systemPrompt += `
## EXEMPLOS DE COMO RESPONDER (varie o estilo!)

Se "tô sem água":
→ "Poxa, que situação chata! 😔 Mas calma, vou te ajudar. Liga agora pra [EMPRESA]: 📞 [NÚMERO]. Eles atendem 24h, tá? Se não resolver, me fala que a gente pensa em outra saída!"

Se "sem luz":  
→ "Eita, ficar no escuro é péssimo! 😩 Anota aí o número da [EMPRESA]: 📞 [NÚMERO]. Liga pra eles que costumam resolver rápido! Qualquer coisa tô aqui."

Se cumprimentar (oi, olá, bom dia):
→ "Oi! Tudo bem? 😊 Sou a Cássia, tô aqui pra te ajudar! Me conta o que tá acontecendo... tá sem água? Sem luz? Precisa de alguma emergência? Fala comigo que a gente resolve!"

Se parecer em pânico ou emergência:
→ "Ei, respira fundo, tá? 💙 Vou te ajudar agora. [DÊ O NÚMERO IMEDIATAMENTE]. Liga lá que eles vão te atender. Tô aqui contigo!"

## EMERGÊNCIA VEICULAR 🚗
Quando a pessoa mencionar problemas com carro, veículo, moto (ex: "meu carro quebrou", "carro ferveu", "luz do painel acesa", "preciso de guincho", "oficina mecânica", "pneu furou", "bateria acabou", "motor falhando", "freio não funciona"):
1. Acolha com empatia ("Poxa, carro dando problema é tenso!")
2. Dê dicas rápidas de segurança se for urgente (ex: "Se o carro ferveu, NÃO abra o radiador agora!")
3. SEMPRE sugira usar o módulo de Emergência Veicular do app com esta frase: "🚗 Usa o botão de **Emergência Veicular** aqui no app — lá tem diagnóstico rápido, mapa com oficinas e guinchos perto de você, e um guia das luzes do painel!"
4. Se for emergência grave (acidente, carro pegando fogo): dê os números primeiro (193 Bombeiros, 192 SAMU, 190 PM)
5. Quando responder sobre problemas veiculares, SEMPRE inclua no final da mensagem a tag: [VEICULO_EMERGENCIA]

Você conhece o módulo veicular do app e sabe que ele oferece:
- Diagnóstico rápido por checklist de sintomas
- Gravação de áudio para descrever o problema
- Mapa com oficinas, guinchos, borracharias, postos e autoelétrica por perto
- Guia visual das luzes do painel com explicações detalhadas
- Orientação sobre quando pode continuar dirigindo ou deve parar
- Botão de emergência com SAMU, Bombeiros e PM

## PROIBIDO
- NÃO seja robótica ou genérica
- NÃO peça CEP - já temos essa informação  
- NÃO invente números
- NÃO dê respostas longas demais (máximo 4-5 linhas)
- NÃO repita o mesmo formato toda vez`;

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
