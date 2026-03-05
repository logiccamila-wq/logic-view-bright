import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SignaturePad } from "@/components/ui/SignaturePad";

const EHS = () => {
  const incidents = useQuery({
    queryKey: ["ehs_incidents"],
    queryFn: async () => (await supabase.from("ehs_incidents" as any).select("*").order("occurred_at", { ascending: false })).data as any[] || [],
  });
  const manifests = useQuery({
    queryKey: ["ehs_manifests"],
    queryFn: async () => (await supabase.from("ehs_chemical_manifests" as any).select("*").order("created_at", { ascending: false })).data as any[] || [],
  });
  const trainings = useQuery({
    queryKey: ["ehs_training_records"],
    queryFn: async () => (await supabase.from("ehs_training_records" as any).select("*").order("issue_date", { ascending: false })).data as any[] || [],
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ severity: 5 });

  const createIncident = async () => {
    const { error } = await supabase.from("ehs_incidents" as any).insert({
      vehicle_plate: form.vehicle_plate,
      product: form.product,
      severity: Number(form.severity),
      description: form.description,
      occurred_at: form.occurred_at || new Date().toISOString(),
      location: form.location ? { lat: form.lat, lon: form.lon } : null,
    } as any);
    if (!error) { setOpen(false); incidents.refetch(); }
  };

  return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">EHS / SSMA</h1>
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="incidents">Incidentes</TabsTrigger>
            <TabsTrigger value="manifests">FDS / NBR 7503</TabsTrigger>
            <TabsTrigger value="training">Treinamentos</TabsTrigger>
            <TabsTrigger value="capa">CAPA</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Incidentes</div><div className="text-3xl font-bold">{incidents.data?.length || 0}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Treinamentos</div><div className="text-3xl font-bold">{trainings.data?.length || 0}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Fichas</div><div className="text-3xl font-bold">{manifests.data?.length || 0}</div></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Incidentes por Severidade</CardTitle></CardHeader>
              <CardContent className="p-4">
                <BarChart width={600} height={260} data={[1,2,3,4,5,6,7,8,9,10].map(s=>({ sev: s, qtd: (incidents.data||[]).filter(i=>i.severity===s).length }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sev" />
                  <YAxis />
                  <Bar dataKey="qtd" fill="#3b82f6" />
                </BarChart>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Incidentes por Placa</CardTitle></CardHeader>
              <CardContent className="p-4">
                <BarChart width={600} height={260} data={Object.entries(((incidents.data||[]).reduce((acc:any,i:any)=>{ acc[i.vehicle_plate||'']=(acc[i.vehicle_plate||'']||0)+1; return acc; },{}))).map(([plate,qtd])=>({ plate, qtd }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plate" />
                  <YAxis />
                  <Bar dataKey="qtd" fill="#10b981" />
                </BarChart>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button variant="modern">Registrar Incidente</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Novo Incidente</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Placa" onChange={(e)=>setForm({...form, vehicle_plate: e.target.value.toUpperCase()})} />
                    <Input placeholder="Produto" onChange={(e)=>setForm({...form, product: e.target.value})} />
                    <Input placeholder="Descrição" onChange={(e)=>setForm({...form, description: e.target.value})} />
                    <Input type="number" min={1} max={10} placeholder="Severidade" value={form.severity} onChange={(e)=>setForm({...form, severity: Number(e.target.value)})} />
                    <Input type="datetime-local" onChange={(e)=>setForm({...form, occurred_at: e.target.value})} />
                    <Input placeholder="Lat" onChange={(e)=>setForm({...form, lat: e.target.value})} />
                    <Input placeholder="Lon" onChange={(e)=>setForm({...form, lon: e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-2 mt-3"><Button variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button onClick={createIncident}>Salvar</Button></div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-3">
              {(incidents.data || []).map((i:any)=>(<Card key={i.id} className="p-4"><div className="flex items-center justify-between"><div><div className="font-semibold">{i.product} • {i.vehicle_plate||''}</div><div className="text-sm text-muted-foreground">Sev {i.severity} • {i.occurred_at ? new Date(i.occurred_at).toLocaleString('pt-BR') : '-'}</div></div><div className="text-sm">{i.status}</div></div></Card>))}
            </div>
          </TabsContent>

          <TabsContent value="manifests" className="space-y-4">
            <div className="grid gap-3">
              {(manifests.data || []).map((m:any)=>(<Card key={m.id} className="p-4"><div className="flex items-center justify-between"><div><div className="font-semibold">{m.product} • UN {m.un_number}</div><div className="text-sm text-muted-foreground">Classe {m.risk_class} • FDS: {m.fds_url}</div></div></div></Card>))}
            </div>
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <div className="grid gap-3">
              {(trainings.data || []).map((t:any)=>(<Card key={t.id} className="p-4"><div className="flex items-center justify-between"><div><div className="font-semibold">{t.training_type} • {t.certificate_id}</div><div className="text-sm text-muted-foreground">{t.issue_date} → {t.expiry_date} • {t.status}</div></div></div></Card>))}
            </div>
          </TabsContent>
          <TabsContent value="capa" className="space-y-4">
            <CapaManager />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default EHS;

function CapaManager() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [signature, setSignature] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");

  const load = async () => {
    const { data } = await supabase.from("capa_records" as any).select("*").order("created_at", { ascending: false }).limit(100);
    setList((data as any) || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const { error } = await supabase.from("capa_records" as any).insert({
      nc_id: form.nc_id,
      vehicle_plate: form.vehicle_plate,
      root_cause: form.root_cause,
      actions: form.actions ? JSON.parse(form.actions) : null,
      due_date: form.due_date,
      signature_base64: signature || null,
      attachments: attachmentUrl ? [{ url: attachmentUrl }] : null,
    } as any);
    if (!error) { setForm({}); load(); }
  };

  const close = async (id: string) => {
    const { error } = await supabase.from("capa_records" as any).update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", id);
    if (!error) load();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="NC ID" onChange={(e)=>setForm({...form, nc_id: e.target.value})} />
          <Input placeholder="Placa" onChange={(e)=>setForm({...form, vehicle_plate: e.target.value.toUpperCase()})} />
          <Input placeholder="Causa raiz" onChange={(e)=>setForm({...form, root_cause: e.target.value})} />
          <Input placeholder='Ações (JSON)' onChange={(e)=>setForm({...form, actions: e.target.value})} />
          <Input type="date" onChange={(e)=>setForm({...form, due_date: e.target.value})} />
          <SignaturePad onSave={(data)=>setSignature(data)} />
          <Input placeholder="URL de Anexo (PDF/Imagem)" onChange={(e)=>setAttachmentUrl(e.target.value)} />
        </div>
        <div className="flex justify-end mt-3"><Button onClick={create}>Criar CAPA</Button></div>
      </Card>
      <div className="grid gap-2">
        {list.map((c:any)=>(
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.root_cause}</div>
                <div className="text-sm text-muted-foreground">{c.vehicle_plate || ''} • Vence: {c.due_date ? new Date(c.due_date).toLocaleDateString('pt-BR') : ''}</div>
              </div>
              {c.status !== 'closed' && <Button variant="modern" onClick={()=>close(c.id)}>Encerrar</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
