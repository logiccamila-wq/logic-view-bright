import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type Policy = {
  id: string;
  vehicle_plate: string;
  insurer_name: string;
  policy_number: string;
  issue_date: string | null;
  expiry_date: string | null;
  premium_value: number | null;
  status: string;
};

const Insurance = () => {
  const policiesQuery = useQuery({
    queryKey: ["insurance_policies"],
    queryFn: async () => {
      const { data } = await supabase.from("insurance_policies" as any).select("*").order("created_at", { ascending: false });
      return (data as any) as Policy[];
    },
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Policy>>({});

  const create = async () => {
    const { error } = await supabase.from("insurance_policies" as any).insert({
      vehicle_plate: form.vehicle_plate,
      insurer_name: form.insurer_name,
      policy_number: form.policy_number,
      issue_date: form.issue_date,
      expiry_date: form.expiry_date,
      premium_value: form.premium_value,
      status: form.status || "active",
    } as any);
    if (!error) {
      setOpen(false);
      policiesQuery.refetch();
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Apólices de Seguro</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="modern">Nova Apólice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar Apólice</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Placa" onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value.toUpperCase() })} />
                <Input placeholder="Seguradora" onChange={(e) => setForm({ ...form, insurer_name: e.target.value })} />
                <Input placeholder="Nº Apólice" onChange={(e) => setForm({ ...form, policy_number: e.target.value })} />
                <Input type="date" placeholder="Emissão" onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
                <Input type="date" placeholder="Validade" onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
                <Input type="number" placeholder="Prêmio (R$)" onChange={(e) => setForm({ ...form, premium_value: parseFloat(e.target.value) })} />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={create}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3">
          {(policiesQuery.data || []).map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.policy_number} • {p.insurer_name}</div>
                  <div className="text-sm text-muted-foreground">{p.vehicle_plate} • Emissão: {p.issue_date} • Validade: {p.expiry_date}</div>
                </div>
                <div className="text-sm">{p.status}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Insurance;

