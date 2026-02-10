import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface WarningLight {
  icon: string;
  label: string;
  description: string;
  whatIsIt: string;
  function: string;
  whyOn: string;
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
      {
        icon: "◁▷", label: "Setas",
        description: "Indicador de direção ativado",
        whatIsIt: "Sinal luminoso que indica a direção para onde o veículo vai virar (esquerda ou direita).",
        function: "Avisar outros motoristas e pedestres que você vai mudar de direção ou faixa.",
        whyOn: "Você acionou a alavanca de seta. Se piscar rápido demais, uma das lâmpadas pode estar queimada.",
      },
      {
        icon: "💡", label: "Faróis de neblina",
        description: "Farol de neblina ligado",
        whatIsIt: "Luzes mais baixas e largas na frente do carro, feitas para iluminar a estrada em condições de pouca visibilidade.",
        function: "Melhorar a visibilidade em situações de neblina, chuva forte ou fumaça.",
        whyOn: "Você ativou os faróis de neblina manualmente. Desligue quando não houver necessidade para não ofuscar outros motoristas.",
      },
      {
        icon: "🔆", label: "Faróis acesos",
        description: "Luzes externas ligadas",
        whatIsIt: "Indica que os faróis dianteiros (luz baixa) estão ligados.",
        function: "Iluminar a via à frente e tornar seu veículo visível para outros motoristas.",
        whyOn: "Você ligou os faróis ou o sensor automático de luz os ativou. No Brasil, é obrigatório em rodovias mesmo de dia.",
      },
      {
        icon: "🔵", label: "Farol alto",
        description: "Farol alto ativado",
        whatIsIt: "Luz azul no painel indicando que o farol alto (luz longa) está ligado.",
        function: "Iluminar uma distância maior à frente, útil em estradas escuras e sem iluminação.",
        whyOn: "Você acionou o farol alto. Abaixe ao cruzar com outros veículos para não cegar o motorista que vem de frente.",
      },
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
      {
        icon: "⚙️", label: "Motor em pane",
        description: "Falha no motor detectada",
        whatIsIt: "A famosa 'luz de injeção'. Indica que o sistema eletrônico do motor detectou um problema.",
        function: "Alertar sobre falhas no motor que podem afetar desempenho, consumo ou emissão de poluentes.",
        whyOn: "Sensor detectou anomalia — pode ser desde uma vela com defeito até falha no catalisador. Leve a uma oficina para diagnóstico com scanner.",
      },
      {
        icon: "🔥", label: "Vela incandescente",
        description: "Pré-aquecimento (diesel)",
        whatIsIt: "Indicador presente em carros a diesel. Mostra que as velas incandescentes estão aquecendo a câmara de combustão.",
        function: "Preparar o motor diesel para dar partida, especialmente em dias frios.",
        whyOn: "Acende ao ligar a chave e deve apagar em poucos segundos. Se ficar acesa ou piscar, há problema nas velas ou no sistema de pré-aquecimento.",
      },
      {
        icon: "⛽", label: "Combustível baixo",
        description: "Nível de combustível muito baixo",
        whatIsIt: "Indica que o tanque está quase vazio, geralmente com menos de 10% de combustível.",
        function: "Avisar que você precisa abastecer em breve para não ficar parado na estrada.",
        whyOn: "Reserva de combustível atingida. Procure um posto o quanto antes. Rodar sem combustível pode danificar a bomba de combustível.",
      },
      {
        icon: "💧", label: "Líquido do limpador",
        description: "Fluido do limpador baixo",
        whatIsIt: "Indica que o reservatório do fluido do limpador de para-brisa está vazio ou quase.",
        function: "Garantir que você tenha fluido para limpar o vidro e manter a visibilidade.",
        whyOn: "O reservatório precisa ser reabastecido. Use água com detergente neutro ou fluido próprio para limpador.",
      },
      {
        icon: "🔋", label: "Bateria descarregada",
        description: "Problema na bateria ou alternador",
        whatIsIt: "Indica falha no sistema de carga elétrica do veículo — bateria ou alternador.",
        function: "Alertar que a bateria não está sendo carregada corretamente enquanto o carro roda.",
        whyOn: "O alternador pode estar com defeito, a correia pode estar frouxa, ou a bateria está velha. Se não resolver, o carro pode parar.",
      },
      {
        icon: "🛢️", label: "Óleo baixo",
        description: "Nível ou pressão de óleo insuficiente",
        whatIsIt: "Indica que o óleo do motor está abaixo do nível seguro ou com pressão insuficiente.",
        function: "O óleo lubrifica as peças internas do motor. Sem óleo, o motor pode fundir.",
        whyOn: "Pode ser vazamento, consumo natural ou falta de troca de óleo. PARE e verifique o nível com a vareta. Não rode com essa luz acesa!",
      },
      {
        icon: "🌡️", label: "Pressão do pneu",
        description: "Pressão de pneu baixa",
        whatIsIt: "Sensor TPMS detectou que um ou mais pneus estão com pressão abaixo do recomendado.",
        function: "Pneus com pressão baixa gastam mais combustível, desgastam irregularmente e podem estourar.",
        whyOn: "Um pneu pode estar furado, com vazamento lento, ou a pressão caiu por variação de temperatura. Calibre os pneus.",
      },
      {
        icon: "❄️", label: "Modo inverno/Gelo",
        description: "Temperatura externa baixa",
        whatIsIt: "Indica que a temperatura externa está próxima ou abaixo de 0°C, com risco de gelo na pista.",
        function: "Alertar o motorista para dirigir com cautela — a pista pode estar escorregadia.",
        whyOn: "Sensor de temperatura externa detectou frio intenso. Reduza a velocidade e evite frenagens bruscas.",
      },
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
      {
        icon: "🛑", label: "Freio de mão",
        description: "Freio ativado ou falha nos freios",
        whatIsIt: "Indica que o freio de estacionamento está puxado OU que há falha no sistema de freios.",
        function: "Evitar que você dirija com o freio puxado (causa desgaste) ou alertar sobre falha grave nos freios.",
        whyOn: "Se acende com o freio de mão solto, há vazamento de fluido de freio ou desgaste das pastilhas. PARE com segurança e chame ajuda.",
      },
      {
        icon: "🅰️", label: "Sistema ABS",
        description: "Falha no antitravamento",
        whatIsIt: "O ABS (Anti-lock Braking System) impede que as rodas travem durante uma frenagem brusca.",
        function: "Manter o controle direcional do veículo durante frenagens de emergência.",
        whyOn: "Sensor de roda com defeito, módulo ABS com falha, ou fiação danificada. Os freios normais continuam funcionando, mas sem a proteção antitravamento.",
      },
      {
        icon: "🌡️", label: "Temperatura alta",
        description: "Motor superaquecendo",
        whatIsIt: "O motor está acima da temperatura segura de funcionamento, com risco de fundir.",
        function: "Alertar que o sistema de arrefecimento não está dando conta de resfriar o motor.",
        whyOn: "Falta de água no radiador, bomba d'água com defeito, ventoinha parada, ou mangueira furada. PARE IMEDIATAMENTE, desligue o motor e espere esfriar.",
      },
      {
        icon: "🚪", label: "Porta aberta",
        description: "Porta não fechada corretamente",
        whatIsIt: "Indica que uma ou mais portas, o porta-malas ou o capô não estão completamente fechados.",
        function: "Impedir que você dirija com uma porta aberta, evitando acidentes.",
        whyOn: "Feche todas as portas com firmeza. Se a luz persistir com tudo fechado, pode ser sensor de porta com defeito.",
      },
      {
        icon: "🎯", label: "Airbag",
        description: "Falha no sistema de airbag",
        whatIsIt: "O sistema de airbag detectou uma falha e pode NÃO funcionar em caso de acidente.",
        function: "O airbag protege motorista e passageiros em colisões, inflando em milissegundos.",
        whyOn: "Sensor de impacto com defeito, conector solto (comum após mexer no volante), ou módulo do airbag com problema. Leve à oficina — sua segurança depende disso.",
      },
      {
        icon: "🔴", label: "Cinto de segurança",
        description: "Cinto não afivelado",
        whatIsIt: "Indica que o motorista ou passageiro(s) não estão com o cinto de segurança afivelado.",
        function: "Lembrar todos os ocupantes de usar o cinto — item obrigatório e que salva vidas.",
        whyOn: "Afivele o cinto. O alerta geralmente vem acompanhado de um bipe. Em caso de objeto pesado no banco, o sensor pode ativar por engano.",
      },
      {
        icon: "⚠️", label: "Pisca-alerta",
        description: "Luzes de emergência",
        whatIsIt: "Todas as setas piscam ao mesmo tempo, sinalizando uma situação de emergência ou veículo parado.",
        function: "Avisar outros motoristas que seu veículo está parado, em pane ou em situação de perigo.",
        whyOn: "Você acionou manualmente o botão do pisca-alerta (triângulo vermelho no painel). Use quando estiver parado na via ou em emergências.",
      },
    ],
  },
];

