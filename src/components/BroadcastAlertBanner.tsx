import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface BroadcastAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  created_at: string;
}

const BroadcastAlertBanner = () => {
  const [alerts, setAlerts] = useState<BroadcastAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { sendNotification } = useNotifications();

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from("broadcast_alerts")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (data) setAlerts(data);
    };
    fetchAlerts();

    // Listen for new broadcast alerts in realtime
    const channel = supabase
      .channel("broadcast-alerts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "broadcast_alerts" },
        (payload) => {
          const newAlert = payload.new as BroadcastAlert;
          setAlerts((prev) => [newAlert, ...prev]);
          // Also send push notification
          sendNotification(`🚨 ${newAlert.title}`, {
            body: newAlert.message,
            tag: `broadcast-${newAlert.id}`,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "broadcast_alerts" },
        (payload) => {
          const updated = payload.new as BroadcastAlert & { active: boolean };
          if (!updated.active) {
            setAlerts((prev) => prev.filter((a) => a.id !== updated.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sendNotification]);

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "warning": return "bg-orange-500 text-white";
      default: return "bg-primary text-primary-foreground";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-5 w-5 shrink-0" />;
      case "warning": return <AlertTriangle className="h-5 w-5 shrink-0" />;
      default: return <Info className="h-5 w-5 shrink-0" />;
    }
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60]">
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className={`${getSeverityStyle(alert.severity)} px-4 py-3`}
          >
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1 min-w-0">
                <strong className="text-sm">{alert.title}</strong>
                <p className="text-xs opacity-90 truncate">{alert.message}</p>
              </div>
              <button
                onClick={() => setDismissed((prev) => new Set(prev).add(alert.id))}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BroadcastAlertBanner;
