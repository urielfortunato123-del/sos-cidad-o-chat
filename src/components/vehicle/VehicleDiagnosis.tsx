import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DiagnosisResult } from "@/pages/EmergenciaVeicular";

interface VehicleDiagnosisProps {
  onComplete: (result: DiagnosisResult) => void;
  initialDescription?: string;
}

interface ChecklistItem {
  id: string;
  question: string;
  emoji: string;
  answer: boolean | null;
}

const VehicleDiagnosis = ({ onComplete, initialDescription }: VehicleDiagnosisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "noise", question: "Há barulho estranho?", emoji: "🔊", answer: null },
    { id: "smell", question: "Cheiro de queimado?", emoji: "💨", answer: null },
    { id: "power_loss", question: "Perda de força?", emoji: "⬇️", answer: null },
    { id: "overheating", question: "O carro ferveu?", emoji: "🌡️", answer: null },
    { id: "oil_light", question: "Luz do óleo acesa?", emoji: "🛢️", answer: null },
    { id: "engine_light", question: "Luz do motor acesa?", emoji: "🔧", answer: null },
    { id: "battery_light", question: "Luz da bateria acesa?", emoji: "🔋", answer: null },
    { id: "brake_light", question: "Luz do freio acesa?", emoji: "🛑", answer: null },
    { id: "temp_light", question: "Luz de temperatura acesa?", emoji: "🌡️", answer: null },
  ]);

  const setAnswer = (id: string, answer: boolean) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, answer } : item
    ));
  };

  const allAnswered = checklist.every(item => item.answer !== null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      const symptoms = checklist
        .filter(item => item.answer === true)
        .map(item => item.question.replace("?", ""));

      const { data, error } = await supabase.functions.invoke("vehicle-diagnosis", {
        body: {
          symptoms,
          description: initialDescription || "",
          checklist: checklist.map(c => ({ question: c.question, answer: c.answer })),
        },
      });

      if (error) throw error;

      onComplete(data as DiagnosisResult);
    } catch (error) {
      console.error("Diagnosis error:", error);
      // Fallback local diagnosis
      const hasOverheating = checklist.find(c => c.id === "overheating")?.answer;
      const hasBrake = checklist.find(c => c.id === "brake_light")?.answer;
      const hasOil = checklist.find(c => c.id === "oil_light")?.answer;
      const hasSmell = checklist.find(c => c.id === "smell")?.answer;
      const positiveCount = checklist.filter(c => c.answer === true).length;

      let risk: DiagnosisResult["risk"] = "green";
      let canContinue: DiagnosisResult["canContinue"] = "sim";

      if (hasOverheating || hasBrake || (hasOil && hasSmell)) {
        risk = "red";
        canContinue = "nao";
      } else if (positiveCount >= 2 || hasOil || hasSmell) {
        risk = "yellow";
        canContinue = "curta_distancia";
      }

      onComplete({
        risk,
        canContinue,
        recommendation: risk === "red"
          ? "Pare o carro com segurança imediatamente. Não continue rodando."
          : risk === "yellow"
          ? "Dirija com cuidado e vá ao local mais próximo para avaliação."
          : "O veículo parece estar funcionando normalmente. Se persistir, procure um mecânico.",
        serviceTypes: risk === "red" 
          ? ["guincho", "oficina"]
          : risk === "yellow"
          ? ["oficina", "autoeletrica", "troca_oleo"]
          : ["oficina"],
        description: `Sintomas: ${checklist.filter(c => c.answer).map(c => c.question).join(", ") || "Nenhum identificado"}`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-slide-up space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Diagnóstico Rápido</h2>
        <p className="text-sm text-muted-foreground">
          Responda sim ou não para cada pergunta
        </p>
      </div>

      {initialDescription && (
        <div className="bg-muted rounded-xl p-3 text-sm">
          <span className="font-medium">Sua descrição:</span> "{initialDescription}"
        </div>
      )}

      <div className="space-y-3">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-xl p-4 shadow-soft border border-border flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <span className="font-medium text-foreground">{item.question}</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant={item.answer === true ? "default" : "outline"}
                onClick={() => setAnswer(item.id, true)}
                className={`rounded-xl min-w-[52px] ${item.answer === true ? "bg-accent text-accent-foreground" : ""}`}
              >
                Sim
              </Button>
              <Button
                size="sm"
                variant={item.answer === false ? "default" : "outline"}
                onClick={() => setAnswer(item.id, false)}
                className={`rounded-xl min-w-[52px] ${item.answer === false ? "bg-success text-success-foreground" : ""}`}
              >
                Não
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={!allAnswered || isAnalyzing}
        className="w-full h-14 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Analisando...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Analisar Problema
          </>
        )}
      </Button>
    </div>
  );
};

export default VehicleDiagnosis;
