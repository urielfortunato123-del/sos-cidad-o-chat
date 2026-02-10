import { MapPin, Phone, ArrowRight, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagnosisResult } from "@/pages/EmergenciaVeicular";

interface VehicleOrientationProps {
  diagnosis: DiagnosisResult;
  onMap: () => void;
  onEmergency: () => void;
}

const riskConfig = {
  green: {
    icon: CheckCircle,
    label: "Risco Baixo",
    color: "bg-success/10 text-success border-success/30",
    bgClass: "bg-success",
    emoji: "🟢",
  },
  yellow: {
    icon: AlertTriangle,
    label: "Atenção",
    color: "bg-warning/10 text-warning border-warning/30",
    bgClass: "bg-warning",
    emoji: "🟡",
  },
  red: {
    icon: AlertCircle,
    label: "Pare Imediatamente",
    color: "bg-destructive/10 text-destructive border-destructive/30",
    bgClass: "bg-destructive",
    emoji: "🔴",
  },
};

const continueLabels = {
  sim: "✅ Pode continuar rodando",
  curta_distancia: "⚠️ Somente curta distância",
  nao: "🛑 NÃO continue rodando",
};

const VehicleOrientation = ({ diagnosis, onMap, onEmergency }: VehicleOrientationProps) => {
  const config = riskConfig[diagnosis.risk];
  const Icon = config.icon;

  return (
    <div className="animate-slide-up space-y-6">
      {/* Risk badge */}
      <div className={`rounded-2xl border-2 p-6 text-center space-y-3 ${config.color}`}>
        <Icon className="w-12 h-12 mx-auto" />
        <h2 className="text-2xl font-bold">{config.emoji} {config.label}</h2>
        <p className="text-lg font-semibold">{continueLabels[diagnosis.canContinue]}</p>
      </div>

      {/* Recommendation */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border space-y-3">
        <h3 className="font-bold text-foreground text-lg">Orientação</h3>
        <p className="text-foreground leading-relaxed">{diagnosis.recommendation}</p>
        {diagnosis.description && (
          <p className="text-sm text-muted-foreground">{diagnosis.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={onMap}
          className="w-full h-16 text-lg font-semibold rounded-2xl bg-success text-success-foreground hover:bg-success/90 shadow-soft flex items-center gap-3"
        >
          <MapPin className="w-6 h-6" />
          Me leve ao local mais seguro
          <ArrowRight className="w-5 h-5 ml-auto" />
        </Button>

        {diagnosis.risk !== "green" && (
          <Button
            onClick={onEmergency}
            className="w-full h-16 text-lg font-semibold rounded-2xl gradient-emergency text-accent-foreground shadow-emergency flex items-center gap-3"
          >
            <Phone className="w-6 h-6" />
            Preciso de ajuda imediata
            <ArrowRight className="w-5 h-5 ml-auto" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default VehicleOrientation;
