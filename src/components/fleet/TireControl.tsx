import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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

  const positionsForAxle = (ax: any) => {
    if (ax.dual) return ["esq_externo", "esq_interno", "dir_externo", "dir_interno"];
    return ["esq", "dir"];
  };

  const onDrop = async (axIndex: number, pos: string) => {
    if (!dragging || !plate) return;
    const positionKey = `${axIndex}_${pos}`;
    const { error } = await supabase.from("pneus" as any).update({ status: "em_uso", vehicle_plate: plate, posicao: positionKey }).eq("id", dragging.id);
    if (!error) {
      await supabase.from("tire_events" as any).insert({ pneu_id: dragging.id, event_type: "instalacao", vehicle_plate: plate, position: positionKey });
      setDragging(null);
      fetchPneus();
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
                            <div key={pos} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(idx + 1, pos)} className="relative h-20 rounded-md border bg-muted/20 flex items-center justify-center" title={pos.replace(/_/g,' ')}>
                              {!p ? (
                                <div className="text-xs text-muted-foreground">Soltar aqui</div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full ${toColor(p)}`} />
                                  <div className="text-xs">
                                    <div className="font-semibold">{p.codigo}</div>
                                    <div className="text-muted-foreground">{p.medida}</div>
                                  </div>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline">Laudo</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader><DialogTitle>Assinatura do Laudo</DialogTitle></DialogHeader>
                                      <SignaturePad onSave={async (dataUrl) => {
                                        const blob = await generateTireDiscardReport({ codigo: p.codigo, medida: p.medida, vehicle_plate: plate, km_rodado: Math.max(0,(p.km_atual||0)-(p.km_instalacao||0)), tread_depth_mm: latestDepth[p.posicao||""] ?? null, motivo: "Sulco abaixo do limite", assinatura_base64: dataUrl });
                                        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`laudo-descarte-${p.codigo}.pdf`; a.click(); URL.revokeObjectURL(url);
                                      }} />
                                    </DialogContent>
                                  </Dialog>
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
            <Card className="p-4"><div className="text-sm text-muted-foreground">Custo/km médio</div><div className="text-3xl font-bold">R$ {(mounted.reduce((s,p)=>s+((p.valor_compra||0)+(p.valor_recape||0)),0)/Math.max(1,mounted.reduce((s,p)=>s+Math.max(0,(p.km_atual||0)-(p.km_instalacao||0)),0))).toFixed(2)}</div></Card>
            <Card className="p-4"><div className="text-sm text-muted-foreground">Pneus em 1ª vida</div><div className="text-3xl font-bold">{mounted.filter(p=>p.life_stage==='novo').length}</div></Card>
            <Card className="p-4"><div className="text-sm text-muted-foreground">Recapados</div><div className="text-3xl font-bold">{mounted.filter(p=>p.life_stage?.startsWith('recap')).length}</div></Card>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
