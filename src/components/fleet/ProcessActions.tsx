import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { prescriptiveActions } from "@/utils/mlPredictive";

type Action = { id: string; module: string; vehicle_plate?: string | null; type: string; title: string; description?: string | null; status: string; priority: string; due_date?: string | null; assigned_to?: string | null; created_by?: string | null; authorized_by?: string | null; completed_at?: string | null };

export function ProcessActions() {
  const { user } = useAuth();
  const [list, setList] = useState<Action[]>([]);
  const [form, setForm] = useState<Partial<Action>>({ module: "fleet", type: "maintenance", priority: "medium" });
  const [finance, setFinance] = useState<{ cpk?: string; entry?: string }>({});

  const overdue = useMemo(() => list.filter((a) => a.status !== "completed" && a.due_date && new Date(a.due_date) < new Date()), [list]);

  const load = async () => {
    const { data } = await supabase.from("process_actions" as any).select("*").order("due_date", { ascending: true }).limit(100);
    setList((data as any) || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const payload = { ...form, title: form.title || "Ação", created_by: user?.id } as any;
    const { error } = await supabase.from("process_actions" as any).insert(payload);
    if (!error) { setForm({ module: "fleet", type: "maintenance", priority: "medium" }); load(); }
  };

  const authorize = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("process_actions" as any).update({ authorized_by: user.id }).eq("id", id);
    if (!error) load();
  };

  const complete = async (id: string) => {
    const { error } = await supabase.from("process_actions" as any).update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id);
    if (!error) load();
  };

  const generatePrescriptions = async () => {
    const recs = prescriptiveActions({ failureRisk: 0.8, costTrend: 'increasing' });
    for (const r of recs) {
      const payload: any = { module: 'fleet', type: 'prescriptive', title: r, description: 'Gerado por análise preditiva', priority: 'high', due_date: new Date(Date.now() + 7*24*60*60*1000).toISOString(), vehicle_plate: form.vehicle_plate || null, created_by: user?.id };
      await supabase.from('process_actions' as any).insert(payload);
    }
    load();
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Ações de Processo</h3><div className="flex gap-2"><Button variant="outline" onClick={load}>Atualizar</Button><Button variant="modern" onClick={generatePrescriptions}>Gerar Prescrições</Button></div></div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Select value={form.module} onValueChange={(v) => setForm({ ...form, module: v })}><SelectTrigger><SelectValue placeholder="Módulo" /></SelectTrigger><SelectContent><SelectItem value="fleet">Frota</SelectItem><SelectItem value="mechanic">Mecânica</SelectItem><SelectItem value="operations">Operações</SelectItem><SelectItem value="finance">Financeiro</SelectItem></SelectContent></Select>
        <Input placeholder="Placa" value={form.vehicle_plate as any || ""} onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value.toUpperCase() })} />
        <Input placeholder="Título" value={form.title as any || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input type="date" value={(form.due_date as any) || ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        <Button onClick={create}>Criar</Button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Input placeholder="CPK (R$/km)" value={finance.cpk || ""} onChange={(e)=>setFinance({ ...finance, cpk: e.target.value })} />
        <Input placeholder="Finance Entry ID" value={finance.entry || ""} onChange={(e)=>setFinance({ ...finance, entry: e.target.value })} />
        <Button variant="outline" onClick={async ()=>{ if (!list[0]) return; await supabase.from('process_actions' as any).update({ cpk: finance.cpk ? parseFloat(finance.cpk) : null, financial_entry_id: finance.entry || null }).eq('id', list[0].id); load(); }}>Vincular Financeiro</Button>
      </div>
      <div className="grid gap-2">
        {list.map((a) => (
          <div key={a.id} className={`flex items-center justify-between p-2 rounded-md border ${overdue.includes(a) ? "bg-red-50" : ""}`}>
            <div className="text-sm">
              <div className="font-semibold">{a.title}</div>
              <div className="text-muted-foreground">{a.module} • {a.vehicle_plate || ""} • {a.type} • Status: {a.status} • Vencimento: {a.due_date ? new Date(a.due_date).toLocaleDateString("pt-BR") : ""}</div>
            </div>
            <div className="flex gap-2">
              {!a.authorized_by && <Button variant="outline" onClick={() => authorize(a.id)}>Autorizar</Button>}
              {a.status !== "completed" && <Button variant="modern" onClick={() => complete(a.id)}>Concluir</Button>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
