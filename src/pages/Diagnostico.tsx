import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Loader2, MapPin, Bell, Database, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface StatusItem {
  label: string;
  status: "ok" | "error" | "loading" | "unknown";
  detail?: string;
  icon: React.ReactNode;
}

const Diagnostico = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<StatusItem[]>([]);

  useEffect(() => {
    const checks: StatusItem[] = [
      { label: "Banco de dados", status: "loading", icon: <Database className="w-5 h-5" /> },
      { label: "Storage (fotos)", status: "loading", icon: <HardDrive className="w-5 h-5" /> },
      { label: "Localização GPS", status: "loading", icon: <MapPin className="w-5 h-5" /> },
      { label: "Notificações", status: "loading", icon: <Bell className="w-5 h-5" /> },
    ];
    setItems([...checks]);

    // DB check
    supabase.from("community_reports").select("id").limit(1).then(({ error }) => {
      checks[0] = { ...checks[0], status: error ? "error" : "ok", detail: error ? error.message : "Conectado" };
      setItems([...checks]);
    });

    // Storage check
    supabase.storage.from("reports").list("", { limit: 1 }).then(({ error }) => {
      checks[1] = { ...checks[1], status: error ? "error" : "ok", detail: error ? error.message : "Bucket OK" };
      setItems([...checks]);
    });

    // GPS
    if ("geolocation" in navigator) {
      navigator.permissions?.query({ name: "geolocation" }).then(result => {
        checks[2] = { ...checks[2], status: result.state === "granted" ? "ok" : result.state === "denied" ? "error" : "unknown", detail: result.state };
        setItems([...checks]);
      }).catch(() => {
        checks[2] = { ...checks[2], status: "unknown", detail: "Não verificável" };
        setItems([...checks]);
      });
    } else {
      checks[2] = { ...checks[2], status: "error", detail: "Não suportado" };
      setItems([...checks]);
    }

    // Notifications
    if ("Notification" in window) {
      checks[3] = { ...checks[3], status: Notification.permission === "granted" ? "ok" : Notification.permission === "denied" ? "error" : "unknown", detail: Notification.permission };
      setItems([...checks]);
    } else {
      checks[3] = { ...checks[3], status: "error", detail: "Não suportado" };
      setItems([...checks]);
    }
  }, []);

  const statusIcon = (s: StatusItem["status"]) => {
    if (s === "ok") return <CheckCircle className="w-5 h-5 text-success" />;
    if (s === "error") return <XCircle className="w-5 h-5 text-destructive" />;
    if (s === "loading") return <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />;
    return <div className="w-5 h-5 rounded-full bg-warning" />;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary-foreground hover:bg-primary-foreground/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-xl">🩺</span>
          <h1 className="text-lg font-bold">Diagnóstico do Sistema</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-3">
        {items.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-4 border border-border shadow-soft flex items-center gap-3">
            <div className="text-muted-foreground">{item.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{item.label}</p>
              {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
            </div>
            {statusIcon(item.status)}
          </motion.div>
        ))}
      </main>
    </div>
  );
};

export default Diagnostico;
