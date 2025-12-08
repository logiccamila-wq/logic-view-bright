import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VehicleSelect } from "@/components/VehicleSelect";
import { useState } from "react";

export default function Gate() {
  const [plate, setPlate] = useState("");
  const [driver, setDriver] = useState("");
  const [kind, setKind] = useState<"entry"|"exit">("entry");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");
    try {
      const r = await fetch("/api/gate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate, driver, kind }),
      });
      const js = await r.json();
      if (!r.ok) throw new Error(js?.error || "Falha no registro");
      setMessage("Evento registrado com sucesso");
      setPlate(""); setDriver(""); setKind("entry");
    } catch (e: any) {
      setMessage(e?.message || "Erro ao registrar");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portaria</h1>
          <p className="text-muted-foreground">Entrada/Saída de veículos e custo operacional</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registro de Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <VehicleSelect 
                  value={plate} 
                  onChange={setPlate}
                  placeholder="Selecione a placa"
                />
              </div>
              <Input placeholder="Motorista" value={driver} onChange={(e)=>setDriver(e.target.value)} />
              <select className="border rounded px-3 py-2" value={kind} onChange={(e)=>setKind(e.target.value as any)}>
                <option value="entry">Entrada</option>
                <option value="exit">Saída</option>
              </select>
            </div>
            <Button onClick={submit}>Registrar</Button>
            {message && <div className="text-sm text-muted-foreground">{message}</div>}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
