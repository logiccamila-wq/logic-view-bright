import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CostAlert {
  id: string;
  alert_name: string;
  alert_type: string;
  is_active: boolean;
  cost_threshold?: number;
  period_days?: number;
  trend_percentage?: number;
  trend_period_months?: number;
  vehicle_plate?: string;
  email_enabled: boolean;
  email_recipients: string[];
  whatsapp_enabled: boolean;
  whatsapp_numbers: string[];
  n8n_enabled: boolean;
  n8n_webhook_url?: string;
  notification_channels: string[];
  last_triggered_at?: string;
}

export function useCostAlerts() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();

  const canManageAlerts = hasRole('admin') || 
                          hasRole('logistics_manager') || 
                          hasRole('maintenance_manager');

  const checkCostAlerts = useCallback(async () => {
    if (!user || !canManageAlerts) return;

    try {
      const { data: alertsRaw, error: alertsError } = await (supabase as any)
        .from('maintenance_cost_alerts')
        .select('*')
        .eq('is_active', true);

      const alerts: any[] = (() => {
        const missing = alertsError && ((alertsError as any).code === 'PGRST205' || String((alertsError as any).message || '').includes('maintenance_cost_alerts'));
        if (missing) return [];
        if (alertsError) throw alertsError;
        return alertsRaw || [];
      })();

      if (alerts.length === 0) return;

      const { data: ordersRaw, error: ordersError } = await supabase
        .from('service_orders')
        .select('*')
        .order('created_at', { ascending: false });

      const serviceOrders = (() => {
        const missing = ordersError && ((ordersError as any).code === 'PGRST205' || String((ordersError as any).message || '').includes('service_orders'));
        if (missing) return [];
        if (ordersError) throw ordersError;
        return ordersRaw || [];
      })();

      if (serviceOrders.length === 0) return;

      // Process each alert
      for (const alert of alerts as CostAlert[]) {
        if (alert.alert_type === 'cost_threshold') {
          await checkThresholdAlert(alert, serviceOrders);
        } else if (alert.alert_type === 'trend_increase') {
          await checkTrendAlert(alert, serviceOrders);
        } else if (alert.alert_type === 'vehicle_specific') {
          await checkVehicleAlert(alert, serviceOrders);
        }
      }
    } catch (error) {
      console.error('Error checking cost alerts:', error);
    }
  }, [user, canManageAlerts]);

  const checkThresholdAlert = async (alert: CostAlert, serviceOrders: any[]) => {
    const periodDays = alert.period_days || 30;
    const threshold = alert.cost_threshold || 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    let filteredOrders = serviceOrders.filter(
      (order) => new Date(order.created_at) >= cutoffDate
    );

    if (alert.vehicle_plate) {
      filteredOrders = filteredOrders.filter(
        (order) => order.vehicle_plate === alert.vehicle_plate
      );
    }

    const totalCost = filteredOrders.reduce((sum, order) => {
      const partsCost = Array.isArray(order.parts_used)
        ? order.parts_used.reduce((pSum: number, part: any) => pSum + (part.cost || 0), 0)
        : 0;
      const laborCost = (order.labor_hours || 0) * 80;
      return sum + partsCost + laborCost;
    }, 0);

    if (totalCost > threshold) {
      await triggerAlert(alert, totalCost, periodDays);
    }
  };

  const checkTrendAlert = async (alert: CostAlert, serviceOrders: any[]) => {
    const periodMonths = alert.trend_period_months || 3;
    const trendThreshold = alert.trend_percentage || 20;

    // Split data into two periods for comparison
    const currentPeriodStart = new Date();
    currentPeriodStart.setMonth(currentPeriodStart.getMonth() - periodMonths);
    
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - periodMonths);

    let currentOrders = serviceOrders.filter(
      (order) => new Date(order.created_at) >= currentPeriodStart
    );

    let previousOrders = serviceOrders.filter(
      (order) => 
        new Date(order.created_at) >= previousPeriodStart &&
        new Date(order.created_at) < currentPeriodStart
    );

    if (alert.vehicle_plate) {
      currentOrders = currentOrders.filter((o) => o.vehicle_plate === alert.vehicle_plate);
      previousOrders = previousOrders.filter((o) => o.vehicle_plate === alert.vehicle_plate);
    }

    const calculateTotalCost = (orders: any[]) => {
      return orders.reduce((sum, order) => {
        const partsCost = Array.isArray(order.parts_used)
          ? order.parts_used.reduce((pSum: number, part: any) => pSum + (part.cost || 0), 0)
          : 0;
        const laborCost = (order.labor_hours || 0) * 80;
        return sum + partsCost + laborCost;
      }, 0);
    };

    const currentCost = calculateTotalCost(currentOrders);
    const previousCost = calculateTotalCost(previousOrders);

    if (previousCost > 0) {
      const increasePercentage = ((currentCost - previousCost) / previousCost) * 100;
      
      if (increasePercentage > trendThreshold) {
        await triggerTrendAlert(alert, currentCost, increasePercentage, periodMonths);
      }
    }
  };

  const checkVehicleAlert = async (alert: CostAlert, serviceOrders: any[]) => {
    if (!alert.vehicle_plate) return;

    const periodDays = alert.period_days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    const vehicleOrders = serviceOrders.filter(
      (order) =>
        order.vehicle_plate === alert.vehicle_plate &&
        new Date(order.created_at) >= cutoffDate
    );

    const totalCost = vehicleOrders.reduce((sum, order) => {
      const partsCost = Array.isArray(order.parts_used)
        ? order.parts_used.reduce((pSum: number, part: any) => pSum + (part.cost || 0), 0)
        : 0;
      const laborCost = (order.labor_hours || 0) * 80;
      return sum + partsCost + laborCost;
    }, 0);

    // Calculate average cost per vehicle
    const allVehicles = [...new Set(serviceOrders.map((o) => o.vehicle_plate))];
    const avgCosts = allVehicles.map((plate) => {
      const orders = serviceOrders.filter(
        (o) => o.vehicle_plate === plate && new Date(o.created_at) >= cutoffDate
      );
      return orders.reduce((sum, order) => {
        const partsCost = Array.isArray(order.parts_used)
          ? order.parts_used.reduce((pSum: number, part: any) => pSum + (part.cost || 0), 0)
          : 0;
        const laborCost = (order.labor_hours || 0) * 80;
        return sum + partsCost + laborCost;
      }, 0);
    });

    const avgFleetCost = avgCosts.reduce((a, b) => a + b, 0) / avgCosts.length;

    // Alert if vehicle costs are 50% above fleet average
    if (totalCost > avgFleetCost * 1.5) {
      await triggerVehicleAlert(alert, totalCost, periodDays);
    }
  };

  const triggerAlert = async (alert: CostAlert, currentValue: number, periodDays: number) => {
    // Check if alert was triggered recently (within 24 hours)
    if (alert.last_triggered_at) {
      const lastTrigger = new Date(alert.last_triggered_at);
      const hoursSinceLastTrigger = (Date.now() - lastTrigger.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastTrigger < 24) return; // Don't spam alerts
    }

    const promises = [];

    // Send email alert
    if (alert.email_enabled && alert.email_recipients.length > 0) {
      promises.push(
        supabase.functions.invoke('send-cost-alert', {
          body: {
            alertType: alert.alert_type,
            vehiclePlate: alert.vehicle_plate,
            currentValue,
            threshold: alert.cost_threshold,
            period: `Últimos ${periodDays} dias`,
            recipients: alert.email_recipients,
          },
        }).catch((error) => console.error('Email alert error:', error))
      );
    }

    // Send WhatsApp alert
    if (alert.whatsapp_enabled && alert.whatsapp_numbers.length > 0) {
      promises.push(
        supabase.functions.invoke('send-whatsapp-alert', {
          body: {
            alertType: alert.alert_type,
            vehiclePlate: alert.vehicle_plate,
            currentValue,
            threshold: alert.cost_threshold,
            period: `Últimos ${periodDays} dias`,
            phoneNumbers: alert.whatsapp_numbers,
          },
        }).catch((error) => console.error('WhatsApp alert error:', error))
      );
    }

    // Trigger n8n workflow
    if (alert.n8n_enabled && alert.n8n_webhook_url) {
      promises.push(
        supabase.functions.invoke('trigger-n8n-workflow', {
          body: {
            webhookUrl: alert.n8n_webhook_url,
            alertData: {
              alertType: alert.alert_type,
              alertName: alert.alert_name,
              vehiclePlate: alert.vehicle_plate,
              currentValue,
              threshold: alert.cost_threshold,
              period: `Últimos ${periodDays} dias`,
              timestamp: new Date().toISOString(),
            },
          },
        }).catch((error) => console.error('n8n workflow error:', error))
      );
    }

    // Execute all alerts in parallel
    try {
      await Promise.all(promises);

      // Update last triggered time
      await (supabase as any)
        .from('maintenance_cost_alerts')
        .update({
          last_triggered_at: new Date().toISOString(),
          trigger_count: (alert as any).trigger_count + 1,
        })
        .eq('id', alert.id);

      const channels = [];
      if (alert.email_enabled) channels.push('E-mail');
      if (alert.whatsapp_enabled) channels.push('WhatsApp');
      if (alert.n8n_enabled) channels.push('n8n');

      toast({
        title: '📧 Alertas Enviados',
        description: `Alerta "${alert.alert_name}" enviado via ${channels.join(', ')}`,
      });
    } catch (error) {
      console.error('Error sending alerts:', error);
    }
  };

  const triggerTrendAlert = async (
    alert: CostAlert,
    currentValue: number,
    trendPercentage: number,
    periodMonths: number
  ) => {
    if (alert.last_triggered_at) {
      const lastTrigger = new Date(alert.last_triggered_at);
      const hoursSinceLastTrigger = (Date.now() - lastTrigger.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastTrigger < 24) return;
    }

    const promises = [];

    if (alert.email_enabled && alert.email_recipients.length > 0) {
      promises.push(
        supabase.functions.invoke('send-cost-alert', {
          body: {
            alertType: 'trend_increase',
            vehiclePlate: alert.vehicle_plate,
            currentValue,
            trendPercentage,
            period: `Últimos ${periodMonths} meses`,
            recipients: alert.email_recipients,
          },
        }).catch((error) => console.error('Email alert error:', error))
      );
    }

    if (alert.whatsapp_enabled && alert.whatsapp_numbers.length > 0) {
      promises.push(
        supabase.functions.invoke('send-whatsapp-alert', {
          body: {
            alertType: 'trend_increase',
            vehiclePlate: alert.vehicle_plate,
            currentValue,
            trendPercentage,
            period: `Últimos ${periodMonths} meses`,
            phoneNumbers: alert.whatsapp_numbers,
          },
        }).catch((error) => console.error('WhatsApp alert error:', error))
      );
    }

    if (alert.n8n_enabled && alert.n8n_webhook_url) {
      promises.push(
        supabase.functions.invoke('trigger-n8n-workflow', {
          body: {
            webhookUrl: alert.n8n_webhook_url,
            alertData: {
              alertType: 'trend_increase',
              alertName: alert.alert_name,
              vehiclePlate: alert.vehicle_plate,
              currentValue,
              trendPercentage,
              period: `Últimos ${periodMonths} meses`,
              timestamp: new Date().toISOString(),
            },
          },
        }).catch((error) => console.error('n8n workflow error:', error))
      );
    }

    try {
      await Promise.all(promises);

      await (supabase as any)
        .from('maintenance_cost_alerts')
        .update({
          last_triggered_at: new Date().toISOString(),
          trigger_count: (alert as any).trigger_count + 1,
        })
        .eq('id', alert.id);

      toast({
        title: '📈 Alerta de Tendência',
        description: `Tendência crítica detectada: +${trendPercentage.toFixed(1)}%`,
      });
    } catch (error) {
      console.error('Error sending trend alert:', error);
    }
  };

  const triggerVehicleAlert = async (alert: CostAlert, currentValue: number, periodDays: number) => {
    if (alert.last_triggered_at) {
      const lastTrigger = new Date(alert.last_triggered_at);
      const hoursSinceLastTrigger = (Date.now() - lastTrigger.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastTrigger < 24) return;
    }

    const promises = [];

    if (alert.email_enabled && alert.email_recipients.length > 0) {
      promises.push(
        supabase.functions.invoke('send-cost-alert', {
          body: {
            alertType: 'vehicle_specific',
            vehiclePlate: alert.vehicle_plate,
            currentValue,
            period: `Últimos ${periodDays} dias`,
            recipients: alert.email_recipients,
          },
        }).catch((error) => console.error('Email alert error:', error))
      );
    }

    if (alert.whatsapp_enabled && alert.whatsapp_numbers.length > 0) {
      promises.push(
        supabase.functions.invoke('send-whatsapp-alert', {
          body: {
            alertType: 'vehicle_specific',
            vehiclePlate: alert.vehicle_plate,
            currentValue,
            period: `Últimos ${periodDays} dias`,
            phoneNumbers: alert.whatsapp_numbers,
          },
        }).catch((error) => console.error('WhatsApp alert error:', error))
      );
    }

    if (alert.n8n_enabled && alert.n8n_webhook_url) {
      promises.push(
        supabase.functions.invoke('trigger-n8n-workflow', {
          body: {
            webhookUrl: alert.n8n_webhook_url,
            alertData: {
              alertType: 'vehicle_specific',
              alertName: alert.alert_name,
              vehiclePlate: alert.vehicle_plate,
              currentValue,
              period: `Últimos ${periodDays} dias`,
              timestamp: new Date().toISOString(),
            },
          },
        }).catch((error) => console.error('n8n workflow error:', error))
      );
    }

    try {
      await Promise.all(promises);

      await (supabase as any)
        .from('maintenance_cost_alerts')
        .update({
          last_triggered_at: new Date().toISOString(),
          trigger_count: (alert as any).trigger_count + 1,
        })
        .eq('id', alert.id);

      toast({
        title: '🚗 Alerta de Veículo',
        description: `Veículo ${alert.vehicle_plate} com custos elevados`,
      });
    } catch (error) {
      console.error('Error sending vehicle alert:', error);
    }
  };

  useEffect(() => {
    if (!canManageAlerts) return;

    // Initial check
    checkCostAlerts();

    // Check every 6 hours
    const interval = setInterval(checkCostAlerts, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [canManageAlerts, checkCostAlerts]);

  return { checkCostAlerts };
}
