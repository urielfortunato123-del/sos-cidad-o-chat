import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ChatInterface from "@/components/ChatInterface";
import ContactsModal from "@/components/ContactsModal";
import Footer from "@/components/Footer";
import EmergencyFloatingButton from "@/components/EmergencyFloatingButton";
import BackgroundMusic from "@/components/BackgroundMusic";
import FeedbackModal from "@/components/FeedbackModal";
import DonationModal from "@/components/DonationModal";
import NotificationBanner from "@/components/NotificationBanner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getContactsByCep, CityContacts, emergencyNumbers } from "@/utils/cityContacts";
import { useToast } from "@/hooks/use-toast";
import { useAccessLog } from "@/hooks/useAccessLog";

const Index = () => {
  useAccessLog('/');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [chatOpen, setChatOpen] = useState(false);
  const [ocrMessage, setOcrMessage] = useState<string | undefined>();
  const [userCep, setUserCep] = useState("");
  const [userCityInfo, setUserCityInfo] = useState<{ city: string; state: string } | undefined>();
  const [selectedService, setSelectedService] = useState<string | undefined>();
  const [cityContacts, setCityContacts] = useState<CityContacts | null>(null);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [modalServiceType, setModalServiceType] = useState<"prefeitura" | "energia" | "agua" | "gas">("prefeitura");
  const [donationOpen, setDonationOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("chat") === "open") {
      const msg = searchParams.get("ocrMessage");
      const service = searchParams.get("service");
      if (msg) setOcrMessage(decodeURIComponent(msg));
      if (service) setSelectedService(service);
      setChatOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
    if (service === "samu") { window.location.href = `tel:${emergencyNumbers.samu.number}`; return; }
    if (service === "policia") { window.location.href = `tel:${emergencyNumbers.policia.number}`; return; }
    if (service === "bombeiros") { window.location.href = `tel:${emergencyNumbers.bombeiros.number}`; return; }

    if (!userCep || userCep.length < 8) {
      toast({ title: "CEP necessário", description: "Insira seu CEP para ver os contatos da sua região.", variant: "destructive" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (["prefeitura", "energia", "agua", "gas"].includes(service)) {
      setModalServiceType(service as any);
      setContactsModalOpen(true);
      return;
    }

    setSelectedService(service);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onDonateClick={() => setDonationOpen(true)} />
      <NotificationBanner />
      <EmergencyFloatingButton />
      <BackgroundMusic />
      <FeedbackModal />
      <DonationModal externalOpen={donationOpen} onExternalClose={() => setDonationOpen(false)} />

      <main className="pt-[calc(4rem+2.5rem)]">
        <HeroSection onStartChat={handleStartChat} />
        <ServicesSection onServiceClick={handleServiceClick} cityContacts={cityContacts} />
      </main>

      <Footer onDonateClick={() => setDonationOpen(true)} />

      <ChatInterface
        isOpen={chatOpen}
        onClose={() => { setChatOpen(false); setOcrMessage(undefined); }}
        initialCep={userCep}
        initialService={selectedService}
        cityInfo={userCityInfo || (cityContacts ? { city: cityContacts.city, state: cityContacts.state } : undefined)}
        cityContacts={cityContacts}
        initialMessage={ocrMessage}
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
