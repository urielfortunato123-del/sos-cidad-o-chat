import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface WarningLight {
  icon: string;
  label: string;
  description: string;
}

interface WarningCategory {
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  title: string;
  subtitle: string;
  lights: WarningLight[];
}

const categories: WarningCategory[] = [
  {
    color: "green",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-400",
    borderClass: "border-emerald-500/30",
    title: "🟢 Informativas",
    subtitle: "Funcionamento normal",
    lights: [
      { icon: "◁▷", label: "Setas", description: "Indicador de direção ativado" },
      { icon: "💡", label: "Faróis de neblina", description: "Farol de neblina ligado" },
      { icon: "🔆", label: "Faróis acesos", description: "Luzes externas ligadas" },
      { icon: "🔵", label: "Farol alto", description: "Farol alto ativado" },
    ],
  },
  {
    color: "yellow",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-400",
    borderClass: "border-amber-500/30",
    title: "🟡 Atenção",
    subtitle: "Verifique assim que possível",
    lights: [
      { icon: "⚙️", label: "Motor em pane", description: "Falha no motor detectada — dirija com cuidado" },
      { icon: "🔥", label: "Vela incandescente", description: "Pré-aquecimento do motor (diesel)" },
      { icon: "⛽", label: "Combustível baixo", description: "Nível de combustível muito baixo" },
      { icon: "💧", label: "Líquido do limpador", description: "Nível do fluido do limpador baixo" },
      { icon: "🔋", label: "Bateria descarregada", description: "Problema na bateria ou alternador" },
      { icon: "🛢️", label: "Óleo baixo", description: "Nível ou pressão de óleo insuficiente" },
      { icon: "🌡️", label: "Pressão do pneu", description: "Pressão de um ou mais pneus baixa" },
      { icon: "❄️", label: "Modo inverno/Gelo", description: "Temperatura externa baixa, risco de gelo" },
    ],
  },
  {
    color: "red",
    bgClass: "bg-red-500/10",
    textClass: "text-red-400",
    borderClass: "border-red-500/30",
    title: "🔴 Pare Imediatamente",
    subtitle: "Risco grave — não continue",
    lights: [
      { icon: "🛑", label: "Freio de mão", description: "Freio de estacionamento ativado ou falha nos freios" },
      { icon: "🅰️", label: "Sistema ABS", description: "Falha no sistema antitravamento dos freios" },
      { icon: "🌡️", label: "Temperatura alta", description: "Motor superaquecendo — PARE o veículo" },
      { icon: "🚪", label: "Porta aberta", description: "Uma ou mais portas não estão fechadas" },
      { icon: "🎯", label: "Airbag", description: "Falha no sistema de airbag" },
      { icon: "🔴", label: "Cinto de segurança", description: "Cinto não afivelado" },
      { icon: "⚠️", label: "Pisca-alerta", description: "Luzes de emergência ativadas" },
    ],
  },
];

const DashboardWarnings = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-card border border-border shadow-soft text-foreground"
      >
        <span className="text-sm font-semibold">🚗 Luzes do Painel — O que significam?</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-4">
              {categories.map((cat) => (
                <div
                  key={cat.color}
                  className={`rounded-2xl border ${cat.borderClass} ${cat.bgClass} p-4 space-y-3`}
                >
                  <div>
                    <h4 className={`font-bold text-base ${cat.textClass}`}>{cat.title}</h4>
                    <p className="text-xs text-muted-foreground">{cat.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.lights.map((light) => (
                      <div
                        key={light.label}
                        className="flex items-start gap-2 bg-background/50 rounded-xl p-2.5"
                      >
                        <span className="text-xl leading-none mt-0.5">{light.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold ${cat.textClass} truncate`}>{light.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{light.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardWarnings;
