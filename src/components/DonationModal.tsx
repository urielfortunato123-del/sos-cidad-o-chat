import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Heart, Users, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import pixQrCode from "@/assets/pix-qrcode.webp";

const PIX_CODE = "00020126330014BR.GOV.BCB.PIX011136348348715204000053039865802BR5901N6001C62140510SOSCIDAD4O6304DF0C";

const DonationModal = ({ externalOpen, onExternalClose }: { externalOpen?: boolean; onExternalClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [totalAcessos, setTotalAcessos] = useState(0);
  const [copied, setCopied] = useState(false);
  const [animatePulse, setAnimatePulse] = useState(false);
  const isFirstLoad = useRef(true);
  const { toast } = useToast();

  useEffect(() => {
    // Show after 2 seconds on first visit per session
    const alreadyShown = sessionStorage.getItem("donation-shown");
    if (!alreadyShown) {
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("donation-shown", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (externalOpen) setOpen(true);
  }, [externalOpen]);

  useEffect(() => {
    // Initial fetch
    supabase
      .from("access_logs")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (count) setTotalAcessos(count);
        isFirstLoad.current = false;
      });

    // Realtime subscription
    const channel = supabase
      .channel("access-logs-count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "access_logs" },
        () => {
          setTotalAcessos(prev => prev + 1);
          if (!isFirstLoad.current) {
            setAnimatePulse(true);
            setTimeout(() => setAnimatePulse(false), 700);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CODE);
      setCopied(true);
      toast({ title: "✅ Código PIX copiado!", description: "Cole no seu app de banco para contribuir." });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ title: "Erro ao copiar", description: "Tente selecionar e copiar manualmente.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v && onExternalClose) onExternalClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-primary">
            <Heart className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            Ajude o Desenvolvedor
          </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-center text-sm leading-relaxed">
          Este aplicativo tem custos para se manter ativo e gratuito para todos. 
          Se ele te ajuda, considere fazer uma contribuição via PIX a partir de <strong className="text-primary">R$ 20,00</strong>! ⚓
        </p>

        <div className="flex justify-center">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <img
              src={pixQrCode}
              alt="QR Code PIX para doação"
              className="w-48 h-48 object-contain"
            />
          </div>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Escaneie o QR Code acima com seu app de banco para contribuir via PIX.
        </p>

        <div className="space-y-2">
          <p className="text-center text-sm font-semibold text-foreground">Pix Copia-e-cola:</p>
          <div
            className="relative flex items-center gap-2 rounded-xl border border-primary/30 bg-muted/50 p-3 cursor-pointer group"
            onClick={handleCopy}
          >
            <code className="text-[10px] sm:text-xs text-primary break-all flex-1 leading-relaxed">
              {PIX_CODE}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {copied && (
            <p className="text-center text-xs text-green-500 font-medium animate-in fade-in">
              ✅ Copiado!
            </p>
          )}
        </div>

        {totalAcessos > 0 && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Users className="w-4 h-4" />
            <span>
              Já são{" "}
              <strong
                className={`text-foreground inline-block transition-all duration-300 ${
                  animatePulse ? "scale-125 text-primary" : "scale-100"
                }`}
              >
                {totalAcessos.toLocaleString("pt-BR")}
              </strong>{" "}
              acessos!
            </span>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => setOpen(false)}
        >
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DonationModal;
