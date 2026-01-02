import { Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
            Início
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
            Serviços
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
            Sobre
          </a>
          <Button variant="hero" size="sm">
            Emergência
          </Button>
        </nav>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth py-2">
              Início
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth py-2">
              Serviços
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth py-2">
              Sobre
            </a>
            <Button variant="emergency" size="lg" className="mt-2">
              Emergência
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
