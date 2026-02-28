import { Shield, Menu, HandHeart, Bell, BellRing, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

const Header = ({ onDonateClick }: { onDonateClick?: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSupported, permission, requestPermission } = useNotifications();
  const { toast } = useToast();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({ title: "🔔 Notificações ativadas!", description: "Você receberá alertas de emergência e desastres." });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "SOS Cidadão",
      text: "🆘 SOS Cidadão — Sistema Nacional de Emergência. Tenha acesso rápido a serviços de emergência, alertas de desastre e muito mais!",
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareData.url);
      toast({ title: "📋 Link copiado!", description: "Compartilhe com familiares e amigos." });
    }
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground leading-tight">SOS Cidadão</h1>
            <p className="text-xs text-muted-foreground">Serviços de emergência</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isSupported && permission !== "granted" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEnableNotifications}
              className="relative"
              title="Ativar notificações"
            >
              <Bell className="w-5 h-5 text-warning" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full animate-pulse" />
            </Button>
          )}
          {isSupported && permission === "granted" && (
            <Button variant="ghost" size="icon" disabled className="opacity-60" title="Notificações ativadas">
              <BellRing className="w-5 h-5 text-success" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={scrollToTop}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
          >
            Início
          </button>
          <button 
            onClick={() => scrollToSection("servicos")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
          >
            Serviços
          </button>
          <button 
            onClick={() => scrollToSection("sobre")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
          >
            Sobre
          </button>
          <Button variant="outline" size="sm" onClick={onDonateClick} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
            <HandHeart className="w-4 h-4" />
            Doar
          </Button>
          <Button variant="hero" size="sm" onClick={() => scrollToSection("emergencia")}>
            Emergência
          </Button>
        </nav>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <button 
              onClick={scrollToTop}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth py-2 text-left"
            >
              Início
            </button>
            <button 
              onClick={() => scrollToSection("servicos")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth py-2 text-left"
            >
              Serviços
            </button>
            <button 
              onClick={() => scrollToSection("sobre")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth py-2 text-left"
            >
              Sobre
            </button>
            <Button variant="outline" size="lg" className="gap-2" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Compartilhar App
            </Button>
            <Button variant="outline" size="lg" className="gap-2 border-primary/30 text-primary" onClick={() => { onDonateClick?.(); setMenuOpen(false); }}>
              <HandHeart className="w-4 h-4" />
              Ajude o Desenvolvedor
            </Button>
            <Button variant="emergency" size="lg" className="mt-2" onClick={() => scrollToSection("emergencia")}>
              Emergência
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
