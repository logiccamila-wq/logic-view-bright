import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type Prediction = {
  vehicle_id?: string;
  plate?: string;
  system: string;
  risk: number;
  due_in_days: number;
};

export default function PredictiveMaintenance() {
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/predict-maintenance");
      const js = await r.json();
      setPreds(js.predictions || []);
    } catch (e: any) {
      setError(e?.message || "Falha ao gerar previsões");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manutenção Preditiva</h1>
          <p className="text-muted-foreground">IA/ML para antecipar falhas de frota</p>
        </div>
        {error && (
          <Card className="border-destructive"><CardContent className="p-4 text-destructive">{error}</CardContent></Card>
        )}
        <div className="flex gap-2">
          <Button onClick={load} disabled={loading}>Atualizar Previsões</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preds.map((p, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle>{p.plate || p.vehicle_id || 'Veículo'} — {p.system}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">Risco: <span className="font-bold">{Math.round(p.risk * 100)}%</span></div>
                <div className="text-sm">Vence em: <span className="font-bold">{p.due_in_days}d</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
