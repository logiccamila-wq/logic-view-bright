import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function LiveLocationToggle() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  const start = () => {
    if (!user) return;
    watchId.current = navigator.geolocation.watchPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      await supabase.from("vehicle_tracking" as any).insert({ driver_id: user.id, vehicle_plate: null, latitude, longitude, speed_kmh: null, recorded_at: new Date().toISOString() } as any);
    }, () => {}, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
    setEnabled(true);
  };

  const stop = () => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setEnabled(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant={enabled ? "destructive" : "modern"} onClick={enabled ? stop : start}>{enabled ? "Parar Localização Ao Vivo" : "Iniciar Localização Ao Vivo"}</Button>
    </div>
  );
}

