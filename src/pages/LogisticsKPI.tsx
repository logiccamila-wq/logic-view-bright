import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { costPerKm, avgFuelKmPerLiter, emptyMileagePercent, operationalSpeed } from "@/utils/kpis";

const LogisticsKPI = () => {
  const refuel = useQuery({
    queryKey: ["refuelings"],
    queryFn: async () => (await supabase.from("refuelings" as any).select("km,liters,total_value,cost_per_km,timestamp").order("timestamp", { ascending: false })).data as any[] || [],
  });
  const deliveries = useQuery({
    queryKey: ["revenue_records"],
    queryFn: async () => (await supabase.from("revenue_records" as any).select("data_emissao,valor_frete,peso_kg").order("data_emissao", { ascending: false })).data as any[] || [],
  });
  const sessions = useQuery({
    queryKey: ["driver_work_sessions"],
    queryFn: async () => (await supabase.from("driver_work_sessions" as any).select("start_time,end_time,km_start,km_end").order("start_time", { ascending: false })).data as any[] || [],
  });

  const totalKm = (sessions.data||[]).reduce((s, w)=> s + Math.max(0,(w.km_end||0)-(w.km_start||0)), 0);
  const totalLiters = (refuel.data||[]).reduce((s, r)=> s + (r.liters||0), 0);
  const totalFuelCost = (refuel.data||[]).reduce((s, r)=> s + (r.total_value||0), 0);
  const avgCpk = (refuel.data||[]).filter(r=>r.cost_per_km).reduce((s,r)=>s+(r.cost_per_km||0),0)/Math.max(1,(refuel.data||[]).filter(r=>r.cost_per_km).length);

  const kmpl = avgFuelKmPerLiter(totalKm, totalLiters);
  const cpk = avgCpk || costPerKm(0, totalFuelCost, totalKm);
  const emptyPct = emptyMileagePercent(0, totalKm); // placeholder se não houver flag de vazio
  const speed = operationalSpeed(totalKm, ((sessions.data||[]).reduce((s,w)=> s + Math.max(0,(new Date(w.end_time||w.start_time).getTime()-new Date(w.start_time).getTime())/(1000*60*60)),0)));

  return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Indicadores Logísticos</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4"><div className="text-sm text-muted-foreground">Custo por KM</div><div className="text-3xl font-bold">R$ {cpk.toFixed(2)}</div></Card>
          <Card className="p-4"><div className="text-sm text-muted-foreground">Consumo Médio (KM/L)</div><div className="text-3xl font-bold">{kmpl.toFixed(2)}</div></Card>
          <Card className="p-4"><div className="text-sm text-muted-foreground">Quilometragem em Vazio</div><div className="text-3xl font-bold">{emptyPct.toFixed(1)}%</div></Card>
          <Card className="p-4"><div className="text-sm text-muted-foreground">Velocidade Média</div><div className="text-3xl font-bold">{speed.toFixed(1)} km/h</div></Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4"><div className="text-sm text-muted-foreground">Entregas Recentes</div><div className="text-3xl font-bold">{deliveries.data?.length || 0}</div></Card>
          <Card className="p-4"><div className="text-sm text-muted-foreground">Abastecimentos</div><div className="text-3xl font-bold">{refuel.data?.length || 0}</div></Card>
        </div>
      </div>
  );
};

export default LogisticsKPI;

