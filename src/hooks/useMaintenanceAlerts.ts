import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/azure/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { predictNextMaintenance } from '@/utils/mlPredictive';

export function useMaintenanceAlerts() {
  const { user, hasRole } = useAuth();
  const { createNotification } = useNotifications();

  // Verifica se o usuário tem permissão para receber alertas
  const canReceiveAlerts = hasRole('admin') || 
                          hasRole('logistics_manager') || 
                          hasRole('maintenance_manager') ||
                          hasRole('fleet_maintenance');

  const checkMaintenanceSchedules = useCallback(async () => {
    if (!user || !canReceiveAlerts) return;

    try {
      const { data: serviceOrdersRaw, error: ordersError } = await supabase
        .from('service_orders')
        .select('*')
        .order('created_at', { ascending: false });

      const serviceOrders: any[] = (() => {
        const missingTable = ordersError && (
          (ordersError as any).code === 'PGRST205' ||
          String((ordersError as any).message || '').includes('service_orders')
        );
        if (missingTable) {
          return [];
        }
        if (ordersError) throw ordersError;
        return serviceOrdersRaw || [];
      })();

      // Buscar planos de manutenção ativos
      const { data: plansRaw, error: plansError } = await (supabase as any)
        .from('maintenance_plans')
        .select('*')
        .eq('is_active', true);

      // Se a tabela ainda não existir (migration não aplicada), prosseguir sem planos
      const plans: any[] = (() => {
        const missingTable = plansError && (
          (plansError as any).code === 'PGRST205' ||
          String((plansError as any).message || '').includes('maintenance_plans')
        );
        if (missingTable) {
          console.warn('[maintenance_plans] tabela ausente. Continuando sem planos de preventiva.');
          return [];
        }
        if (plansError) throw plansError;
        return plansRaw || [];
      })();

      // Agrupar por veículo
      const vehicleMap = new Map<string, any[]>();
      serviceOrders.forEach((order) => {
        const existing = vehicleMap.get(order.vehicle_plate) || [];
        vehicleMap.set(order.vehicle_plate, [...existing, order]);
      });

      // Helper para inferir tipo de veículo pelo model (fallback: truck)
      const classifyVehicleType = (model?: string): 'cavalo' | 'carreta' | 'truck' => {
        const m = (model || '').toLowerCase();
        if (m.includes('cavalo') || m.includes('tractor') || m.includes('fh') || m.includes('actros') || m.includes('xf')) return 'cavalo';
        if (m.includes('carreta') || m.includes('trailer') || m.includes('semi')) return 'carreta';
        return 'truck';
      };

      // Calcular previsões e criar notificações
      for (const [plate, orders] of vehicleMap.entries()) {
        const currentOdometer = Math.max(...orders.map(o => o.odometer));
        const vehicleModel = orders[0]?.vehicle_model || '';
        const vehicleType = classifyVehicleType(vehicleModel);
        
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

        const kmUntilMaintenance = prediction.predictedKm - currentOdometer;
        
        // Manutenção atrasada
        if (kmUntilMaintenance < 0) {
          await createNotification({
            title: '🚨 Manutenção Atrasada',
            message: `Veículo ${plate} está com manutenção atrasada em ${Math.abs(kmUntilMaintenance).toLocaleString('pt-BR')} km. Ação imediata necessária!`,
            type: 'error',
            module: 'fleet'
          });
        }
        // Manutenção urgente (menos de 1000km ou 7 dias)
        else if (kmUntilMaintenance < 1000 || prediction.predictedDays < 7) {
          await createNotification({
            title: '⚠️ Manutenção Urgente',
            message: `Veículo ${plate} precisa de manutenção ${prediction.maintenanceType} em breve. Faltam ${kmUntilMaintenance.toLocaleString('pt-BR')} km ou ${prediction.predictedDays} dias.`,
            type: 'warning',
            module: 'fleet'
          });
        }
        // Manutenção próxima (menos de 3000km ou 30 dias)
        else if (kmUntilMaintenance < 3000 || prediction.predictedDays < 30) {
          await createNotification({
            title: '📋 Manutenção Programada',
            message: `Veículo ${plate} terá manutenção ${prediction.maintenanceType} em ${kmUntilMaintenance.toLocaleString('pt-BR')} km (aprox. ${prediction.predictedDays} dias).`,
            type: 'info',
            module: 'fleet'
          });
        }

        // Alertas baseados em planos de manutenção por tipo
        const typePlans = (plans || []).filter((p: any) => p.vehicle_type === vehicleType);
        for (const p of typePlans) {
          const nextDueKm = Math.floor(currentOdometer / p.interval_km) * p.interval_km + p.interval_km;
          const delta = nextDueKm - currentOdometer;

          if (delta <= 0) {
            await createNotification({
              title: '🚨 Preventiva Atrasada',
              message: `Veículo ${plate}: ${p.plan_item} atrasado. Próximo ciclo era ${nextDueKm.toLocaleString('pt-BR')} km.`,
              type: 'error',
              module: 'fleet'
            });
          } else if (delta <= p.tolerance_km) {
            await createNotification({
              title: '⚠️ Preventiva Próxima',
              message: `Veículo ${plate}: ${p.plan_item} em ${delta.toLocaleString('pt-BR')} km (intervalo ${p.interval_km.toLocaleString('pt-BR')} km).`,
              type: 'warning',
              module: 'fleet'
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar agendamentos de manutenção:', error);
    }
  }, [user, canReceiveAlerts, createNotification]);

  useEffect(() => {
    if (!canReceiveAlerts) return;

    // Verificação inicial
    checkMaintenanceSchedules();

    // Verificar a cada 6 horas
    const interval = setInterval(checkMaintenanceSchedules, 6 * 60 * 60 * 1000);

    // Configurar listener para novas ordens de serviço
    const channel = supabase
      .channel('maintenance-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_orders'
        },
        () => {
          // Aguardar um pouco para garantir que os dados estejam disponíveis
          setTimeout(checkMaintenanceSchedules, 2000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_orders'
        },
        () => {
          setTimeout(checkMaintenanceSchedules, 2000);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [canReceiveAlerts, checkMaintenanceSchedules]);

  return { checkMaintenanceSchedules };
}
