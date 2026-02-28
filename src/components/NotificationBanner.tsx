import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";

const DISMISSED_KEY = "sos-notif-banner-dismissed";

const NotificationBanner = () => {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    if (permission === "granted" || permission === "denied") return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [isSupported, permission]);

  const handleEnable = async () => {
    await requestPermission();
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-4 right-4 z-50 bg-card border border-border rounded-2xl p-4 shadow-lg flex items-center gap-3"
        >
          <div className="bg-warning/15 rounded-full p-2">
            <Bell className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm">Ative os alertas de emergência</p>
            <p className="text-xs text-muted-foreground">Receba notificações de desastres próximos</p>
          </div>
          <Button size="sm" onClick={handleEnable} className="rounded-full text-xs font-bold bg-warning hover:bg-warning/90 text-warning-foreground">
            Ativar
          </Button>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationBanner;
