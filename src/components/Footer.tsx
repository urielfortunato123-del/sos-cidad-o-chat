import { Shield, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer id="sobre" className="bg-card border-t border-border py-12 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">SOS Cidadão</h3>
              <p className="text-sm text-muted-foreground">Seu assistente de emergência</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-smooth">Termos de Uso</a>
            <a href="#" className="hover:text-foreground transition-smooth">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-smooth">Contato</a>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Desenvolvido por</span>
            <span className="font-medium text-foreground">Uriel da Fonseca Fortunato</span>
            <Heart className="w-4 h-4 text-accent fill-accent" />
            <span>para o Brasil</span>
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
