import { VehicleSelect } from "@/components/VehicleSelect";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fuel } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function FuelExpenseDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    vehicle_plate: "",
    km: "",
    liters: "",
    total_value: ""
  });

  const litersNum = parseFloat(formData.liters || "0");
  const totalNum = parseFloat(formData.total_value || "0");
  const kmNum = parseInt(formData.km || "0");
  const pricePerLiter = litersNum > 0 ? (totalNum / litersNum) : 0;
  const canSubmit = !!formData.vehicle_plate && kmNum > 0 && litersNum > 0 && totalNum > 0;

  useEffect(() => {
    const loadRecent = async () => {
      const { data } = await supabase.from('refuelings' as any).select('*').order('created_at', { ascending: false }).limit(5);
      setRecent((data as any) || []);
    };
    if (open) loadRecent();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('refuelings' as any).insert({
        driver_id: user?.id,
        vehicle_plate: formData.vehicle_plate,
        km: kmNum,
        liters: litersNum,
        total_value: totalNum,
        cost_per_km: totalNum / Math.max(kmNum, 1),
        price_per_liter: pricePerLiter
      });

      if (error) throw error;

      toast.success("Abastecimento registrado!");
      setOpen(false);
      setFormData({ vehicle_plate: "", km: "", liters: "", total_value: "" });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar abastecimento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Fuel className="w-4 h-4 mr-2" />
          Registrar Abastecimento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançamento de Combustível</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Placa do Veículo</Label>
            <VehicleSelect 
              value={formData.vehicle_plate} 
              onChange={(v) => setFormData({ ...formData, vehicle_plate: v })} 
              placeholder="Selecione a placa"
            />
          </div>
          <div>
            <Label>KM Real</Label>
            <Input
              required
              type="number"
              value={formData.km}
              onChange={(e) => setFormData({...formData, km: e.target.value})}
            />
          </div>
          <div>
            <Label>Litros</Label>
            <Input
              required
              type="number"
              step="0.01"
              value={formData.liters}
              onChange={(e) => setFormData({...formData, liters: e.target.value})}
            />
          </div>
          <div>
            <Label>Valor Total (R$)</Label>
            <Input
              required
              type="number"
              step="0.01"
              value={formData.total_value}
              onChange={(e) => setFormData({...formData, total_value: e.target.value})}
            />
          </div>
          <div>
            <Label>Preço por Litro (R$/L)</Label>
            <Input disabled value={pricePerLiter > 0 ? pricePerLiter.toFixed(2) : ""} />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !canSubmit}>
            {loading ? "Salvando..." : "Registrar"}
          </Button>
          {recent.length > 0 && (
            <div className="space-y-2">
              <Label>Últimos abastecimentos</Label>
              {recent.map((r) => (
                <div key={r.id} className="text-sm text-muted-foreground">
                  {r.vehicle_plate} • {r.km} km • {r.liters} L • R$ {Number(r.total_value || 0).toFixed(2)}
                </div>
              ))}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
