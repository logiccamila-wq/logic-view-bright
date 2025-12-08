import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Gauge, ThermometerSun, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { VehicleSelect } from '@/components/VehicleSelect';

interface TPMSReading {
  id: string;
  vehicle_plate: string;
  tire_position: string;
  pressure_psi: number;
  temperature_celsius?: number;
  tire_brand?: string;
  tire_model?: string;
  tread_depth_mm?: number;
  alert_level: string;
  notes?: string;
  created_at: string;
}

export function TPMSTab() {
  const { user } = useAuth();
  const [readings, setReadings] = useState<TPMSReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    vehicle_plate: '',
    tire_position: '',
    pressure_psi: '',
    temperature_celsius: '',
    tire_brand: '',
    tire_model: '',
    tread_depth_mm: '',
    notes: '',
  });

  const tirePositions = ['DE', 'DD', 'TED', 'TDD', 'TTD', 'TTE'];

  const fetchReadings = async () => {
    try {
      const { data, error } = await supabase
        .from('tpms_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReadings(data || []);
    } catch (error) {
      console.error('Erro ao buscar leituras:', error);
      toast.error('Erro ao carregar leituras TPMS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const calculateAlertLevel = (pressure: number, treadDepth?: number): string => {
    if (pressure < 80 || (treadDepth && treadDepth < 3)) return 'vermelho';
    if (pressure < 100 || (treadDepth && treadDepth < 5)) return 'amarelo';
    return 'verde';
  };

  const handleCreateReading = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pressure = parseFloat(formData.pressure_psi);
    const treadDepth = formData.tread_depth_mm ? parseFloat(formData.tread_depth_mm) : undefined;
    
    try {
      const { error } = await supabase.from('tpms_readings').insert({
        vehicle_plate: formData.vehicle_plate,
        tire_position: formData.tire_position,
        pressure_psi: pressure,
        temperature_celsius: formData.temperature_celsius ? parseFloat(formData.temperature_celsius) : null,
        tire_brand: formData.tire_brand || null,
        tire_model: formData.tire_model || null,
        tread_depth_mm: treadDepth || null,
        alert_level: calculateAlertLevel(pressure, treadDepth),
        notes: formData.notes || null,
        recorded_by: user?.id,
        last_calibration: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Leitura TPMS registrada com sucesso');
      setIsDialogOpen(false);
      setFormData({
        vehicle_plate: '',
        tire_position: '',
        pressure_psi: '',
        temperature_celsius: '',
        tire_brand: '',
        tire_model: '',
        tread_depth_mm: '',
        notes: '',
      });
      fetchReadings();
    } catch (error) {
      console.error('Erro ao criar leitura:', error);
      toast.error('Erro ao registrar leitura');
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'vermelho': return 'destructive';
      case 'amarelo': return 'secondary';
      default: return 'outline';
    }
  };

  const groupedReadings = readings.reduce((acc, reading) => {
    if (!acc[reading.vehicle_plate]) {
      acc[reading.vehicle_plate] = [];
    }
    acc[reading.vehicle_plate].push(reading);
    return acc;
  }, {} as Record<string, TPMSReading[]>);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento TPMS</h2>
          <p className="text-muted-foreground">Sistema de monitoramento de pressão e temperatura de pneus</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Leitura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Leitura TPMS</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateReading} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Placa do Veículo</Label>
                  <VehicleSelect
                    value={formData.vehicle_plate}
                    onChange={(value) => setFormData({ ...formData, vehicle_plate: value })}
                    placeholder="Selecione a placa"
                  />
                </div>
                <div>
                  <Label htmlFor="tire_position">Posição do Pneu</Label>
                  <select
                    id="tire_position"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.tire_position}
                    onChange={(e) => setFormData({ ...formData, tire_position: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {tirePositions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pressure_psi">Pressão (PSI)</Label>
                  <Input
                    id="pressure_psi"
                    type="number"
                    step="0.1"
                    value={formData.pressure_psi}
                    onChange={(e) => setFormData({ ...formData, pressure_psi: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="temperature_celsius">Temperatura (°C)</Label>
                  <Input
                    id="temperature_celsius"
                    type="number"
                    step="0.1"
                    value={formData.temperature_celsius}
                    onChange={(e) => setFormData({ ...formData, temperature_celsius: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tread_depth_mm">Sulco (mm)</Label>
                  <Input
                    id="tread_depth_mm"
                    type="number"
                    step="0.1"
                    value={formData.tread_depth_mm}
                    onChange={(e) => setFormData({ ...formData, tread_depth_mm: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tire_brand">Marca do Pneu</Label>
                  <Input
                    id="tire_brand"
                    value={formData.tire_brand}
                    onChange={(e) => setFormData({ ...formData, tire_brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tire_model">Modelo</Label>
                  <Input
                    id="tire_model"
                    value={formData.tire_model}
                    onChange={(e) => setFormData({ ...formData, tire_model: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedReadings).map(([plate, vehicleReadings]) => (
          <Card key={plate} className="p-6">
            <h3 className="font-bold text-xl mb-4">Veículo: {plate}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {vehicleReadings.slice(0, 6).map((reading) => (
                <div key={reading.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{reading.tire_position}</span>
                    <Badge variant={getAlertColor(reading.alert_level)}>
                      {reading.alert_level}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span>{reading.pressure_psi} PSI</span>
                    </div>
                    
                    {reading.temperature_celsius && (
                      <div className="flex items-center gap-2">
                        <ThermometerSun className="h-4 w-4 text-muted-foreground" />
                        <span>{reading.temperature_celsius}°C</span>
                      </div>
                    )}
                    
                    {reading.tread_depth_mm && (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span>{reading.tread_depth_mm}mm</span>
                      </div>
                    )}
                  </div>
                  
                  {reading.tire_brand && (
                    <p className="text-xs text-muted-foreground truncate">
                      {reading.tire_brand} {reading.tire_model}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}