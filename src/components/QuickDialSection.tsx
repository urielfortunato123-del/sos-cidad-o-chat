import { Heart, Shield, Flame, Zap, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickDialSectionProps {
  userCep?: string;
  onNeedCep?: () => void;
}

const quickDialNumbers = [
  { 
    number: "192", 
    label: "SAMU", 
    description: "Emergência Médica",
    icon: Heart, 
    color: "bg-accent",
    textColor: "text-accent",
    isEmergency: true,
  },
  { 
    number: "190", 
    label: "Polícia", 
    description: "Segurança Pública",
    icon: Shield, 
    color: "bg-primary",
    textColor: "text-primary",
    isEmergency: true,
  },
  { 
    number: "193", 
    label: "Bombeiros", 
    description: "Incêndio e Resgate",
    icon: Flame, 
    color: "bg-warning",
    textColor: "text-warning",
    isEmergency: true,
  },
  { 
    number: "Energia", 
    label: "Falta de Luz", 
    description: "Varia por cidade",
    icon: Zap, 
    color: "bg-success",
    textColor: "text-success",
    isEmergency: false,
  },
];

const QuickDialSection = ({ userCep, onNeedCep }: QuickDialSectionProps) => {
  const { toast } = useToast();

  const handleCall = (item: typeof quickDialNumbers[0]) => {
    if (item.isEmergency) {
      window.location.href = `tel:${item.number}`;
    } else {
      // Para energia, precisa do CEP
      toast({
        title: "📍 CEP necessário",
        description: "Insira seu CEP no topo da página para ver o número da sua distribuidora de energia.",
      });
      
      if (onNeedCep) {
        onNeedCep();
      }
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section id="emergencia" className="py-16 bg-secondary/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-4">
            <Phone className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">Discagem Rápida</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Ligue com Um Toque
          </h2>
          <p className="text-xl text-muted-foreground">
            Botões grandes para facilitar o acesso
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {quickDialNumbers.map((item) => (
            <button
              key={item.number}
              onClick={() => handleCall(item)}
              className="group bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-medium hover:border-primary/30 transition-smooth flex flex-col items-center text-center"
            >
              <div className={`w-20 h-20 rounded-2xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-10 h-10 text-white" />
              </div>
              <span className={`text-3xl md:text-4xl font-extrabold ${item.textColor} mb-1`}>
                {item.number}
              </span>
              <span className="text-lg font-bold text-foreground">
                {item.label}
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                {item.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickDialSection;
