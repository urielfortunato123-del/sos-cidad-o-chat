import { X, Phone, Globe, Building2, Zap, Droplets, Flame, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CityContacts, formatPhoneLink } from "@/utils/cityContacts";

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: CityContacts | null;
  serviceType: "prefeitura" | "energia" | "agua" | "gas";
  cep: string;
}

const serviceConfig = {
  prefeitura: {
    title: "Prefeitura",
    icon: Building2,
    color: "bg-success",
    textColor: "text-success",
  },
  energia: {
    title: "Energia Elétrica",
    icon: Zap,
    color: "bg-warning",
    textColor: "text-warning",
  },
  agua: {
    title: "Água e Saneamento",
    icon: Droplets,
    color: "bg-primary",
    textColor: "text-primary",
  },
  gas: {
    title: "Gás",
    icon: Flame,
    color: "bg-accent",
    textColor: "text-accent",
  },
};

const ContactsModal = ({ isOpen, onClose, contacts, serviceType, cep }: ContactsModalProps) => {
  if (!isOpen || !contacts) return null;

  const config = serviceConfig[serviceType];
  const serviceData = contacts[serviceType];
  const Icon = config.icon;

  if (!serviceData) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-medium border border-border max-w-md w-full p-6 animate-slide-up">
          <p className="text-center text-muted-foreground">
            Serviço não disponível para esta região.
          </p>
          <Button variant="secondary" onClick={onClose} className="w-full mt-4">
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-medium border border-border max-w-md w-full animate-slide-up overflow-hidden">
        {/* Header */}
        <div className={`${config.color} p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{config.title}</h2>
                <p className="text-white/80 text-lg">
                  {'company' in serviceData ? serviceData.company : serviceData.name}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-4 text-white/90">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">
              {contacts.city}{contacts.state ? `, ${contacts.state}` : ""} • CEP: {cep}
            </span>
          </div>
        </div>

        {/* Phone List */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground font-medium px-2">
            Toque para ligar:
          </p>
          
          {serviceData.phones.map((phone, index) => (
            <a
              key={index}
              href={formatPhoneLink(phone.number)}
              className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-smooth group"
            >
              <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <span className={`text-2xl font-bold ${config.textColor}`}>
                  {phone.number}
                </span>
                <p className="text-sm text-muted-foreground">{phone.label}</p>
              </div>
            </a>
          ))}

          {'website' in serviceData && serviceData.website && (
            <a
              href={`https://${serviceData.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-smooth group"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-semibold text-foreground">
                  Acessar Site
                </span>
                <p className="text-sm text-muted-foreground">{serviceData.website}</p>
              </div>
            </a>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} className="w-full" size="lg">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactsModal;
