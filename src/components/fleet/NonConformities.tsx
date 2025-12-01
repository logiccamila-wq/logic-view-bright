import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type NC = { id: string; module: string; vehicle_plate?: string | null; description: string; severity: number; occurrence: number; detection: number; rpn: number; status: string };

export function NonConformities() {
  const [list, setList] = useState<NC[]>([]);
  const [form, setForm] = useState<Partial<NC>>({ module: "fleet", severity: 5, occurrence: 5, detection: 5 });

  const load = async () => {
    const { data } = await supabase.from("non_conformities" as any).select("id,module,vehicle_plate,description,severity,occurrence,detection,rpn,status").order("created_at", { ascending: false }).limit(100);
    setList((data as any) || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const payload = { ...form, description: form.description || "NC", severity: Number(form.severity), occurrence: Number(form.occurrence), detection: Number(form.detection) } as any;
    const { error } = await supabase.from("non_conformities" as any).insert(payload);
    if (!error) { setForm({ module: "fleet", severity: 5, occurrence: 5, detection: 5 }); load(); }
  };

  const close = async (id: string) => {
    const { error } = await supabase.from("non_conformities" as any).update({ status: "closed", resolved_at: new Date().toISOString() }).eq("id", id);
    if (!error) load();
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Não Conformidades (FMEA/RPN)</h3><Button variant="outline" onClick={load}>Atualizar</Button></div>
      <div className="grid grid-cols-6 gap-2 mb-3">
        <Select value={form.module} onValueChange={(v) => setForm({ ...form, module: v })}><SelectTrigger><SelectValue placeholder="Módulo" /></SelectTrigger><SelectContent><SelectItem value="fleet">Frota</SelectItem><SelectItem value="mechanic">Mecânica</SelectItem><SelectItem value="operations">Operações</SelectItem><SelectItem value="finance">Financeiro</SelectItem></SelectContent></Select>
        <Input placeholder="Placa" value={form.vehicle_plate as any || ""} onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value.toUpperCase() })} />
        <Input placeholder="Descrição" value={form.description as any || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Input type="number" min={1} max={10} placeholder="Sev" value={form.severity as any} onChange={(e) => setForm({ ...form, severity: Number(e.target.value) })} />
        <Input type="number" min={1} max={10} placeholder="Ocorr" value={form.occurrence as any} onChange={(e) => setForm({ ...form, occurrence: Number(e.target.value) })} />
        <Input type="number" min={1} max={10} placeholder="Detec" value={form.detection as any} onChange={(e) => setForm({ ...form, detection: Number(e.target.value) })} />
        <Button onClick={create}>Criar</Button>
      </div>
      <div className="grid gap-2">
        {list.map((nc) => (
          <div key={nc.id} className={`flex items-center justify-between p-2 rounded-md border ${nc.rpn >= 200 ? "bg-red-50" : nc.rpn >= 125 ? "bg-yellow-50" : ""}`}>
            <div className="text-sm">
              <div className="font-semibold">{nc.description}</div>
              <div className="text-muted-foreground">{nc.module} • {nc.vehicle_plate || ""} • S:{nc.severity} O:{nc.occurrence} D:{nc.detection} • RPN:{nc.rpn} • {nc.status}</div>
            </div>
            {nc.status !== "closed" && <Button variant="modern" onClick={() => close(nc.id)}>Encerrar</Button>}
          </div>
        ))}
      </div>
    </Card>
  );
}

