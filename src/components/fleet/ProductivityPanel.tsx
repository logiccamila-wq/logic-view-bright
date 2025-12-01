import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { prescriptiveActions } from "@/utils/mlPredictive";

type Work = { driver_id: string; vehicle_plate: string; start_time: string; end_time: string; km_start: number | null; km_end: number | null };

export function ProductivityPanel() {
  const [sessions, setSessions] = useState<Work[]>([]);
  const [period, setPeriod] = useState<{ from?: string; to?: string }>({});

  const load = async () => {
    let query = supabase.from("driver_work_sessions" as any).select("driver_id,vehicle_plate,start_time,end_time,km_start,km_end").order("start_time", { ascending: false }).limit(500);
    if (period.from) query = query.gte("start_time", period.from);
    if (period.to) query = query.lte("end_time", period.to);
    const { data } = await query;
    setSessions((data as any) || []);
  };

  useEffect(() => { load(); }, [period.from, period.to]);

  const kmByVehicle = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => {
      const km = (s.km_end || 0) - (s.km_start || 0);
      if (!map[s.vehicle_plate]) map[s.vehicle_plate] = 0;
      map[s.vehicle_plate] += Math.max(0, km);
    });
    return map;
  }, [sessions]);

  const kmByDriver = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => {
      const km = (s.km_end || 0) - (s.km_start || 0);
      if (!map[s.driver_id]) map[s.driver_id] = 0;
      map[s.driver_id] += Math.max(0, km);
    });
    return map;
  }, [sessions]);

  const dispersion = useMemo(() => {
    const vals = Object.values(kmByVehicle);
    if (vals.length === 0) return 0;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return max - min;
  }, [kmByVehicle]);

  const prescribe = async () => {
    const recs = prescriptiveActions({ failureRisk: 0.5, costTrend: 'increasing' });
    // Em caso de grande dispersão, adicionar recomendação específica
    if (dispersion > 5000) recs.push('Redistribuir rotas para equilibrar quilometragem');
    for (const r of recs) {
      await supabase.from('process_actions' as any).insert({ module: 'operations', type: 'productivity', title: r, description: 'Gerado automaticamente', priority: 'high', due_date: new Date(Date.now() + 5*24*60*60*1000).toISOString() } as any);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Produtividade (KM por veículo e motorista)</h3>
        <div className="flex gap-2">
          <input type="date" className="border rounded px-2 py-1" onChange={(e)=>setPeriod({...period, from: e.target.value})} />
          <input type="date" className="border rounded px-2 py-1" onChange={(e)=>setPeriod({...period, to: e.target.value})} />
          <Button variant="modern" onClick={prescribe}>Gerar Prescrições</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-2">KM por Veículo</div>
          <BarChart width={500} height={250} data={Object.entries(kmByVehicle).map(([plate, km])=>({ plate, km }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="plate" />
            <YAxis />
            <Bar dataKey="km" fill="#3b82f6" />
          </BarChart>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-2">KM por Motorista</div>
          <BarChart width={500} height={250} data={Object.entries(kmByDriver).map(([driver, km])=>({ driver, km }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="driver" />
            <YAxis />
            <Bar dataKey="km" fill="#10b981" />
          </BarChart>
        </Card>
      </div>
      <div className="mt-4 text-sm">Dispersão de quilometragem entre veículos: {dispersion.toLocaleString()} km {dispersion > 5000 ? '• ALERTA: alto desequilíbrio' : ''}</div>
    </Card>
  );
}

