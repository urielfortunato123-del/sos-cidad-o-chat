import { Phone, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleEmergencyProps {
  onBack: () => void;
}

const emergencyServices = [
  {
    label: "Polícia",
    number: "190",
    emoji: "🚓",
    description: "Segurança, roubo ou acidente",
    color: "bg-primary text-primary-foreground",
  },
  {
    label: "SAMU",
    number: "192",
    emoji: "🚑",
    description: "Emergência médica",
    color: "bg-accent text-accent-foreground",
  },
  {
    label: "Bombeiros",
    number: "193",
    emoji: "🚒",
    description: "Incêndio, resgate, acidente grave",
    color: "bg-warning text-warning-foreground",
  },
];

const VehicleEmergency = ({ onBack }: VehicleEmergencyProps) => {
  return (
    <div className="animate-slide-up space-y-6">
      <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-6 text-center space-y-3">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-destructive">
          Sua segurança está em risco
        </h2>
        <p className="text-foreground">
          Recomendamos acionar ajuda imediata.
        </p>
      </div>

      <div className="space-y-4">
        {emergencyServices.map((service) => (
          <a
            key={service.number}
            href={`tel:${service.number}`}
            className="block"
          >
            <Button
              className={`w-full h-20 text-lg font-semibold rounded-2xl shadow-soft flex items-center gap-4 justify-start px-6 ${service.color}`}
            >
              <span className="text-3xl">{service.emoji}</span>
              <div className="text-left">
                <div className="text-lg">{service.label} — {service.number}</div>
                <div className="text-sm font-normal opacity-80">{service.description}</div>
              </div>
              <Phone className="w-6 h-6 ml-auto animate-pulse" />
            </Button>
          </a>
        ))}
      </div>

      <Button onClick={onBack} variant="outline" className="w-full h-12 rounded-2xl">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para orientação
      </Button>
    </div>
  );
};

export default VehicleEmergency;
