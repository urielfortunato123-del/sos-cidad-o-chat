import { Phone, X, Heart, Shield, Flame, HandHeart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const emergencyNumbers = [
  { number: "188", label: "CVV - Apoio Emocional", icon: HandHeart, color: "bg-yellow-500", description: "Prevenção ao suicídio 24h" },
  { number: "192", label: "SAMU", icon: Heart, color: "bg-accent" },
  { number: "190", label: "Polícia", icon: Shield, color: "bg-primary" },
  { number: "193", label: "Bombeiros", icon: Flame, color: "bg-warning" },
];

const EmergencyFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Emergency numbers */}
      {isOpen && (
        <div className="flex flex-col gap-3 animate-slide-up">
          {emergencyNumbers.map((item, index) => (
            <button
              key={item.number}
              onClick={() => handleCall(item.number)}
              className={`${item.color} text-white rounded-2xl px-6 py-4 flex items-center gap-4 shadow-medium hover:opacity-90 transition-smooth min-w-[200px]`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <span className="block text-2xl font-bold">{item.number}</span>
                <span className="text-sm opacity-90">{item.label}</span>
                {item.description && (
                  <span className="text-xs opacity-75 block">{item.description}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main emergency button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant={isOpen ? "secondary" : "emergency"}
        className={`w-20 h-20 rounded-full shadow-emergency ${!isOpen ? 'animate-pulse-emergency' : ''}`}
      >
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <Phone className="w-8 h-8" />
        )}
      </Button>
      
      {!isOpen && (
        <span className="text-xs font-semibold text-accent text-center mt-1">
          EMERGÊNCIA
        </span>
      )}
    </div>
  );
};

export default EmergencyFloatingButton;
