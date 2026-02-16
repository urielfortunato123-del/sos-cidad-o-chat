import { Shield, Heart, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = ({ onDonateClick }: { onDonateClick?: () => void }) => {
  return (
    <footer id="sobre" className="bg-card border-t border-border py-12 scroll-mt-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">SOS Cidadão</h3>
              <p className="text-sm text-muted-foreground">Seu assistente de emergência</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-smooth">Termos de Uso</a>
            <a href="#" className="hover:text-foreground transition-smooth">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-smooth">Contato</a>
          </div>

          {/* Donate + Credits */}
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onDonateClick}
              className="gap-2 border-primary/30 hover:bg-primary/10 text-primary"
            >
              <HandHeart className="w-4 h-4" />
              Ajude o Desenvolvedor
            </Button>
            <p className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap justify-center">
              <span>Desenvolvido por</span>
              <span className="font-medium text-foreground">Uriel da Fonseca Fortunato</span>
              <Heart className="w-4 h-4 text-accent fill-accent" />
              <span>para o Brasil</span>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 SOS Cidadão. Este é um serviço de orientação. Em casos de emergência real, ligue para os números oficiais: 190 (Polícia), 192 (SAMU), 193 (Bombeiros).
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
