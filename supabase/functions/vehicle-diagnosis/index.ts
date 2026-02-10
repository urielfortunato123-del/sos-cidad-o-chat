import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { symptoms, description, checklist } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const checklistText = (checklist || [])
      .map((c: { question: string; answer: boolean }) => `${c.question} ${c.answer ? "SIM" : "NÃO"}`)
      .join("\n");

    const prompt = `Você é um assistente de diagnóstico veicular. Analise os sintomas e retorne um JSON.

SINTOMAS REPORTADOS: ${(symptoms || []).join(", ") || "nenhum"}
DESCRIÇÃO DO USUÁRIO: ${description || "nenhuma"}
CHECKLIST:
${checklistText}

Retorne APENAS um JSON válido (sem markdown) com esta estrutura:
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
- serviceTypes deve listar apenas os tipos relevantes ao problema`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
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
