import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Truck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VehicleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSessionId: string;
  currentVehicle: string;
  onVehicleChanged: () => void;
}

interface Vehicle {
  placa: string;
  modelo: string;
  tipo: string;
}

export const VehicleChangeDialog = ({ 
  open, 
  onOpenChange, 
  currentSessionId, 
  currentVehicle,
  onVehicleChanged 
}: VehicleChangeDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [carretas, setCarretas] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState(currentVehicle);
  const [selectedCarreta, setSelectedCarreta] = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (open) {
      loadVehicles();
    }
  }, [open]);

  const loadVehicles = async () => {
    // Buscar cavalos mecânicos
    const { data: cavaloData } = await supabase
      .from('vehicles')
      .select('placa, modelo, tipo')
      .eq('tipo', 'cavalo')
      .eq('status', 'ativo')
      .order('placa');

    setVehicles(cavaloData || []);

    // Buscar carretas
    const { data: carretaData } = await supabase
      .from('vehicles')
      .select('placa, modelo, tipo')
      .eq('tipo', 'carreta')
      .eq('status', 'ativo')
      .order('placa');

    setCarretas(carretaData || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle) {
      toast.error('Selecione o novo cavalo mecânico');
      return;
    }

    if (!motivo) {
      toast.error('Informe o motivo da troca');
      return;
    }

    setLoading(true);

    try {
      // Atualizar a sessão de trabalho com o novo veículo
      const { error: sessionError } = await supabase
        .from('driver_work_sessions')
        .update({
          vehicle_plate: selectedVehicle,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSessionId);

      if (sessionError) throw sessionError;

      // Registrar o evento de troca
      const { error: eventError } = await supabase
        .from('driver_work_events')
        .insert({
          session_id: currentSessionId,
          driver_id: (await supabase.auth.getUser()).data.user?.id,
          tipo_atividade: 'trabalho',
          data_hora_inicio: new Date().toISOString(),
          observacoes: `Troca de veículo: ${currentVehicle} → ${selectedVehicle}${selectedCarreta ? ` + Carreta ${selectedCarreta}` : ''}\nMotivo: ${motivo}`,
          automatico: false
        });

      if (eventError) throw eventError;

      toast.success('Veículo atualizado com sucesso!');
      onVehicleChanged();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao trocar veículo:', error);
      toast.error('Erro ao trocar veículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Trocar Veículo
          </DialogTitle>
          <DialogDescription>
            Registre a troca de cavalo mecânico e/ou carreta durante a viagem
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Veículo Atual</Label>
            <div className="p-3 bg-muted rounded-lg">
              <Badge variant="outline" className="font-mono">
                {currentVehicle}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Novo Cavalo Mecânico *</Label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger id="vehicle">
                <SelectValue placeholder="Selecione o cavalo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.placa} value={vehicle.placa}>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="font-mono font-semibold">{vehicle.placa}</span>
                      <span className="text-muted-foreground text-sm">
                        - {vehicle.modelo}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carreta">Carreta (Opcional)</Label>
            <Select value={selectedCarreta} onValueChange={setSelectedCarreta}>
              <SelectTrigger id="carreta">
                <SelectValue placeholder="Selecione a carreta (se aplicável)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Nenhuma</SelectItem>
                {carretas.map((carreta) => (
                  <SelectItem key={carreta.placa} value={carreta.placa}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{carreta.placa}</span>
                      <span className="text-muted-foreground text-sm">
                        - {carreta.modelo}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da Troca *</Label>
            <Textarea
              id="motivo"
              placeholder="Ex: Manutenção preventiva, troca de rota, problema mecânico..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              A troca será registrada no sistema e refletirá nos cálculos de gratificação
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Confirmar Troca"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
