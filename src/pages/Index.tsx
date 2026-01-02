import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import QuickDialSection from "@/components/QuickDialSection";
import ChatInterface from "@/components/ChatInterface";
import ContactsModal from "@/components/ContactsModal";
import Footer from "@/components/Footer";
import EmergencyFloatingButton from "@/components/EmergencyFloatingButton";
import AccessibilityBar from "@/components/AccessibilityBar";
import BackgroundMusic from "@/components/BackgroundMusic";
import { getContactsByCep, CityContacts, emergencyNumbers } from "@/utils/cityContacts";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
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
      <AccessibilityBar />
      <EmergencyFloatingButton />
      <BackgroundMusic />
      
      <main className="pt-16">
        <HeroSection onStartChat={handleStartChat} />
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
