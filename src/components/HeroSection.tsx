import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { smartLookup, AddressResult } from "@/utils/addressLookup";
import { useToast } from "@/hooks/use-toast";

interface HeroSectionProps {
  onStartChat: (cep: string, cityInfo?: { city: string; state: string }) => void;
}

const HeroSection = ({ onStartChat }: HeroSectionProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      toast({
        title: "Campo vazio",
        description: "Digite um CEP, cidade ou endereço para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const result = await smartLookup(searchValue);
      
      if (result) {
        onStartChat(result.cep, { city: result.city, state: result.state });
      } else {
        // Tenta como CEP direto se tiver 8 dígitos
        const cleanNumbers = searchValue.replace(/\D/g, "");
        if (cleanNumbers.length === 8) {
          onStartChat(searchValue, undefined);
        } else {
          toast({
            title: "Localização não encontrada",
            description: "Tente digitar o CEP completo (ex: 01310-100) ou cidade com estado (ex: São Paulo, SP)",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível localizar o endereço. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center gradient-hero overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-2xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-primary-foreground/90">
              Disponível 24 horas
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6 leading-tight">
            Assistência Imediata
            <br />
            <span className="text-accent">ao Seu Alcance</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-lg mx-auto">
            Conecte-se aos serviços essenciais da sua região. 
            Falta de energia, emergências médicas, prefeitura e muito mais.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="CEP, cidade ou endereço"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-12 h-14 text-lg bg-card border-border rounded-xl shadow-medium"
                disabled={isSearching}
              />
            </div>
            <Button 
              type="submit" 
              variant="emergency" 
              size="xl"
              className="shadow-emergency"
              disabled={isSearching || !searchValue.trim()}
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {isSearching ? "Buscando..." : "Iniciar"}
            </Button>
          </form>

          <p className="text-sm text-primary-foreground/60 mt-4">
            Ex: 01310-100, São Paulo, Bauru SP, ou nome da cidade
          </p>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
