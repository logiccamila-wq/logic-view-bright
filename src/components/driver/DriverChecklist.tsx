import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const checklistItems = [
  { id: "pneus", label: "Verificar pressão dos pneus" },
  { id: "oleo", label: "Verificar nível de óleo" },
  { id: "agua", label: "Verificar nível de água" },
  { id: "freios", label: "Testar freios" },
  { id: "luzes", label: "Verificar todas as luzes" },
  { id: "documentos", label: "Verificar documentação do veículo" },
  { id: "carga", label: "Conferir amarração da carga" },
  { id: "extintor", label: "Verificar extintor" },
];

export function DriverChecklist() {
  const { user } = useAuth();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [vehiclePlate, setVehiclePlate] = useState("");

  const handleSubmit = async () => {
    const allChecked = checklistItems.every(item => checked[item.id]);
    
    if (!allChecked) {
      toast.error("Complete todos os itens do checklist");
      return;
    }

    if (!vehiclePlate) {
      toast.error("Informe a placa do veículo");
      return;
    }

    setLoading(true);

    try {
      const items = checklistItems.map(item => ({
        id: item.id,
        label: item.label,
        checked: checked[item.id],
        timestamp: new Date().toISOString()
      }));

      const { error } = await supabase.from('maintenance_checklists').insert({
        vehicle_plate: vehiclePlate,
        checklist_type: 'pre_trip',
        mechanic_id: user?.id,
        status: 'concluido',
        items,
        completed_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Checklist concluído!");
      setChecked({});
      setVehiclePlate("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar checklist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          Checklist Pré-Viagem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Placa do veículo"
            className="w-full px-3 py-2 border rounded-md"
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value)}
          />
        </div>
        
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={checked[item.id] || false}
                onCheckedChange={(value) => 
                  setChecked({...checked, [item.id]: value as boolean})
                }
              />
              <label
                htmlFor={item.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={loading}
        >
          {loading ? "Salvando..." : "Concluir Checklist"}
        </Button>
      </CardContent>
    </Card>
  );
}
