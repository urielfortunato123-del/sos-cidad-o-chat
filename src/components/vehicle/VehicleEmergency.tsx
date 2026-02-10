import { Phone, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-6 text-center space-y-3"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        </motion.div>
        <h2 className="text-xl font-bold text-destructive">
          Sua segurança está em risco
        </h2>
        <p className="text-foreground">
          Recomendamos acionar ajuda imediata.
        </p>
      </motion.div>

      <div className="space-y-4">
        {emergencyServices.map((service, index) => (
          <motion.a
            key={service.number}
            href={`tel:${service.number}`}
            className="block"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.1, type: "spring", stiffness: 250, damping: 25 }}
          >
            <Button
              className={`w-full h-20 text-lg font-semibold rounded-2xl shadow-soft flex items-center gap-4 justify-start px-6 transition-transform active:scale-[0.97] ${service.color}`}
            >
              <span className="text-3xl">{service.emoji}</span>
              <div className="text-left">
                <div className="text-lg">{service.label} — {service.number}</div>
                <div className="text-sm font-normal opacity-80">{service.description}</div>
              </div>
              <Phone className="w-6 h-6 ml-auto animate-pulse" />
            </Button>
          </motion.a>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button onClick={onBack} variant="outline" className="w-full h-12 rounded-2xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para orientação
        </Button>
      </motion.div>
    </div>
  );
};

export default VehicleEmergency;
