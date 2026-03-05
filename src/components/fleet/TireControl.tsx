import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { generateTireDiscardReport, generateTireRecapReport } from "@/utils/tireReport";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { VehicleSelect } from "@/components/VehicleSelect";

type Pneu = { id: string; codigo: string; medida: string; status: string; vehicle_plate: string | null; posicao: string | null; vida_util_km: number | null; valor_compra: number | null; valor_recape: number | null; km_instalacao: number | null; km_atual: number | null; life_stage: string };
type AxleConfig = { id: string; vehicle_plate: string; layout: string; axles: any };

const PRESETS = [
  { value: "4x2", label: "Cavalo Mecânico 4x2", axles: [{ dual: false, traction: true }, { dual: true, traction: false }] },
  { value: "6x2", label: "Cavalo Mecânico 6x2", axles: [{ dual: false, traction: true }, { dual: true, traction: false }, { dual: true, traction: false }] },
  { value: "6x4", label: "Cavalo Mecânico 6x4", axles: [{ dual: false, traction: true }, { dual: true, traction: true }, { dual: true, traction: false }] },
  { value: "carreta3", label: "Carreta 3 eixos", axles: [{ dual: true, traction: false }, { dual: true, traction: false }, { dual: true, traction: false }] },
  { value: "truck4x2", label: "Truck 4x2", axles: [{ dual: false, traction: false }, { dual: true, traction: true }] },
  { value: "truck6x2", label: "Truck 6x2", axles: [{ dual: false, traction: false }, { dual: true, traction: true }, { dual: true, traction: false }] },
  { value: "bitruck8x2", label: "Bi-truck 8x2", axles: [{ dual: false, traction: false }, { dual: false, traction: false }, { dual: true, traction: true }, { dual: true, traction: false }] },
];