const DashboardWarnings = () => {
  const [expanded, setExpanded] = useState(false);
  const [selectedLight, setSelectedLight] = useState<{ light: WarningLight; cat: WarningCategory } | null>(null);

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
            <p className="text-xs text-muted-foreground text-center mt-2 mb-1">
              Toque em qualquer luz para saber mais
            </p>
            <div className="mt-2 space-y-4">
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
                      <button
                        key={light.label}
                        onClick={() => setSelectedLight({ light, cat })}
                        className="flex items-start gap-2 bg-background/50 rounded-xl p-2.5 text-left transition-transform active:scale-95 hover:bg-background/80"
                      >
                        <span className="text-xl leading-none mt-0.5">{light.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold ${cat.textClass} truncate`}>{light.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{light.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedLight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedLight(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border ${selectedLight.cat.borderClass} bg-card shadow-xl overflow-hidden`}
            >
              {/* Header */}
              <div className={`${selectedLight.cat.bgClass} p-4 flex items-center gap-3`}>
                <span className="text-3xl">{selectedLight.light.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg ${selectedLight.cat.textClass}`}>
                    {selectedLight.light.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedLight.light.description}</p>
                </div>
                <button
                  onClick={() => setSelectedLight(null)}
                  className="p-1.5 rounded-full hover:bg-background/30"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    📌 O que é?
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedLight.light.whatIsIt}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    ⚙️ Para que serve?
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedLight.light.function}
                  </p>
                </div>

                <div className={`space-y-1.5 rounded-xl ${selectedLight.cat.bgClass} p-3`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${selectedLight.cat.textClass}`}>
                    💡 Por que está acesa?
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedLight.light.whyOn}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardWarnings;
