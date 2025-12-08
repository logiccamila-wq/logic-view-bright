import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Leaf, Recycle, Droplets, Zap } from "lucide-react";

type Metric = { key: string; label: string; value: number | string; icon?: any };

export default function ESG() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/esg-insights");
      const js = await r.json();
      const m: Metric[] = [
        { key: 'co2', label: 'CO₂/Km', value: js.co2_per_km ?? '--', icon: Leaf },
        { key: 'recycle', label: 'Reciclagem Pneus', value: js.tire_recycle_rate ?? '--', icon: Recycle },
        { key: 'water', label: 'Consumo de Água', value: js.water_use_index ?? '--', icon: Droplets },
        { key: 'energy', label: 'Energia Renovável', value: js.renewables_share ?? '--', icon: Zap },
      ];
      setMetrics(m);
    } catch (e: any) {
      setError(e?.message || 'Falha ao calcular ESG');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ESG</h1>
          <p className="text-muted-foreground">Indicadores ambientais, sociais e governança</p>
        </div>
        {error && <Card className="border-destructive"><CardContent className="p-4 text-destructive">{error}</CardContent></Card>}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <Card key={idx}>
                <CardHeader className="flex items-center gap-2">
                  {Icon && <Icon className="w-5 h-5 text-green-600" />}
                  <CardTitle>{m.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{String(m.value)}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Button onClick={load} disabled={loading}>Atualizar</Button>
      </div>
    </Layout>
  );
}
