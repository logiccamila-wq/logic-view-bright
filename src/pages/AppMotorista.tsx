import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Smartphone, Navigation, Camera, CheckCircle, MapPin,
  AlertCircle, Clock, Fuel, Play, Square, Coffee, Truck
} from "lucide-react";

const CHECKLIST_ITEMS = [
  { id: "pneus", label: "Pneus em bom estado", critical: true },
  { id: "oleo", label: "Nível de óleo OK", critical: true },
  { id: "agua", label: "Nível de água OK", critical: true },
  { id: "freios", label: "Freios funcionando", critical: true },
  { id: "luzes", label: "Luzes funcionando", critical: true },
  { id: "espelhos", label: "Retrovisores OK", critical: false },
  { id: "docs", label: "Documentação em dia", critical: true },
  { id: "extintor", label: "Extintor de incêndio", critical: true },
  { id: "triangulo", label: "Triângulo", critical: false },
  { id: "estepe", label: "Estepe em bom estado", critical: true },
  { id: "amarracao", label: "Carga bem amarrada", critical: true },
  { id: "lona", label: "Lona em bom estado", critical: false },
];

export default function AppMotoristaPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [obsChecklist, setObsChecklist] = useState("");
  const [macroType, setMacroType] = useState<string>("INICIO");
  const [odometer, setOdometer] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Buscar viagens ativas do motorista
  const { data: trips = [] } = useQuery({
    queryKey: ["driver_trips_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .in("status", ["em_andamento", "programada", "in_progress", "scheduled"])
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  // Buscar veículos
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, placa, modelo, marca")
        .order("placa", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Buscar macros recentes
  const { data: macros = [] } = useQuery({
    queryKey: ["trip_macros_recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_macros")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  // Buscar abastecimentos recentes
  const { data: refuelings = [] } = useQuery({
    queryKey: ["refuelings_recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refuelings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // Registrar macro de viagem
  const registerMacro = useMutation({
    mutationFn: async (payload: { trip_id?: string; macro_type: string; odometer_km?: number; latitude?: number; longitude?: number }) => {
      const { data, error } = await supabase
        .from("trip_macros")
        .insert({
          trip_id: payload.trip_id || null,
          macro_type: payload.macro_type,
          odometer_km: payload.odometer_km || null,
          latitude: payload.latitude,
          longitude: payload.longitude,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["trip_macros_recent"] });
      toast({ title: `Macro ${vars.macro_type} registrada`, description: "Evento salvo com sucesso" });
    },
    onError: (e: Error) => toast({ title: "Erro ao registrar macro", description: e.message, variant: "destructive" }),
  });

  // Registrar abastecimento
  const registerRefueling = useMutation({
    mutationFn: async (payload: { vehicle_plate: string; liters: number; total_value: number; fuel_type: string; odometer_km: number; station: string }) => {
      const { data, error } = await supabase
        .from("refuelings")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refuelings_recent"] });
      toast({ title: "Abastecimento registrado" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Capturar localização
  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast({ title: "Localização capturada", description: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` });
        },
        () => toast({ title: "Erro ao capturar GPS", variant: "destructive" })
      );
    }
  };

  // Registrar macro
  const handleMacro = () => {
    registerMacro.mutate({
      trip_id: trips[0]?.id,
      macro_type: macroType,
      odometer_km: odometer ? Number(odometer) : undefined,
      latitude: location?.lat,
      longitude: location?.lng,
    });
  };

  // Refueling form state
  const [fuelForm, setFuelForm] = useState({ vehicle_plate: "", liters: 0, total_value: 0, fuel_type: "diesel_s10", odometer_km: 0, station: "" });

  const handleRefueling = () => {
    if (!fuelForm.vehicle_plate || !fuelForm.liters) return;
    registerRefueling.mutate(fuelForm);
    setFuelForm({ vehicle_plate: "", liters: 0, total_value: 0, fuel_type: "diesel_s10", odometer_km: 0, station: "" });
  };

  const activeTrip = trips[0];
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const criticalDone = CHECKLIST_ITEMS.filter(i => i.critical).every(i => checkedItems[i.id]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Smartphone className="h-10 w-10 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">App Motorista</h1>
          <p className="text-muted-foreground">Check-in + Macros + Checklist + Abastecimento</p>
        </div>
      </div>

      {/* Viagem Ativa */}
      {activeTrip && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" /> Viagem Ativa
              </CardTitle>
              <Badge className="bg-blue-600">{activeTrip.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Origem:</span> <strong>{activeTrip.origin}</strong></div>
              <div><span className="text-muted-foreground">Destino:</span> <strong>{activeTrip.destination}</strong></div>
              <div><span className="text-muted-foreground">Veículo:</span> <strong>{activeTrip.vehicle_plate}</strong></div>
              <div><span className="text-muted-foreground">ETA:</span> <strong>{activeTrip.eta ? new Date(activeTrip.eta).toLocaleString("pt-BR") : "-"}</strong></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="macros" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="macros">Macros</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="abastecimento">Abastecimento</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* Macros */}
        <TabsContent value="macros">
          <Card>
            <CardHeader><CardTitle>Registrar Macro de Viagem</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Macro</Label>
                  <Select value={macroType} onValueChange={setMacroType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INICIO">
                        <span className="flex items-center gap-2"><Play className="h-4 w-4 text-green-500" /> INÍCIO</span>
                      </SelectItem>
                      <SelectItem value="PAUSA">
                        <span className="flex items-center gap-2"><Coffee className="h-4 w-4 text-yellow-500" /> PAUSA</span>
                      </SelectItem>
                      <SelectItem value="RETORNO">
                        <span className="flex items-center gap-2"><Play className="h-4 w-4 text-blue-500" /> RETORNO</span>
                      </SelectItem>
                      <SelectItem value="FIM">
                        <span className="flex items-center gap-2"><Square className="h-4 w-4 text-red-500" /> FIM</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hodômetro (km)</Label>
                  <Input type="number" value={odometer} onChange={e => setOdometer(e.target.value)} placeholder="Ex: 125430" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={captureLocation} className="flex-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Capturar GPS"}
                </Button>
                <Button onClick={handleMacro} disabled={registerMacro.isPending} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" /> Registrar {macroType}
                </Button>
              </div>

              {/* Macros recentes */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Últimas Macros</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {macros.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma macro registrada</p>
                  ) : macros.slice(0, 10).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                      <Badge variant={m.macro_type === "INICIO" ? "default" : m.macro_type === "FIM" ? "destructive" : "secondary"}>
                        {m.macro_type}
                      </Badge>
                      <span className="text-muted-foreground">
                        {m.odometer_km ? `${m.odometer_km} km` : ""} 
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.timestamp || m.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklist */}
        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Checklist de Inspeção</CardTitle>
                <Badge variant={criticalDone ? "default" : "destructive"} className={criticalDone ? "bg-green-600" : ""}>
                  {checkedCount}/{CHECKLIST_ITEMS.length} verificados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {CHECKLIST_ITEMS.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                  <Checkbox
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={(checked) => setCheckedItems(prev => ({ ...prev, [item.id]: !!checked }))}
                  />
                  <span className={`flex-1 ${checkedItems[item.id] ? "line-through text-muted-foreground" : ""}`}>
                    {item.label}
                  </span>
                  {item.critical && (
                    <Badge variant="outline" className="text-xs border-red-300 text-red-400">
                      <AlertCircle className="h-3 w-3 mr-1" /> Obrigatório
                    </Badge>
                  )}
                </div>
              ))}

              <div className="mt-4">
                <Label>Observações</Label>
                <Textarea value={obsChecklist} onChange={e => setObsChecklist(e.target.value)} placeholder="Observações da inspeção..." rows={3} />
              </div>

              <Button className="w-full mt-2" disabled={!criticalDone}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {criticalDone ? "Confirmar Checklist" : "Complete os itens obrigatórios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Abastecimento */}
        <TabsContent value="abastecimento">
          <Card>
            <CardHeader><CardTitle>Registrar Abastecimento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Veículo</Label>
                <Select value={fuelForm.vehicle_plate} onValueChange={v => setFuelForm(f => ({ ...f, vehicle_plate: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o veículo..." /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.placa}>{v.placa} - {v.modelo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Litros</Label>
                  <Input type="number" step="0.01" value={fuelForm.liters || ""} onChange={e => setFuelForm(f => ({ ...f, liters: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Valor Total (R$)</Label>
                  <Input type="number" step="0.01" value={fuelForm.total_value || ""} onChange={e => setFuelForm(f => ({ ...f, total_value: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Combustível</Label>
                  <Select value={fuelForm.fuel_type} onValueChange={v => setFuelForm(f => ({ ...f, fuel_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel_s10">Diesel S10</SelectItem>
                      <SelectItem value="diesel_s500">Diesel S500</SelectItem>
                      <SelectItem value="arla32">Arla 32</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hodômetro (km)</Label>
                  <Input type="number" value={fuelForm.odometer_km || ""} onChange={e => setFuelForm(f => ({ ...f, odometer_km: Number(e.target.value) }))} />
                </div>
              </div>

              <div>
                <Label>Posto</Label>
                <Input value={fuelForm.station} onChange={e => setFuelForm(f => ({ ...f, station: e.target.value }))} placeholder="Nome do posto" />
              </div>

              {fuelForm.liters > 0 && fuelForm.total_value > 0 && (
                <div className="p-3 bg-muted rounded text-sm">
                  <strong>Preço/litro:</strong> R$ {(fuelForm.total_value / fuelForm.liters).toFixed(3)}
                </div>
              )}

              <Button className="w-full" onClick={handleRefueling} disabled={!fuelForm.vehicle_plate || !fuelForm.liters || registerRefueling.isPending}>
                <Fuel className="h-4 w-4 mr-2" /> Registrar Abastecimento
              </Button>
            </CardContent>
          </Card>

          {/* Últimos abastecimentos */}
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-lg">Últimos Abastecimentos</CardTitle></CardHeader>
            <CardContent>
              {refuelings.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">Nenhum abastecimento registrado</p>
              ) : (
                <div className="space-y-2">
                  {refuelings.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">{r.vehicle_plate}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")} · {r.station || "-"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {(r.total_value || 0).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{r.liters}L · R$ {r.liters ? ((r.total_value || 0) / r.liters).toFixed(3) : "0"}/L</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="historico">
          <Card>
            <CardHeader><CardTitle>Viagens Recentes</CardTitle></CardHeader>
            <CardContent>
              {trips.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma viagem encontrada</p>
              ) : (
                <div className="space-y-3">
                  {trips.map(t => (
                    <div key={t.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{t.vehicle_plate}</span>
                        <Badge>{t.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div><MapPin className="h-3 w-3 inline mr-1" />{t.origin}</div>
                        <div><Navigation className="h-3 w-3 inline mr-1" />{t.destination}</div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(t.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
