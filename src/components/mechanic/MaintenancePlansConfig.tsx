import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ClipboardList, Wrench, AlertTriangle } from "lucide-react";

type VehicleType = "cavalo" | "carreta" | "truck";

interface MaintenancePlan {
  id: string;
  vehicle_type: VehicleType;
  plan_item: string;
  interval_km: number;
  tolerance_km: number;
  notes?: string | null;
  is_active: boolean;
}

export function MaintenancePlansConfig() {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansUnavailable, setPlansUnavailable] = useState(false);
  const [filterType, setFilterType] = useState<VehicleType | "all">("all");

  const [form, setForm] = useState({
    vehicle_type: "cavalo" as VehicleType,
    plan_item: "",
    interval_km: "",
    tolerance_km: "500",
    notes: ""
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("maintenance_plans")
        .select("*")
        .order("vehicle_type", { ascending: true })
        .order("plan_item", { ascending: true });
      if (error) {
        const isMissing = (error as any)?.code === "PGRST205" || String((error as any)?.message || "").includes("maintenance_plans");
        if (isMissing) {
          setPlansUnavailable(true);
          setPlans([]);
        } else {
          throw error;
        }
      } else {
        setPlansUnavailable(false);
        setPlans(data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar planos:", err);
      toast.error("Erro ao carregar planos de manutenção");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = useMemo(() => {
    if (filterType === "all") return plans;
    return plans.filter((p) => p.vehicle_type === filterType);
  }, [plans, filterType]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        vehicle_type: form.vehicle_type,
        plan_item: form.plan_item.trim(),
        interval_km: parseInt(form.interval_km || "0", 10),
        tolerance_km: parseInt(form.tolerance_km || "0", 10),
        notes: form.notes?.trim() || null,
        is_active: true
      };

      if (!payload.plan_item || !payload.interval_km) {
        toast.error("Informe item e intervalo (km)");
        return;
      }

      const { error } = await (supabase as any)
        .from("maintenance_plans")
        .insert([payload]);

      if (error) throw error;
      toast.success("Plano cadastrado");
      setForm({ vehicle_type: "cavalo", plan_item: "", interval_km: "", tolerance_km: "500", notes: "" });
      loadPlans();
    } catch (err) {
      console.error("Erro ao criar plano:", err);
      toast.error("Erro ao criar plano");
    }
  };

  const toggleActive = async (plan: MaintenancePlan) => {
    try {
      const { error } = await (supabase as any)
        .from("maintenance_plans")
        .update({ is_active: !plan.is_active })
        .eq("id", plan.id);

      if (error) throw error;
      loadPlans();
    } catch (err) {
      console.error("Erro ao atualizar plano:", err);
      toast.error("Erro ao atualizar plano");
    }
  };

  const updateInterval = async (plan: MaintenancePlan, interval_km: number, tolerance_km: number) => {
    try {
      const { error } = await (supabase as any)
        .from("maintenance_plans")
        .update({ interval_km, tolerance_km })
        .eq("id", plan.id);

      if (error) throw error;
      toast.success("Intervalo atualizado");
      loadPlans();
    } catch (err) {
      console.error("Erro ao atualizar intervalo:", err);
      toast.error("Erro ao atualizar intervalo");
    }
  };

  const seedDefaults = async () => {
    try {
      setLoading(true);
      // Reinsere seeds padrão da migração se necessário (idempotente via UPSERT não disponível aqui)
      const defaults = [
        { vehicle_type: "cavalo", plan_item: "Troca de óleo do motor", interval_km: 15000, tolerance_km: 1000, notes: "Óleo e filtro conforme fabricante" },
        { vehicle_type: "cavalo", plan_item: "Filtro de óleo", interval_km: 15000, tolerance_km: 1000, notes: "Substituir junto ao óleo" },
        { vehicle_type: "cavalo", plan_item: "Filtro de ar", interval_km: 20000, tolerance_km: 1000, notes: "Inspecionar a cada 10.000km" },
        { vehicle_type: "cavalo", plan_item: "Filtro de combustível", interval_km: 30000, tolerance_km: 1000, notes: "Troca preventiva" },
        { vehicle_type: "cavalo", plan_item: "Revisão de freios", interval_km: 20000, tolerance_km: 1000, notes: "Pastilhas, lonas e discos" },
        { vehicle_type: "cavalo", plan_item: "Suspensão e buchas", interval_km: 30000, tolerance_km: 1500, notes: "Inspeção geral e torque" },
        { vehicle_type: "cavalo", plan_item: "Alinhamento e balanceamento", interval_km: 20000, tolerance_km: 1000, notes: "Rotação de pneus" },
        { vehicle_type: "cavalo", plan_item: "Lubrificação do chassi", interval_km: 10000, tolerance_km: 500, notes: "Pontos de graxa" },
        { vehicle_type: "carreta", plan_item: "Revisão de freios (carreta)", interval_km: 20000, tolerance_km: 1000, notes: "Sistema pneumático e lonas" },
        { vehicle_type: "carreta", plan_item: "Suspensão e eixos", interval_km: 30000, tolerance_km: 1500, notes: "Inspeção e torque" },
        { vehicle_type: "carreta", plan_item: "Pinos e engates (quinto roda)", interval_km: 15000, tolerance_km: 1000, notes: "Lubrificação e inspeção" },
        { vehicle_type: "carreta", plan_item: "Iluminação e elétrica", interval_km: 15000, tolerance_km: 1000, notes: "Chicotes e conectores" },
        { vehicle_type: "carreta", plan_item: "Rodízio e balanceamento de pneus", interval_km: 20000, tolerance_km: 1000, notes: "Conforme desgaste" },
        { vehicle_type: "truck", plan_item: "Troca de óleo do motor", interval_km: 10000, tolerance_km: 800, notes: "" },
        { vehicle_type: "truck", plan_item: "Filtros (óleo/ar/combustível)", interval_km: 15000, tolerance_km: 1000, notes: "" },
        { vehicle_type: "truck", plan_item: "Revisão de freios", interval_km: 15000, tolerance_km: 1000, notes: "" },
        { vehicle_type: "truck", plan_item: "Suspensão", interval_km: 25000, tolerance_km: 1500, notes: "" },
        { vehicle_type: "truck", plan_item: "Alinhamento e balanceamento", interval_km: 15000, tolerance_km: 1000, notes: "" }
      ];

      const { error } = await (supabase as any)
        .from("maintenance_plans")
        .insert(defaults);

      if (error) throw error;
      toast.success("Planos padrão carregados");
      loadPlans();
    } catch (err) {
      console.error("Erro ao carregar padrões:", err);
      toast.error("Erro ao carregar padrões");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando planos...</div>;
  }

  return (
    <div className="space-y-6">
      {plansUnavailable && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Planos preventivos indisponíveis (migration pendente)</p>
              <p className="text-sm text-amber-700">A tabela `maintenance_plans` não foi encontrada. Aplique a migration para habilitar o CRUD e os alertas por tipo de veículo.</p>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Planos de Manutenção</h2>
          <p className="text-muted-foreground">Defina ciclos de km e preventivas por modelo (cavalo, carreta, truck)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPlans}>Atualizar</Button>
          <Button onClick={seedDefaults}><Wrench className="h-4 w-4 mr-2" /> Carregar Padrões</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Plano</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <div>
            <label className="text-sm">Modelo</label>
            <Select value={form.vehicle_type} onValueChange={(v) => setForm((f) => ({ ...f, vehicle_type: v as VehicleType }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cavalo">Cavalo</SelectItem>
                <SelectItem value="carreta">Carreta</SelectItem>
                <SelectItem value="truck">Truck</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Item Preventivo</label>
            <Input className="mt-1" placeholder="Ex: Troca de óleo" value={form.plan_item} onChange={(e) => setForm((f) => ({ ...f, plan_item: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Intervalo (km)</label>
            <Input className="mt-1" type="number" min={1000} step={500} value={form.interval_km} onChange={(e) => setForm((f) => ({ ...f, interval_km: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Tolerância (km)</label>
            <Input className="mt-1" type="number" min={0} step={100} value={form.tolerance_km} onChange={(e) => setForm((f) => ({ ...f, tolerance_km: e.target.value }))} />
          </div>
          <div className="md:col-span-5">
            <label className="text-sm">Observações</label>
            <Input className="mt-1" placeholder="Notas" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="md:col-span-5">
            <Button onClick={handleCreatePlan}>Adicionar Plano</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Badge variant="secondary">Filtros</Badge>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as VehicleType | "all")}> 
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filtrar por modelo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="cavalo">Cavalo</SelectItem>
            <SelectItem value="carreta">Carreta</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredPlans.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Badge>{p.vehicle_type}</Badge>
                  {p.plan_item}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Ativo</span>
                  <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Intervalo</p>
                  <Input type="number" defaultValue={p.interval_km} onBlur={(e) => updateInterval(p, parseInt(e.target.value || "0", 10), p.tolerance_km)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tolerância</p>
                  <Input type="number" defaultValue={p.tolerance_km} onBlur={(e) => updateInterval(p, p.interval_km, parseInt(e.target.value || "0", 10))} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <Input defaultValue={p.notes || ""} onBlur={async (e) => {
                    try {
                      const { error } = await (supabase as any)
                        .from("maintenance_plans")
                        .update({ notes: e.target.value })
                        .eq("id", p.id);
                      if (error) throw error;
                    } catch (err) {
                      console.error(err);
                      toast.error("Erro ao atualizar observações");
                    }
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredPlans.length === 0 && (
          <Card><CardContent className="py-6">Nenhum plano encontrado. Use "Carregar Padrões" ou adicione manualmente.</CardContent></Card>
        )}
      </div>
    </div>
  );
}