import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Truck, User, Calendar, MapPin, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TripCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cte: any;
  onTripCreated: () => void;
}

interface Driver {
  id: string;
  full_name: string;
  email: string;
  available: boolean;
}

interface Vehicle {
  plate: string;
  brand: string;
  model: string;
  available: boolean;
}

export const TripCreationDialog = ({ open, onOpenChange, cte, onTripCreated }: TripCreationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [carretas, setCarretas] = useState<Vehicle[]>([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedCarreta, setSelectedCarreta] = useState("");
  const [estimatedDeparture, setEstimatedDeparture] = useState("");
  const [estimatedArrival, setEstimatedArrival] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      loadDriversAndVehicles();
      // Pre-selecionar veículo sugerido no CT-e
      if (cte?.placa_veiculo) {
        setSelectedVehicle(cte.placa_veiculo);
      }
      // Sugerir datas
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      setEstimatedDeparture(tomorrow.toISOString().slice(0, 16));
      
      const arrival = new Date(tomorrow);
      arrival.setDate(arrival.getDate() + 2);
      setEstimatedArrival(arrival.toISOString().slice(0, 16));
    }
  }, [open, cte]);

  const loadDriversAndVehicles = async () => {
    // Buscar motoristas
    const { data: driversData } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name');

    // Buscar motoristas com role 'driver'
    const { data: driverRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'driver');

    const driverIds = driverRoles?.map(r => r.user_id) || [];
    const availableDrivers = (driversData || [])
      .filter(d => driverIds.includes(d.id))
      .map(d => ({
        id: d.id,
        full_name: d.full_name,
        email: d.email,
        available: true // Pode verificar viagens ativas
      }));

    setDrivers(availableDrivers);

    // Buscar cavalos mecânicos
    const { data: cavalosData, error: cavalosError } = await supabase
      .from('vehicles')
      .select('placa, modelo')
      .eq('tipo', 'cavalo')
      .order('placa');

    if (cavalosError) {
      console.error('Erro ao buscar cavalos:', cavalosError);
    }

    console.log('Cavalos carregados:', cavalosData);

    setVehicles((cavalosData || []).map(v => ({
      plate: v.placa,
      brand: '',
      model: v.modelo || '',
      available: true
    })));

    // Buscar carretas
    const { data: carretasData, error: carretasError } = await supabase
      .from('vehicles')
      .select('placa, modelo')
      .eq('tipo', 'carreta')
      .order('placa');

    if (carretasError) {
      console.error('Erro ao buscar carretas:', carretasError);
    }

    console.log('Carretas carregadas:', carretasData);

    setCarretas((carretasData || []).map(v => ({
      plate: v.placa,
      brand: '',
      model: v.modelo || '',
      available: true
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDriver || !estimatedDeparture || !estimatedArrival) {
      toast.error('Preencha todos os campos obrigatórios (Motorista e Datas)');
      return;
    }

    if (vehicles.length > 0 && !selectedVehicle) {
      toast.error('Selecione um veículo da lista ou cadastre um novo na aba Cavalos');
      return;
    }

    setLoading(true);

    try {
      // Buscar nome do motorista
      const selectedDriverData = drivers.find(d => d.id === selectedDriver);
      
      // Criar viagem
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          origin: `${cte.remetente_cidade}/${cte.remetente_uf}`,
          destination: `${cte.destinatario_cidade}/${cte.destinatario_uf}`,
          driver_id: selectedDriver,
          driver_name: selectedDriverData?.full_name || 'Motorista',
          vehicle_plate: selectedVehicle || cte.placa_veiculo || 'SEM-PLACA',
          status: 'aprovada',
          estimated_departure: estimatedDeparture,
          estimated_arrival: estimatedArrival,
          notes: notes || null,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // Vincular CT-e à viagem
      const { error: cteError } = await supabase
        .from('cte')
        .update({ trip_id: trip.id })
        .eq('id', cte.id);

      if (cteError) throw cteError;

      // Criar sessão de trabalho para o motorista
      await supabase
        .from('driver_work_sessions')
        .insert({
          driver_id: selectedDriver,
          vehicle_plate: selectedVehicle,
          trip_id: trip.id,
          data_inicio: estimatedDeparture,
          status: 'planejada',
          tipo_motorista: 'carga'
        });

      // Criar notificação para o motorista
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedDriver,
          title: '🚚 Nova Viagem Atribuída!',
          message: `Viagem: ${cte.remetente_cidade}/${cte.remetente_uf} → ${cte.destinatario_cidade}/${cte.destinatario_uf}\n` +
                   `Veículo: ${selectedVehicle}${selectedCarreta && selectedCarreta !== 'none' ? ` + Carreta ${selectedCarreta}` : ''}\n` +
                   `Partida: ${new Date(estimatedDeparture).toLocaleString('pt-BR')}\n` +
                   `CT-e: ${cte.numero_cte} - ${cte.produto_predominante}`,
          type: 'info',
          module: 'tms',
          read: false
        });

      toast.success('Viagem criada com sucesso!', {
        description: 'O motorista recebeu uma notificação com os detalhes da viagem.'
      });

      onTripCreated();
    } catch (error: any) {
      console.error('Erro ao criar viagem:', error);
      toast.error('Erro ao criar viagem', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cte) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Criar Nova Viagem
          </DialogTitle>
          <DialogDescription>
            Configure os detalhes da viagem para o CT-e {cte.numero_cte}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do CT-e */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Rota do CT-e
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Origem</p>
                <p className="font-semibold">{cte.remetente_cidade}/{cte.remetente_uf}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Destino</p>
                <p className="font-semibold">{cte.destinatario_cidade}/{cte.destinatario_uf}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Produto</p>
                <p className="font-semibold">{cte.produto_predominante}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor</p>
                <p className="font-semibold text-green-600">
                  R$ {cte.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Seleção de Motorista */}
          <div className="space-y-2">
            <Label htmlFor="driver" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Motorista *
            </Label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver} required>
              <SelectTrigger id="driver">
                <SelectValue placeholder="Selecione um motorista" />
              </SelectTrigger>
              <SelectContent>
                {drivers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Nenhum motorista cadastrado
                  </div>
                ) : (
                  drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{driver.full_name}</span>
                        {driver.available && (
                          <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-600">
                            Disponível
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Veículo */}
          <div className="space-y-2">
            <Label htmlFor="vehicle" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Veículo *
            </Label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger id="vehicle">
                <SelectValue placeholder={vehicles.length === 0 ? "⚠️ Nenhum cavalo cadastrado" : "Selecione um veículo"} />
              </SelectTrigger>
              <SelectContent>
                {vehicles.length === 0 ? (
                  <div className="p-4 text-center text-sm">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="font-semibold mb-1">Nenhum cavalo mecânico cadastrado</p>
                    <p className="text-muted-foreground text-xs">
                      Vá em TMS → Cavalos para cadastrar
                    </p>
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.plate} value={vehicle.plate}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{vehicle.plate}</span>
                        {vehicle.model && (
                          <span className="text-muted-foreground text-xs">
                            {vehicle.model}
                          </span>
                        )}
                        {vehicle.available && (
                          <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-600 text-xs">
                            Disponível
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {vehicles.length === 0 && (
              <p className="text-xs text-orange-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Cadastre cavalos mecânicos na aba "Cavalos" do TMS
              </p>
            )}
          </div>

          {/* Seleção de Carreta */}
          <div className="space-y-2">
            <Label htmlFor="carreta" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Carreta (Opcional)
            </Label>
            <Select value={selectedCarreta} onValueChange={setSelectedCarreta}>
              <SelectTrigger id="carreta">
                <SelectValue placeholder="Selecione uma carreta (se aplicável)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {carretas.map((carreta) => (
                  <SelectItem key={carreta.plate} value={carreta.plate}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono">{carreta.plate}</span>
                      <span className="text-muted-foreground ml-2">
                        {carreta.model}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Partida Prevista *
              </Label>
              <Input
                id="departure"
                type="datetime-local"
                value={estimatedDeparture}
                onChange={(e) => setEstimatedDeparture(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrival" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Chegada Prevista *
              </Label>
              <Input
                id="arrival"
                type="datetime-local"
                value={estimatedArrival}
                onChange={(e) => setEstimatedArrival(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções especiais, pontos de atenção, etc."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {loading ? 'Criando...' : 'Criar Viagem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
