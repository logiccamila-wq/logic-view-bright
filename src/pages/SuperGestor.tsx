import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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
      const r = await fetch("/api/supergestor-insights");
      const js = await r.json();
      const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
      const list: Insight[] = [
        { title: "Receita Total (12m)", value: fmt.format(js.receitaTotal || 0) },
        { title: "ICMS Total (12m)", value: fmt.format(js.icmsTotal || 0) },
        { title: "Veículos Ativos", value: js.vehiclesActive || 0 },
        { title: "Ordens Pendentes", value: js.ordersPending || 0 },
        { title: "NCs Críticas", value: js.criticalNC || 0 },
        { title: "Rotas em Andamento", value: js.tripsRunning || 0 },
        { title: "Custo/KM Médio", value: js.avgCostKm || "--" },
        { title: "Previsões Manutenção (30d)", value: js.predictedMaint || 0 },
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
