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
import { Car } from "lucide-react";
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

        {/* Vehicle Emergency CTA */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <Button
              onClick={() => navigate("/emergencia-veicular")}
              className="w-full h-20 text-lg font-semibold rounded-2xl bg-warning text-warning-foreground hover:bg-warning/90 shadow-medium flex items-center gap-4 justify-center"
            >
              <Car className="w-8 h-8" />
              <div className="text-left">
                <div className="text-lg">🚗 Emergência Veicular</div>
                <div className="text-sm font-normal opacity-80">Problema no carro? Diagnóstico e mapa de serviços</div>
              </div>
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
