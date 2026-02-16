import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import QuickDialSection from "@/components/QuickDialSection";
import ChatInterface from "@/components/ChatInterface";
import ContactsModal from "@/components/ContactsModal";
import Footer from "@/components/Footer";
import EmergencyFloatingButton from "@/components/EmergencyFloatingButton";

import BackgroundMusic from "@/components/BackgroundMusic";
import FeedbackModal from "@/components/FeedbackModal";
import { useNavigate } from "react-router-dom";
import { Car, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContactsByCep, CityContacts, emergencyNumbers } from "@/utils/cityContacts";
import { useToast } from "@/hooks/use-toast";
import { useAccessLog } from "@/hooks/useAccessLog";

const Index = () => {
  useAccessLog('/');
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [userCep, setUserCep] = useState("");
  const [userCityInfo, setUserCityInfo] = useState<{ city: string; state: string } | undefined>();
  const [selectedService, setSelectedService] = useState<string | undefined>();
  const [cityContacts, setCityContacts] = useState<CityContacts | null>(null);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [modalServiceType, setModalServiceType] = useState<"prefeitura" | "energia" | "agua" | "gas">("prefeitura");
  const { toast } = useToast();

  useEffect(() => {
    if (userCep && userCep.length >= 8) {
      const contacts = getContactsByCep(userCep);
      setCityContacts(contacts);
      
      if (contacts) {
        toast({
          title: `📍 ${contacts.city}${contacts.state ? `, ${contacts.state}` : ""}`,
          description: "Serviços da sua região carregados!",
        });
      }
    }
  }, [userCep, toast]);

  const handleStartChat = (cep: string, cityInfo?: { city: string; state: string }) => {
    setUserCep(cep);
    setUserCityInfo(cityInfo);
    setSelectedService(undefined);
    setChatOpen(true);
  };

  const handleServiceClick = (service: string) => {
    // Serviços de emergência - ligar direto
    if (service === "samu") {
      window.location.href = `tel:${emergencyNumbers.samu.number}`;
      return;
    }
    if (service === "policia") {
      window.location.href = `tel:${emergencyNumbers.policia.number}`;
      return;
    }
    if (service === "bombeiros") {
      window.location.href = `tel:${emergencyNumbers.bombeiros.number}`;
      return;
    }

    // Serviços que variam por cidade
    if (!userCep || userCep.length < 8) {
      toast({
        title: "CEP necessário",
        description: "Por favor, insira seu CEP para ver os contatos da sua região.",
        variant: "destructive",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (service === "prefeitura" || service === "energia" || service === "agua" || service === "gas") {
      setModalServiceType(service);
      setContactsModalOpen(true);
      return;
    }

    // Fallback para o chat
    setSelectedService(service);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <EmergencyFloatingButton />
      <BackgroundMusic />
      <FeedbackModal />
      
      <main className="pt-[calc(4rem+2.5rem)]">
        <HeroSection onStartChat={handleStartChat} />

        {/* Quick Tools */}
        <section className="py-4 bg-background">
          <div className="container mx-auto px-4 max-w-5xl space-y-3">
            <Button
              onClick={() => navigate("/emergencia-veicular")}
              variant="outline"
              className="w-full h-12 rounded-xl border-warning/40 bg-warning/10 text-foreground hover:bg-warning/20 shadow-soft flex items-center gap-3 justify-center text-sm font-medium"
            >
              <Car className="w-5 h-5 text-warning" />
              <span>🚗 Emergência Veicular</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">— Diagnóstico e mapa de serviços</span>
            </Button>
            <Button
              onClick={() => navigate("/ocr")}
              variant="outline"
              className="w-full h-12 rounded-xl border-primary/40 bg-primary/10 text-foreground hover:bg-primary/20 shadow-soft flex items-center gap-3 justify-center text-sm font-medium"
            >
              <FileText className="w-5 h-5 text-primary" />
              <span>📄 Leitor de Texto (OCR)</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">— Extraia texto de fotos e documentos</span>
            </Button>
          </div>
        </section>

        <QuickDialSection />
        <ServicesSection 
          onServiceClick={handleServiceClick} 
          cityContacts={cityContacts}
        />
      </main>

      <Footer />

      <ChatInterface
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialCep={userCep}
        initialService={selectedService}
        cityInfo={userCityInfo || (cityContacts ? { city: cityContacts.city, state: cityContacts.state } : undefined)}
        cityContacts={cityContacts}
      />

      <ContactsModal
        isOpen={contactsModalOpen}
        onClose={() => setContactsModalOpen(false)}
        contacts={cityContacts}
        serviceType={modalServiceType}
        cep={userCep}
      />
    </div>
  );
};

export default Index;
