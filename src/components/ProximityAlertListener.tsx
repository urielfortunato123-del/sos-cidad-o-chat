import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";

const PROXIMITY_RADIUS_KM = 10;

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Global listener that watches for new community reports
 * and sends proximity push notifications if within 10km.
 */
const ProximityAlertListener = () => {
  const { sendProximityAlert, permission } = useNotifications();
  const userPosRef = useRef<[number, number] | null>(null);

  // Get user location once
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userPosRef.current = [pos.coords.latitude, pos.coords.longitude];
      },
      () => {}, // silently fail
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  // Subscribe to new reports
  useEffect(() => {
    if (permission !== "granted") return;

    const channel = supabase
      .channel("global-proximity-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_reports" },
        (payload) => {
          const r = payload.new as any;
          if (!userPosRef.current) return;

          const dist = getDistance(
            userPosRef.current[0], userPosRef.current[1],
            r.lat, r.lng
          );

          if (dist <= PROXIMITY_RADIUS_KM) {
            sendProximityAlert(r.name, r.emoji, dist);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [permission, sendProximityAlert]);

  return null;
};

export default ProximityAlertListener;
