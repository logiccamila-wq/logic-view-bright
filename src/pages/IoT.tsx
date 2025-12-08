import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Satellite, Activity, Truck } from "lucide-react";

type Event = { ts: string; type: string; vehicle?: string; value?: number };

export default function IoT() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/iot-feed");
      const js = await r.json();
      setEvents(js.events || []);
    } catch (e: any) {
      setError(e?.message || 'Falha ao carregar IoT');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">IoT & Telemetria</h1>
          <p className="text-muted-foreground">Eventos de sensores e rastreamento</p>
        </div>
        {error && <Card className="border-destructive"><CardContent className="p-4 text-destructive">{error}</CardContent></Card>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex items-center gap-2"><Satellite className="w-5 h-5" /><CardTitle>Rastreamento</CardTitle></CardHeader>
            <CardContent>GPS/GLONASS com eventos de rota</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2"><Activity className="w-5 h-5" /><CardTitle>Telemetria</CardTitle></CardHeader>
            <CardContent>Velocidade, RPM, temperatura, pressão</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2"><Truck className="w-5 h-5" /><CardTitle>TPMS</CardTitle></CardHeader>
            <CardContent>Pressão de pneus por veículo</CardContent>
          </Card>
        </div>
        <Button onClick={load} disabled={loading}>Atualizar feed</Button>
        <div className="grid gap-2">
          {events.map((e, idx) => (
            <div key={idx} className="text-sm text-muted-foreground">
              {e.ts ? new Date(e.ts).toLocaleString('pt-BR') : '-'} — {e.type} — {e.vehicle || ''} {typeof e.value !== 'undefined' ? `(${e.value})` : ''}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
