import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-destructive rounded-2xl flex items-center justify-center mx-auto">
          <Smartphone className="w-12 h-12 text-destructive-foreground" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          Instalar Emergência Cidadão
        </h1>

        {isInstalled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-500">
              <Check className="w-6 h-6" />
              <span className="text-lg font-medium">App já instalado!</span>
            </div>
            <Button onClick={() => navigate("/")} className="w-full">
              Abrir App
            </Button>
          </div>
        ) : isIOS ? (
          <div className="space-y-4 text-muted-foreground">
            <p>Para instalar no iPhone/iPad:</p>
            <ol className="text-left space-y-2 bg-muted p-4 rounded-lg">
              <li>1. Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta)</li>
              <li>2. Role e toque em <strong>"Adicionar à Tela de Início"</strong></li>
              <li>3. Toque em <strong>"Adicionar"</strong></li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Instale o app para acesso rápido aos serviços de emergência, mesmo offline.
            </p>
            <Button onClick={handleInstall} size="lg" className="w-full gap-2">
              <Download className="w-5 h-5" />
              Instalar App
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-muted-foreground">
            <p>
              Abra este site no navegador Chrome ou Safari para instalar o app.
            </p>
          </div>
        )}

        <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground">
          Voltar para o site
        </Button>
      </div>
    </div>
  );
};

export default Install;
