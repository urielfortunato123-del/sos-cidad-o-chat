import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { symptoms, description, checklist } = await req.json();
    const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_KEY) throw new Error("OPENROUTER_API_KEY not configured");

    const checklistText = (checklist || [])
      .map((c: { question: string; answer: boolean }) => `${c.question} ${c.answer ? "SIM" : "NÃO"}`)
      .join("\n");

    const prompt = `Você é um assistente de diagnóstico veicular. Analise os sintomas e retorne um JSON.

SINTOMAS REPORTADOS: ${(symptoms || []).join(", ") || "nenhum"}
DESCRIÇÃO DO USUÁRIO: ${description || "nenhuma"}
CHECKLIST:
${checklistText}

Retorne APENAS um JSON válido (sem markdown, sem crases, sem texto extra) com esta estrutura:
{
  "risk": "green" | "yellow" | "red",
  "canContinue": "sim" | "curta_distancia" | "nao",
  "recommendation": "texto curto e claro, sem jargão técnico",
  "serviceTypes": ["oficina", "guincho", "autoeletrica", "troca_oleo", "posto"],
  "description": "resumo dos sintomas detectados"
}

REGRAS:
- Se carro ferveu OU luz do freio acesa → red + nao
- Se luz do óleo + cheiro de queimado → red + nao
- Se luz do motor OU perda de força → yellow + curta_distancia
- Se apenas barulho estranho → yellow + curta_distancia
- Se nenhum sintoma grave → green + sim
- recommendation deve ser linguagem simples, como se falasse com alguém sem conhecimento mecânico
- serviceTypes deve listar apenas os tipos relevantes ao problema
- RESPONDA APENAS O JSON, nada mais`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sos-cidadao.lovable.app",
        "X-Title": "SOS Cidadão",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Vehicle diagnosis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
