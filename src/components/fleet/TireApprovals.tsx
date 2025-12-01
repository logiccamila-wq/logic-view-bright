import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

type Event = { id: string; event_type: string; vehicle_plate: string | null; position: string | null; km_vehicle: number | null; tread_depth_mm: number | null; pressure_psi: number | null; temperature_celsius: number | null; timestamp: string };

export function TireApprovals() {
  const { user, hasRole } = useAuth();
  const [pending, setPending] = useState<Event[]>([]);

  const load = async () => {
    const { data } = await supabase.from("tire_events" as any).select("id,event_type,vehicle_plate,position,km_vehicle,tread_depth_mm,pressure_psi,temperature_celsius,timestamp,authorized_by").is("authorized_by", null).order("timestamp", { ascending: false }).limit(50);
    setPending(((data as any) || []).filter((e: any) => ["instalacao","remocao","rodizio","recapagem","descarte"].includes(e.event_type)));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("tire_events" as any).update({ authorized_by: user.id }).eq("id", id);
    if (!error) load();
  };

  if (!hasRole("maintenance_manager") && !hasRole("fleet_maintenance") && !hasRole("admin")) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Aprovações de Movimentação de Pneus</h3><Button variant="outline" onClick={load}>Atualizar</Button></div>
      <div className="space-y-2">
        {pending.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhuma movimentação pendente</div>
        ) : pending.map((e) => (
          <div key={e.id} className="flex items-center justify-between p-2 rounded-md border">
            <div className="text-sm">{e.event_type.toUpperCase()} • {e.vehicle_plate} • {e.position} • {new Date(e.timestamp).toLocaleString("pt-BR")}</div>
            <div className="flex gap-2">
              <Button variant="modern" onClick={() => approve(e.id)}>Aprovar</Button>
              <Button variant="outline">Detalhes</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

