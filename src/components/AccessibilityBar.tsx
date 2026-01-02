import { ZoomIn, ZoomOut, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const AccessibilityBar = () => {
  const [fontSize, setFontSize] = useState(100);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 15, 150);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 15, 85);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const speakText = () => {
    const text = "Bem-vindo ao SOS Cidadão. Para emergências médicas, pressione o botão vermelho e ligue 192. Para polícia, ligue 190. Para bombeiros, ligue 193.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col gap-2 bg-card/95 backdrop-blur-sm rounded-xl p-2 shadow-soft border border-border">
      <Button
        variant="ghost"
        size="icon"
        onClick={increaseFontSize}
        title="Aumentar texto"
        className="hover:bg-primary/10"
      >
        <ZoomIn className="w-5 h-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={decreaseFontSize}
        title="Diminuir texto"
        className="hover:bg-primary/10"
      >
        <ZoomOut className="w-5 h-5" />
      </Button>

      <div className="h-px bg-border my-1" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={speakText}
        title="Ouvir instruções"
        className="hover:bg-primary/10"
      >
        <Volume2 className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default AccessibilityBar;
