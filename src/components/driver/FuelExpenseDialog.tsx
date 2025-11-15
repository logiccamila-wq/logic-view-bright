import { useState } from "react";
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
  const [formData, setFormData] = useState({
    vehicle_plate: "",
    km: "",
    liters: "",
    total_value: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('refuelings').insert({
        driver_id: user?.id,
        vehicle_plate: formData.vehicle_plate,
        km: parseInt(formData.km),
        liters: parseFloat(formData.liters),
        total_value: parseFloat(formData.total_value),
        cost_per_km: parseFloat(formData.total_value) / parseInt(formData.km)
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
            <Input
              required
              value={formData.vehicle_plate}
              onChange={(e) => setFormData({...formData, vehicle_plate: e.target.value})}
              placeholder="ABC-1234"
            />
          </div>
          <div>
            <Label>KM Atual</Label>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Registrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
