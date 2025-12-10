import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { predictNextMaintenance, optimizeFuelCosts, predictTireFailureRisk } from "@/utils/mlPredictive";

type Insight = {
  title: string;
  value: string | number;
  detail?: string;
};

export default function Supergestor() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const since = new Date();
      since.setMonth(since.getMonth() - 12);

      const { data: rev } = await supabase
        .from("revenue_records")
        .select("valor_frete, valor_icms, data_emissao")
        .order("data_emissao", { ascending: false })
        .limit(2000);

      const receitaTotal = (rev || [])
        .filter(r => new Date(r.data_emissao).getTime() >= since.getTime())
        .reduce((s, r) => s + (r.valor_frete || 0), 0);

      const icmsTotal = (rev || [])
        .filter(r => new Date(r.data_emissao).getTime() >= since.getTime())
        .reduce((s, r) => s + (r.valor_icms || 0), 0);

      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("id, status");
      const vehiclesActive = (vehicles || []).filter(v => String(v.status || '').toUpperCase().includes("ATIV")).length || (vehicles || []).length;

      const { data: orders } = await supabase
        .from("service_orders")
        .select("status, vehicle_plate, odometer, created_at, completed_at, labor_hours");
      const ordersPending = (orders || []).filter(o => (o.status || '').toLowerCase().includes("abert") || (o.status || '').toLowerCase().includes("pend")).length;

      const { data: ncs, error: ncErr } = await (supabase as any)
        .from("non_conformities")
        .select("severity, status")
        .limit(500);
      const criticalNC = ncErr ? 0 : (ncs || []).filter((n: any) => (n.status || '').toLowerCase().includes("open") || (n.severity || 0) >= 7).length;

      const { data: trips } = await (supabase as any)
        .from("trips")
        .select("status")
        .limit(500);
      const tripsRunning = (trips || []).filter((t: any) => (t.status || '').toLowerCase().includes("andamento") || (t.status || '').toLowerCase().includes("ativa")).length;

      const { data: refuelings } = await supabase
        .from("refuelings")
        .select("cost_per_km, timestamp, vehicle_plate")
        .order("timestamp", { ascending: false })
        .limit(2000);
      const fuel = optimizeFuelCosts((refuelings || []).map(r => ({
        km: 0,
        liters: 0,
        total_value: 0,
        cost_per_km: r.cost_per_km,
        timestamp: r.timestamp,
        vehicle_plate: r.vehicle_plate,
      })));
      const avgCostKm = fuel.avgCostPerKm;

      const byPlate = new Map<string, any[]>();
      (orders || []).forEach(o => {
        if (!byPlate.has(o.vehicle_plate)) byPlate.set(o.vehicle_plate, []);
        byPlate.get(o.vehicle_plate)!.push(o);
      });
      let predictedMaint = 0;
      byPlate.forEach((list, plate) => {
        const currentOdo = Math.max(...list.map(l => l.odometer || 0));
        const pred = predictNextMaintenance(list.map(l => ({
          status: l.status,
          created_at: l.created_at || new Date().toISOString(),
          completed_at: l.completed_at,
          vehicle_plate: plate,
          odometer: l.odometer || 0,
          labor_hours: l.labor_hours || 0,
        })), currentOdo);
        if (pred.predictedDays <= 30) predictedMaint += 1;
      });

      const { data: tpms } = await supabase
        .from("tpms_readings")
        .select("pressure_psi, temperature_celsius, tread_depth_mm, alert_level, created_at, vehicle_plate, tire_position")
        .order("created_at", { ascending: false })
        .limit(200);
      const tire = (tpms && tpms.length > 0) ? predictTireFailureRisk(tpms) : null;

      const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
      const list: Insight[] = [
        { title: "Receita Total (12m)", value: fmt.format(receitaTotal || 0) },
        { title: "ICMS Total (12m)", value: fmt.format(icmsTotal || 0) },
        { title: "Veículos Ativos", value: vehiclesActive || 0 },
        { title: "Ordens Pendentes", value: ordersPending || 0 },
        { title: "NCs Críticas", value: criticalNC || 0 },
        { title: "Rotas em Andamento", value: tripsRunning || 0 },
        { title: "Custo/KM Médio", value: avgCostKm || "--" },
        { title: "Previsões Manutenção (30d)", value: predictedMaint || 0, detail: tire ? `Risco pneus: ${tire.riskScore}%` : undefined },
      ];
      setInsights(list);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Falha ao carregar insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsights(); }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Supergestor</h1>
          <p className="text-muted-foreground">IA integrada para decisões operacionais e financeiras</p>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((i, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle>{i.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{i.value}</div>
                {i.detail && <p className="text-sm text-muted-foreground mt-1">{i.detail}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={fetchInsights} disabled={loading}>Atualizar Insights</Button>
          <Button variant="outline" onClick={async () => {
            try {
              const r = await fetch("/api/predict-maintenance");
              const js = await r.json();
              alert(`Previstos: ${js.predictions?.length || 0}`);
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              alert(`Falha ao rodar preditivo: ${msg}`);
            }
          }}>Rodar Preditivo</Button>
        </div>
      </div>
    </Layout>
  );
}
