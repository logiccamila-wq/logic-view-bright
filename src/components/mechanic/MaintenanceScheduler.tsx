import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { predictNextMaintenance } from '@/utils/mlPredictive';
import { Calendar, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface VehicleSchedule {
  plate: string;
  currentOdometer: number;
  predictedKm: number;
  predictedDays: number;
  confidence: number;
  maintenanceType: string;
  status: 'overdue' | 'soon' | 'scheduled' | 'ok';
}

export const MaintenanceScheduler = () => {
  const [schedules, setSchedules] = useState<VehicleSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadMaintenanceSchedules();
  }, []);

  const loadMaintenanceSchedules = async () => {
    try {
      setLoading(true);

      // Buscar todas as ordens de serviço
      const { data: serviceOrders, error: ordersError } = await supabase
        .from('service_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Agrupar por veículo
      const vehicleMap = new Map<string, any[]>();
      serviceOrders?.forEach((order) => {
        const existing = vehicleMap.get(order.vehicle_plate) || [];
        vehicleMap.set(order.vehicle_plate, [...existing, order]);
      });

      // Calcular previsão para cada veículo
      const predictions: VehicleSchedule[] = [];
      
      for (const [plate, orders] of vehicleMap.entries()) {
        const currentOdometer = Math.max(...orders.map(o => o.odometer));
        
        const prediction = predictNextMaintenance(
          orders.map(o => ({
            id: o.id,
            status: o.status,
            created_at: o.created_at || new Date().toISOString(),
            completed_at: o.completed_at,
            vehicle_plate: o.vehicle_plate,
            odometer: o.odometer,
            labor_hours: o.labor_hours || 0,
            vehiclePlate: o.vehicle_plate,
            completedAt: o.completed_at,
            serviceType: o.status === 'concluida' ? 'preventiva' : 'corretiva'
          })),
          currentOdometer
        );

        let status: 'overdue' | 'soon' | 'scheduled' | 'ok' = 'ok';
        const kmUntilMaintenance = prediction.predictedKm - currentOdometer;
        
        if (kmUntilMaintenance < 0) status = 'overdue';
        else if (kmUntilMaintenance < 1000 || prediction.predictedDays < 7) status = 'soon';
        else if (kmUntilMaintenance < 3000 || prediction.predictedDays < 30) status = 'scheduled';

        predictions.push({
          plate,
          currentOdometer,
          predictedKm: prediction.predictedKm,
          predictedDays: prediction.predictedDays,
          confidence: prediction.confidence,
          maintenanceType: prediction.maintenanceType,
          status
        });
      }

      // Ordenar por urgência
      predictions.sort((a, b) => {
        const statusOrder = { overdue: 0, soon: 1, scheduled: 2, ok: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

      setSchedules(predictions);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos de manutenção');
    } finally {
      setLoading(false);
    }
  };

  const createPreventiveMaintenance = async (schedule: VehicleSchedule) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .insert({
          vehicle_plate: schedule.plate,
          vehicle_model: 'N/A',
          odometer: schedule.currentOdometer,
          issue_description: `Manutenção preventiva agendada: ${schedule.maintenanceType}`,
          priority: schedule.status === 'overdue' ? 'alta' : schedule.status === 'soon' ? 'media' : 'baixa',
          status: 'pendente',
          estimated_completion: new Date(Date.now() + schedule.predictedDays * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast.success('Ordem de serviço preventiva criada com sucesso!');
      loadMaintenanceSchedules();
    } catch (error) {
      console.error('Erro ao criar OS:', error);
      toast.error('Erro ao criar ordem de serviço');
    }
  };

  const createPartsRequest = async (schedule: VehicleSchedule) => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('parts_requests')
        .insert({
          mechanic_id: user.id,
          mechanic_name: (user as any)?.user_metadata?.full_name || user.email || 'Mecânico',
          vehicle_plate: schedule.plate,
          parts_list: [],
          urgency: schedule.status === 'overdue' ? 'alta' : schedule.status === 'soon' ? 'media' : 'normal',
          notes: `Pedido para preventiva: ${schedule.maintenanceType}. Definir itens com checklist/planos.`
        });

      if (error) throw error;
      toast.success('Pedido de peças criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar pedido de peças:', error);
      toast.error('Erro ao criar pedido de peças');
    }
  };

  const createQuotation = async (schedule: VehicleSchedule) => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('parts_requests')
        .insert({
          mechanic_id: user.id,
          mechanic_name: (user as any)?.user_metadata?.full_name || user.email || 'Mecânico',
          vehicle_plate: schedule.plate,
          parts_list: [],
          urgency: 'normal',
          status: 'cotacao',
          notes: `Cotação para preventiva: ${schedule.maintenanceType}. Solicitar preços e prazos.`
        });

      if (error) throw error;
      toast.success('Solicitação de cotação criada!');
    } catch (error) {
      console.error('Erro ao criar cotação:', error);
      toast.error('Erro ao criar cotação');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      overdue: { variant: 'destructive' as const, icon: AlertTriangle, label: 'Atrasada' },
      soon: { variant: 'default' as const, icon: Clock, label: 'Urgente' },
      scheduled: { variant: 'secondary' as const, icon: Calendar, label: 'Próxima' },
      ok: { variant: 'outline' as const, icon: CheckCircle, label: 'Em dia' }
    };
    
    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredSchedules = schedules.filter(s =>
    s.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Carregando agendamentos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agendamento Inteligente</h2>
          <p className="text-muted-foreground">
            Previsões automáticas baseadas em KM e histórico de manutenções
          </p>
        </div>
        <Button onClick={loadMaintenanceSchedules}>
          Atualizar Previsões
        </Button>
      </div>

      <Input
        placeholder="Buscar por placa..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid gap-4">
        {filteredSchedules.map((schedule) => {
          const kmUntilMaintenance = schedule.predictedKm - schedule.currentOdometer;
          
          return (
            <Card key={schedule.plate}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    {schedule.plate}
                  </CardTitle>
                  {getStatusBadge(schedule.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">KM Atual</p>
                    <p className="text-lg font-semibold">
                      {schedule.currentOdometer.toLocaleString('pt-BR')} km
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Próxima Manutenção</p>
                    <p className="text-lg font-semibold">
                      {schedule.predictedKm.toLocaleString('pt-BR')} km
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {kmUntilMaintenance > 0 ? `Faltam ${kmUntilMaintenance.toLocaleString('pt-BR')} km` : `Atrasada em ${Math.abs(kmUntilMaintenance).toLocaleString('pt-BR')} km`}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Previsão em Dias</p>
                    <p className="text-lg font-semibold">
                      {schedule.predictedDays} dias
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Confiança: {(schedule.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="text-lg font-semibold capitalize">
                      {schedule.maintenanceType}
                    </p>
                  </div>
                </div>

                {(schedule.status === 'overdue' || schedule.status === 'soon') && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Button onClick={() => createPreventiveMaintenance(schedule)}>
                        Criar OS Preventiva
                      </Button>
                      <Button variant="outline" onClick={() => createPartsRequest(schedule)}>
                        Gerar Pedido de Peças
                      </Button>
                      <Button variant="secondary" onClick={() => createQuotation(schedule)}>
                        Abrir Cotação
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredSchedules.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum veículo encontrado. Certifique-se de que existem ordens de serviço cadastradas.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
