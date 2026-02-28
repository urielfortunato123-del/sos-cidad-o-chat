import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const NOTIFICATION_PERMISSION_KEY = "sos-notification-permission";

export function useNotifications() {
  const { toast } = useToast();

  const isSupported = "Notification" in window;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({ title: "Notificações não suportadas", description: "Seu navegador não suporta notificações.", variant: "destructive" });
      return false;
    }
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") {
      toast({ title: "Notificações bloqueadas", description: "Ative nas configurações do navegador.", variant: "destructive" });
      return false;
    }
    const result = await Notification.requestPermission();
    if (result === "granted") {
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, "granted");
      return true;
    }
    return false;
  }, [isSupported, toast]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || Notification.permission !== "granted") return;
    try {
      const notifOptions: NotificationOptions & Record<string, unknown> = {
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "sos-alert",
        renotify: true,
        requireInteraction: true,
        ...options,
      };
      // vibrate is supported but not in all TS typings
      (notifOptions as any).vibrate = [200, 100, 200, 100, 200];
      const notification = new Notification(title, notifOptions);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch {
      // Fallback for environments where Notification constructor fails (e.g. some mobile browsers)
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          title,
          options,
        });
      }
    }
  }, [isSupported]);

  const sendDisasterAlert = useCallback((disasterType: string, emoji: string, location?: { lat: number; lng: number }) => {
    const body = location
      ? `${emoji} ${disasterType} reportado! Localização: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      : `${emoji} ${disasterType} reportado na sua região!`;

    sendNotification(`🆘 Alerta SOS: ${disasterType}`, {
      body,
      tag: `sos-disaster-${Date.now()}`,
      data: { type: "disaster", disasterType, location },
    });
  }, [sendNotification]);

  const sendProximityAlert = useCallback((eventName: string, emoji: string, distanceKm: number) => {
    sendNotification(`⚠️ Evento próximo: ${eventName}`, {
      body: `${emoji} ${eventName} a ${distanceKm.toFixed(1)}km de você. Fique atento!`,
      tag: `sos-proximity-${Date.now()}`,
    });
  }, [sendNotification]);

  return {
    isSupported,
    permission: isSupported ? Notification.permission : "denied",
    requestPermission,
    sendNotification,
    sendDisasterAlert,
    sendProximityAlert,
  };
}
