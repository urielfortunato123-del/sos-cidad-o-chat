import { Zap, Heart, Shield, Flame, Building2, Phone } from "lucide-react";
import ServiceCard from "./ServiceCard";

interface ServicesSectionProps {
  onServiceClick: (service: string) => void;
}

const services = [
  {
    icon: Zap,
    title: "Falta de Energia",
    description: "Reporte quedas de energia e acompanhe o status do restabelecimento na sua região.",
    color: "warning" as const,
    service: "energia",
  },
  {
    icon: Heart,
    title: "SAMU - 192",
    description: "Emergências médicas com atendimento imediato. Ambulância e suporte de vida.",
    color: "accent" as const,
    service: "samu",
  },
  {
    icon: Shield,
    title: "Polícia - 190",
    description: "Ocorrências policiais, segurança pública e emergências criminais.",
    color: "primary" as const,
    service: "policia",
  },
  {
    icon: Flame,
    title: "Bombeiros - 193",
    description: "Incêndios, resgates, acidentes e situações de risco à vida.",
    color: "accent" as const,
    service: "bombeiros",
  },
  {
    icon: Building2,
    title: "Prefeitura",
    description: "Serviços municipais, obras, iluminação pública e atendimento ao cidadão.",
    color: "success" as const,
    service: "prefeitura",
  },
  {
    icon: Phone,
    title: "Outros Serviços",
    description: "Água, gás, telefonia e outros serviços essenciais da sua região.",
    color: "primary" as const,
    service: "outros",
  },
];

const ServicesSection = ({ onServiceClick }: ServicesSectionProps) => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Serviços Disponíveis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecione o serviço que você precisa ou use nosso chat inteligente para ser direcionado automaticamente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard
              key={service.service}
              icon={service.icon}
              title={service.title}
              description={service.description}
              color={service.color}
              onClick={() => onServiceClick(service.service)}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