export function TireControl() {
  const [plate, setPlate] = useState("");
  const [config, setConfig] = useState<AxleConfig | null>(null);
  const [pneus, setPneus] = useState<Pneu[]>([]);
  const [preset, setPreset] = useState(PRESETS[0].value);
  const [dragging, setDragging] = useState<Pneu | null>(null);
  const [measureOpen, setMeasureOpen] = useState(false);
  const [measure, setMeasure] = useState<{ position?: string; km?: string; tread?: string; psi?: string; temp?: string; lat?: string; lon?: string }>({});
  const [latestDepth, setLatestDepth] = useState<Record<string, number>>({});
  const [editAxlesOpen, setEditAxlesOpen] = useState(false);
  const [editAxles, setEditAxles] = useState<any[]>([]);
  const [recapDialog, setRecapDialog] = useState<{ open: boolean; pneu?: Pneu; shop?: string; valor?: string }>({ open: false });
  const [discardDialog, setDiscardDialog] = useState<{ open: boolean; pneu?: Pneu; motivo?: string; fmea?: { failure_mode?: string; causes?: string; effects?: string; severity?: number; occurrence?: number; detection?: number; actions?: string }; photos?: string[] }>({ open: false });

  const estoque = useMemo(() => pneus.filter(p => p.status === "estoque" && !p.vehicle_plate), [pneus]);
  const mounted = useMemo(() => pneus.filter(p => p.vehicle_plate === plate), [pneus, plate]);

  const fetchPneus = async () => {
    const { data } = await supabase.from("pneus" as any).select("*");
    setPneus((data as any) || []);
  };

  const fetchConfig = async () => {
    if (!plate) { setConfig(null); return; }
    const { data } = await supabase.from("vehicle_axle_configs" as any).select("*").eq("vehicle_plate", plate).maybeSingle();
    setConfig((data as any) || null);
  };

  useEffect(() => { fetchPneus(); }, []);
  useEffect(() => { fetchConfig(); }, [plate]);
  useEffect(() => { (async () => {
    if (!plate) return;
    const { data } = await supabase.from("tire_events" as any).select("position,tread_depth_mm,timestamp").eq("vehicle_plate", plate).order("timestamp", { ascending: false }).limit(200);
    const map: Record<string, number> = {};
    (data || []).forEach((e: any) => { if (e.tread_depth_mm != null && map[e.position] == null) map[e.position] = e.tread_depth_mm; });
    setLatestDepth(map);
  })(); }, [plate, pneus]);

  const savePreset = async () => {
    if (!plate) { toast.error("Selecione a placa"); return; }
    const presetCfg = PRESETS.find(p => p.value === preset)!;
    const axles = presetCfg.axles.map((ax, idx) => ({ index: idx + 1, dual: ax.dual, traction: ax.traction, suspended: false }));
    const { data, error } = await supabase.from("vehicle_axle_configs" as any).upsert({ vehicle_plate: plate, layout: preset, axles }, { onConflict: "vehicle_plate" }).select().maybeSingle();
    if (error) { toast.error("Falha ao salvar configuração"); return; }
    setConfig(data as any);
    toast.success("Configuração salva");
  };

  const saveAxleEdit = async () => {
    if (!plate) { toast.error("Selecione a placa"); return; }
    const { data, error } = await supabase.from("vehicle_axle_configs" as any)
      .upsert({ vehicle_plate: plate, layout: preset, axles: editAxles }, { onConflict: "vehicle_plate" })
      .select()
      .maybeSingle();
    if (error) { toast.error("Falha ao salvar eixos"); return; }
    setConfig(data as any);
    setEditAxlesOpen(false);
    toast.success("Eixos atualizados");
  };

  const positionsForAxle = (ax: any) => {
    if (ax.dual) return ["esq_externo", "esq_interno", "dir_externo", "dir_interno"];
    return ["esq", "dir"];
  };

  const onDrop = async (axIndex: number, pos: string) => {
    if (!dragging || !plate) return;
    const positionKey = `${axIndex}_${pos}`;
    const isRodizio = dragging.vehicle_plate === plate && !!dragging.posicao;
    const { error } = await supabase.from("pneus" as any)
      .update({ status: "em_uso", vehicle_plate: plate, posicao: positionKey })
      .eq("id", dragging.id);
    if (!error) {
      await supabase.from("tire_events" as any).insert({
        pneu_id: dragging.id,
        event_type: isRodizio ? "rodizio" : "instalacao",
        vehicle_plate: plate,
        position: positionKey,
      });
      setDragging(null);
      fetchPneus();
      toast.success(isRodizio ? "Rodízio registrado" : "Instalação concluída");
    }
  };

  const toColor = (p: Pneu | null) => {
    if (!p) return "bg-muted";
    const mm = latestDepth[p.posicao || ""] ?? null;
    if (mm === null) return "bg-secondary";
    if (mm >= 24) return "bg-green-500"; // >24mm
    if (mm >= 21) return "bg-blue-500";  // 21-24mm
    if (mm >= 16) return "bg-emerald-500"; // 16-20mm
    if (mm >= 11) return "bg-yellow-500"; // 11-15mm
    if (mm >= 1) return "bg-red-500";     // 1-10mm
    return "bg-red-700";
  };

  const removeFromPosition = async (p: Pneu) => {
    const { error } = await supabase.from("pneus" as any)
      .update({ status: "estoque", vehicle_plate: null, posicao: null })
      .eq("id", p.id);
    if (!error) {
      await supabase.from("tire_events" as any).insert({ pneu_id: p.id, event_type: "remocao", vehicle_plate: plate, position: p.posicao });
      fetchPneus();
      toast.success("Pneu removido para estoque");
    }
  };

  const sendToScrap = async (p: Pneu, assinaturaBase64?: string) => {
    const { error } = await supabase.from("pneus" as any)
      .update({ status: "sucata", vehicle_plate: null, posicao: null })
      .eq("id", p.id);
    if (!error) {
      await supabase.from("tire_events" as any).insert({ pneu_id: p.id, event_type: "descarte", vehicle_plate: plate, position: p.posicao });
      fetchPneus();
      toast.success("Pneu enviado para sucata");
    }
  };

  const sendToRecap = async () => {
    const p = recapDialog.pneu!;
    const shop = recapDialog.shop || "";
    const valor = recapDialog.valor ? parseFloat(recapDialog.valor) : 0;
    const { error } = await supabase.from("pneus" as any)
      .update({ status: "renovadora", vehicle_plate: null, posicao: null, valor_recape: valor })
      .eq("id", p.id);
    if (!error) {
      await supabase.from("tire_events" as any).insert({ pneu_id: p.id, event_type: "recapagem", vehicle_plate: plate, position: p.posicao });
      setRecapDialog({ open: false });
      fetchPneus();
      toast.success("Pneu enviado para recapagem");
    }
  };

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const promises = Array.from(files).map((f) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(f);
    }));
    const imgs = await Promise.all(promises);
    setDiscardDialog((d) => ({ ...d, photos: imgs }));
  };

  const sendToRepair = async (p: Pneu) => {
    const { error } = await supabase.from("pneus" as any)
      .update({ status: "conserto", vehicle_plate: null, posicao: null })
      .eq("id", p.id);
    if (!error) {
      await supabase.from("tire_events" as any).insert({ pneu_id: p.id, event_type: "conserto", vehicle_plate: plate, position: p.posicao });
      fetchPneus();
      toast.success("Pneu enviado para conserto");
    }
  };

  const submitMeasure = async () => {
    if (!plate || !measure.position) { toast.error("Selecione placa e posição"); return; }
    const { error } = await supabase.from("tire_events" as any).insert({
      event_type: "afericao_manual",
      vehicle_plate: plate,
      position: measure.position,
      km_vehicle: measure.km ? parseFloat(measure.km) : null,
      tread_depth_mm: measure.tread ? parseFloat(measure.tread) : null,
      pressure_psi: measure.psi ? parseFloat(measure.psi) : null,
      temperature_celsius: measure.temp ? parseFloat(measure.temp) : null,
      latitude: measure.lat ? parseFloat(measure.lat) : null,
      longitude: measure.lon ? parseFloat(measure.lon) : null,
    } as any);
    if (!error) { setMeasureOpen(false); setMeasure({}); toast.success("Medição registrada"); fetchPneus(); }
  };

  return (
    <Card className="p-4">
      <Tabs defaultValue="planner" className="space-y-4">
        <TabsList>
          <TabsTrigger value="planner">Mapa de Pneus</TabsTrigger>
          <TabsTrigger value="analytics">Indicadores</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-4">
          <div className="flex items-center gap-3">
            <VehicleSelect
              value={plate}
              onChange={setPlate}
              className="w-64"
              placeholder="Selecione a placa"
            />
            <Select value={preset} onValueChange={setPreset}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRESETS.map(p => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button variant="modern" onClick={savePreset}>Salvar Configuração</Button>
            {config && (
              <Button variant="outline" onClick={() => { setEditAxles((config.axles || []).map((ax:any)=>({ ...ax }))); setEditAxlesOpen(true); }}>
                Editar Eixos
              </Button>
            )}
            <Dialog open={measureOpen} onOpenChange={setMeasureOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Lançar Medição Manual</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Medição Manual</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={measure.position} onValueChange={(v) => setMeasure({ ...measure, position: v })}>
                    <SelectTrigger><SelectValue placeholder="Posição" /></SelectTrigger>
                    <SelectContent>
                      {(config?.axles || []).flatMap((ax: any, idx: number) => positionsForAxle(ax).map((pos) => <SelectItem key={`${idx + 1}_${pos}`} value={`${idx + 1}_${pos}`}>{`E${idx + 1} ${pos.replace(/_/g,' ')}`}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="KM Veículo" value={measure.km || ""} onChange={(e) => setMeasure({ ...measure, km: e.target.value })} />
                  <Input placeholder="Sulco (mm)" value={measure.tread || ""} onChange={(e) => setMeasure({ ...measure, tread: e.target.value })} />
                  <Input placeholder="Pressão (PSI)" value={measure.psi || ""} onChange={(e) => setMeasure({ ...measure, psi: e.target.value })} />
                  <Input placeholder="Temperatura (°C)" value={measure.temp || ""} onChange={(e) => setMeasure({ ...measure, temp: e.target.value })} />
                  <Input placeholder="Lat" value={measure.lat || ""} onChange={(e) => setMeasure({ ...measure, lat: e.target.value })} />
                  <Input placeholder="Lon" value={measure.lon || ""} onChange={(e) => setMeasure({ ...measure, lon: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2 mt-3"><Button variant="outline" onClick={()=>setMeasureOpen(false)}>Cancelar</Button><Button onClick={submitMeasure}>Salvar</Button></div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Estoque</h3>
              <div className="grid grid-cols-2 gap-2">
                {estoque.map((p) => (
                  <div key={p.id} draggable onDragStart={() => setDragging(p)} className="p-2 rounded-md border cursor-grab bg-background hover:bg-accent" title={`${p.codigo} • ${p.medida}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary" />
                      <div className="text-xs">
                        <div className="font-semibold">{p.codigo}</div>
                        <div className="text-muted-foreground">{p.medida}</div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      <Button size="sm" variant="outline" onClick={() => setRecapDialog({ open: true, pneu: p })}>Recapar</Button>
                      <Button size="sm" variant="outline" onClick={() => sendToRepair(p)}>Conserto</Button>
                      <Button size="sm" variant="destructive" onClick={() => setDiscardDialog({ open: true, pneu: p, motivo: "Descarte voluntário", fmea: { severity: 5, occurrence: 5, detection: 5 } })}>Sucata</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 space-y-6">
              <h3 className="text-sm font-semibold">Eixos</h3>
              {!config ? (
                <div className="text-sm text-muted-foreground">Salve a configuração para visualizar o mapa.</div>
              ) : (
                <div className="space-y-4">
                  {config.axles.map((ax: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Eixo {idx + 1}</Badge>
                        {ax.traction && <Badge variant="secondary">Tração</Badge>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {positionsForAxle(ax).map((pos) => {
                          const key = `${idx + 1}_${pos}`;
                          const p = mounted.find(m => m.posicao === key) || null;
                          return (
                            <div key={pos} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(idx + 1, pos)} className="relative h-24 rounded-md border bg-muted/20 flex items-center justify-center" title={pos.replace(/_/g,' ')}>
                              {!p ? (
                                <div className="text-xs text-muted-foreground">Soltar aqui</div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full ${toColor(p)}`} draggable onDragStart={() => setDragging(p)} />
                                  <div className="text-xs">
                                    <div className="font-semibold">{p.codigo}</div>
                                    <div className="text-muted-foreground">{p.medida}</div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="outline" onClick={() => removeFromPosition(p)}>Remover</Button>
                                    <Button size="sm" variant="outline" onClick={() => setRecapDialog({ open: true, pneu: p })}>Recapar</Button>
                                    <Button size="sm" variant="outline" onClick={() => sendToRepair(p)}>Conserto</Button>
                                    <Button size="sm" variant="destructive" onClick={() => setDiscardDialog({ open: true, pneu: p, motivo: "Sulco abaixo do limite", fmea: { severity: 5, occurrence: 5, detection: 5 } })}>Sucata</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4"><div className="text-sm text-muted-foreground">CPK Médio</div><div className="text-3xl font-bold">R$ {(mounted.reduce((s,p)=>s+((p.valor_compra||0)+(p.valor_recape||0)),0)/Math.max(1,mounted.reduce((s,p)=>s+Math.max(0,(p.km_atual||0)-(p.km_instalacao||0)),0))).toFixed(2)}</div></Card>
            <Card className="p-4"><div className="text-sm text-muted-foreground">Profundidade média (mm)</div><div className="text-3xl font-bold">{(() => { const vals = Object.values(latestDepth).filter(v=>v!=null) as number[]; return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '—'; })()}</div></Card>
            <Card className="p-4"><div className="text-sm text-muted-foreground">Alertas (sulco ≤ 10mm)</div><div className="text-3xl font-bold">{mounted.filter(p => (latestDepth[p.posicao||""] ?? 99) <= 10).length}</div></Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="text-sm text-muted-foreground">Em uso</div><div className="text-2xl font-bold">{mounted.length}</div></Card>
            <Card className="p-4"><div className="text-sm text-muted-foreground">Estoque</div><div className="text-2xl font-bold">{estoque.length}</div></Card>
            <Card className="p-4"><div className="text-sm text-muted-foreground">Sucata</div><div className="text-2xl font-bold">{pneus.filter(p=>p.status==='sucata').length}</div></Card>
            <Card className="p-4"><div className="text-sm text-muted-foreground">Renovadora</div><div className="text-2xl font-bold">{pneus.filter(p=>p.status==='renovadora').length}</div></Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4"><div className="text-sm text-muted-foreground">Em Conserto</div><div className="text-2xl font-bold">{pneus.filter(p=>p.status==='conserto').length}</div></Card>
            <Card className="p-4"><div className="text-sm text-muted-foreground">KM Total (montados)</div><div className="text-2xl font-bold">{mounted.reduce((s,p)=>s+Math.max(0,(p.km_atual||0)-(p.km_instalacao||0)),0)}</div></Card>
            <Card className="p-4"><div className="text-sm text-muted-foreground">Recapados</div><div className="text-2xl font-bold">{pneus.filter(p=>p.status==='recapado').length}</div></Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={editAxlesOpen} onOpenChange={setEditAxlesOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Eixos</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {(editAxles || []).map((ax, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded-md">
                <Badge variant="outline">Eixo {i+1}</Badge>
                <label className="text-xs">Dual</label>
                <input type="checkbox" checked={!!ax.dual} onChange={(e)=>{ const arr=[...editAxles]; arr[i]={...ax, dual:e.target.checked}; setEditAxles(arr); }} />
                <label className="text-xs">Tração</label>
                <input type="checkbox" checked={!!ax.traction} onChange={(e)=>{ const arr=[...editAxles]; arr[i]={...ax, traction:e.target.checked}; setEditAxles(arr); }} />
                <label className="text-xs">Suspenso</label>
                <input type="checkbox" checked={!!ax.suspended} onChange={(e)=>{ const arr=[...editAxles]; arr[i]={...ax, suspended:e.target.checked}; setEditAxles(arr); }} />
                <Button size="sm" variant="outline" onClick={()=>{ const arr=[...editAxles]; arr.splice(i,1); setEditAxles(arr); }}>Remover</Button>
              </div>
            ))}
            <Button variant="outline" onClick={()=>setEditAxles([...(editAxles||[]), { dual:false, traction:false, suspended:false }])}>Adicionar Eixo</Button>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setEditAxlesOpen(false)}>Cancelar</Button>
              <Button onClick={saveAxleEdit}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={recapDialog.open} onOpenChange={(o)=>setRecapDialog({ open:o })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enviar para Recapagem</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Renovadora" value={recapDialog.shop || ""} onChange={(e)=>setRecapDialog(d=>({ ...d, shop: e.target.value }))} />
            <Input placeholder="Valor (R$)" value={recapDialog.valor || ""} onChange={(e)=>setRecapDialog(d=>({ ...d, valor: e.target.value }))} />
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setRecapDialog({ open:false })}>Cancelar</Button><Button onClick={sendToRecap}>Confirmar</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={discardDialog.open} onOpenChange={(o)=>setDiscardDialog((d)=>({ ...d, open:o }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Laudo de Descarte</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Motivo</Label>
                <Input placeholder="Informe o motivo" value={discardDialog.motivo || ""} onChange={(e)=>setDiscardDialog((d)=>({ ...d, motivo: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Fotos</Label>
                <input type="file" accept="image/*" multiple onChange={(e)=>handlePhotoFiles((e.target as HTMLInputElement).files)} />
                <div className="text-xs text-muted-foreground">{(discardDialog.photos?.length || 0) > 0 ? `${discardDialog.photos?.length} foto(s) selecionada(s)` : "Nenhuma foto selecionada"}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Modo de Falha</Label>
              <Input placeholder="Ex.: desgaste irregular, bolha, corte" value={discardDialog.fmea?.failure_mode || ""} onChange={(e)=>setDiscardDialog((d)=>({ ...d, fmea: { ...(d.fmea||{}), failure_mode: e.target.value } }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Causas</Label>
                <Textarea placeholder="Descreva as causas prováveis" value={discardDialog.fmea?.causes || ""} onChange={(e)=>setDiscardDialog((d)=>({ ...d, fmea: { ...(d.fmea||{}), causes: e.target.value } }))} />
              </div>
              <div className="space-y-1">
                <Label>Efeitos</Label>
                <Textarea placeholder="Descreva os efeitos observados" value={discardDialog.fmea?.effects || ""} onChange={(e)=>setDiscardDialog((d)=>({ ...d, fmea: { ...(d.fmea||{}), effects: e.target.value } }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Severidade (1-10)</Label>
                <Input type="number" min={1} max={10} value={discardDialog.fmea?.severity ?? 5} onChange={(e)=>setDiscardDialog((d)=>({ ...d, fmea: { ...(d.fmea||{}), severity: Number(e.target.value || 0) } }))} />
              </div>
              <div className="space-y-1">
                <Label>Ocorrência (1-10)</Label>
                <Input type="number" min={1} max={10} value={discardDialog.fmea?.occurrence ?? 5} onChange={(e)=>setDiscardDialog((d)=>({ ...d, fmea: { ...(d.fmea||{}), occurrence: Number(e.target.value || 0) } }))} />
              </div>
              <div className="space-y-1">
                <Label>Detecção (1-10)</Label>
                <Input type="number" min={1} max={10} value={discardDialog.fmea?.detection ?? 5} onChange={(e)=>setDiscardDialog((d)=>({ ...d, fmea: { ...(d.fmea||{}), detection: Number(e.target.value || 0) } }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Ações recomendadas</Label>
              <Textarea placeholder="Ações para evitar recorrência" value={discardDialog.fmea?.actions || ""} onChange={(e)=>setDiscardDialog((d)=>({ ...d, fmea: { ...(d.fmea||{}), actions: e.target.value } }))} />
            </div>
            <SignaturePad onSave={async (dataUrl) => {
              const p = discardDialog.pneu!;
              const km = p.vehicle_plate ? Math.max(0, (p.km_atual || 0) - (p.km_instalacao || 0)) : 0;
              const tread = p.posicao ? (latestDepth[p.posicao || ""] ?? null) : null;
              const blob = await generateTireDiscardReport({ codigo: p.codigo, medida: p.medida, vehicle_plate: plate || "", km_rodado: km, tread_depth_mm: tread, motivo: discardDialog.motivo || "Descarte", assinatura_base64: dataUrl, photos_base64: discardDialog.photos || [], fmea: discardDialog.fmea });
              const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`laudo-descarte-${p.codigo}.pdf`; a.click(); URL.revokeObjectURL(url);
              await sendToScrap(p, dataUrl);
              setDiscardDialog({ open: false });
            }} />
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDiscardDialog({ open:false })}>Cancelar</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
