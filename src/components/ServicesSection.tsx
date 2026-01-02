import { Zap, Heart, Shield, Flame, Building2, Droplets, Phone } from "lucide-react";
import ServiceCard from "./ServiceCard";
import { CityContacts } from "@/utils/cityContacts";

interface ServicesSectionProps {
  onServiceClick: (service: string) => void;
  cityContacts: CityContacts | null;
}

const ServicesSection = ({ onServiceClick, cityContacts }: ServicesSectionProps) => {
  const services = [
    {
      icon: Zap,
      title: "Falta de Energia",
      description: cityContacts?.energia 
        ? `${cityContacts.energia.company} - ${cityContacts.city}` 
        : "Reporte quedas de energia na sua região.",
      color: "warning" as const,
      service: "energia",
    },
    {
      icon: Heart,
      title: "SAMU - 192",
      description: "Ambulância e emergências médicas.",
      color: "accent" as const,
      service: "samu",
    },
    {
      icon: Shield,
      title: "Polícia - 190",
      description: "Segurança e emergências.",
      color: "primary" as const,
      service: "policia",
    },
    {
      icon: Flame,
      title: "Bombeiros - 193",
      description: "Incêndios, resgates e situações de risco.",
      color: "accent" as const,
      service: "bombeiros",
    },
    {
      icon: Building2,
      title: "Prefeitura",
      description: cityContacts?.prefeitura 
        ? `${cityContacts.prefeitura.name}` 
        : "Serviços municipais e atendimento ao cidadão.",
      color: "success" as const,
      service: "prefeitura",
    },
    {
      icon: Droplets,
      title: "Água e Saneamento",
      description: cityContacts?.agua 
        ? `${cityContacts.agua.company} - ${cityContacts.city}` 
        : "Falta d'água, vazamentos e serviços de saneamento.",
      color: "primary" as const,
      service: "agua",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Serviços Disponíveis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {cityContacts 
              ? `Serviços para ${cityContacts.city}${cityContacts.state ? `, ${cityContacts.state}` : ""}. Toque em um serviço para ver os contatos.`
              : "Insira seu CEP acima para ver os serviços da sua região."
            }
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
