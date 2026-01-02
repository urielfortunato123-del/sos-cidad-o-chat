import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import QuickDialSection from "@/components/QuickDialSection";
import ChatInterface from "@/components/ChatInterface";
import Footer from "@/components/Footer";
import EmergencyFloatingButton from "@/components/EmergencyFloatingButton";
import AccessibilityBar from "@/components/AccessibilityBar";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [userCep, setUserCep] = useState("");
  const [selectedService, setSelectedService] = useState<string | undefined>();

  const handleStartChat = (cep: string) => {
    setUserCep(cep);
    setSelectedService(undefined);
    setChatOpen(true);
  };

  const handleServiceClick = (service: string) => {
    if (!userCep) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSelectedService(service);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AccessibilityBar />
      <EmergencyFloatingButton />
      
      <main className="pt-16">
        <HeroSection onStartChat={handleStartChat} />
        <QuickDialSection />
        <ServicesSection onServiceClick={handleServiceClick} />
      </main>

      <Footer />

      <ChatInterface
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialCep={userCep}
        initialService={selectedService}
      />
    </div>
  );
};

export default Index;
