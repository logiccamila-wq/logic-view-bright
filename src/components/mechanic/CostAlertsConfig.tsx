import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, Plus, Trash2, Mail, TrendingUp, DollarSign, Truck, AlertTriangle } from 'lucide-react';

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
  last_triggered_at?: string;
  trigger_count: number;
}

export function CostAlertsConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    alert_name: '',
    alert_type: 'cost_threshold',
    cost_threshold: '',
    period_days: '30',
    trend_percentage: '20',
    trend_period_months: '3',
    vehicle_plate: '',
    email_recipients: '',
    email_enabled: true,
  });

  useEffect(() => {
    loadAlerts();
    loadVehicles();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_cost_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os alertas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('vehicle_plate');

      if (error) throw error;
      
      const uniquePlates = [...new Set(data?.map((o) => o.vehicle_plate) || [])];
      setVehicles(uniquePlates.sort());
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const emailList = formData.email_recipients
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      const alertData = {
        user_id: user.id,
        alert_name: formData.alert_name,
        alert_type: formData.alert_type,
        email_enabled: formData.email_enabled,
        email_recipients: emailList,
        cost_threshold: formData.alert_type === 'cost_threshold' ? parseFloat(formData.cost_threshold) : null,
        period_days: ['cost_threshold', 'vehicle_specific'].includes(formData.alert_type) ? parseInt(formData.period_days) : null,
        trend_percentage: formData.alert_type === 'trend_increase' ? parseFloat(formData.trend_percentage) : null,
        trend_period_months: formData.alert_type === 'trend_increase' ? parseInt(formData.trend_period_months) : null,
        vehicle_plate: formData.vehicle_plate || null,
      };

      const { error } = await supabase
        .from('maintenance_cost_alerts')
        .insert([alertData]);

      if (error) throw error;

      toast({
        title: '✅ Alerta Criado',
        description: 'O alerta foi configurado com sucesso',
      });

      setDialogOpen(false);
      resetForm();
      loadAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o alerta',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      alert_name: '',
      alert_type: 'cost_threshold',
      cost_threshold: '',
      period_days: '30',
      trend_percentage: '20',
      trend_period_months: '3',
      vehicle_plate: '',
      email_recipients: '',
      email_enabled: true,
    });
  };

  const toggleAlert = async (alertId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('maintenance_cost_alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: !currentStatus ? '✅ Alerta Ativado' : '⏸️ Alerta Desativado',
        description: `O alerta foi ${!currentStatus ? 'ativado' : 'desativado'}`,
      });

      loadAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do alerta',
        variant: 'destructive',
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Tem certeza que deseja excluir este alerta?')) return;

    try {
      const { error } = await supabase
        .from('maintenance_cost_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: '🗑️ Alerta Excluído',
        description: 'O alerta foi removido',
      });

      loadAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o alerta',
        variant: 'destructive',
      });
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'cost_threshold':
        return <DollarSign className="h-5 w-5" />;
      case 'trend_increase':
        return <TrendingUp className="h-5 w-5" />;
      case 'vehicle_specific':
        return <Truck className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'cost_threshold':
        return 'Limite de Custo';
      case 'trend_increase':
        return 'Tendência de Aumento';
      case 'vehicle_specific':
        return 'Veículo Específico';
      default:
        return type;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuração de Alertas</h2>
          <p className="text-sm text-muted-foreground">
            Configure alertas automáticos por e-mail para custos de manutenção
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Alerta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Alerta</DialogTitle>
              <DialogDescription>
                Configure um alerta automático para monitorar custos de manutenção
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="alert_name">Nome do Alerta</Label>
                <Input
                  id="alert_name"
                  value={formData.alert_name}
                  onChange={(e) => setFormData({ ...formData, alert_name: e.target.value })}
                  placeholder="Ex: Custos Acima de R$ 5.000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="alert_type">Tipo de Alerta</Label>
                <Select
                  value={formData.alert_type}
                  onValueChange={(value) => setFormData({ ...formData, alert_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost_threshold">Limite de Custo</SelectItem>
                    <SelectItem value="trend_increase">Tendência de Aumento</SelectItem>
                    <SelectItem value="vehicle_specific">Veículo Específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.alert_type === 'cost_threshold' && (
                <>
                  <div>
                    <Label htmlFor="cost_threshold">Limite de Custo (R$)</Label>
                    <Input
                      id="cost_threshold"
                      type="number"
                      step="0.01"
                      value={formData.cost_threshold}
                      onChange={(e) => setFormData({ ...formData, cost_threshold: e.target.value })}
                      placeholder="5000.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="period_days">Período (dias)</Label>
                    <Input
                      id="period_days"
                      type="number"
                      value={formData.period_days}
                      onChange={(e) => setFormData({ ...formData, period_days: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              {formData.alert_type === 'trend_increase' && (
                <>
                  <div>
                    <Label htmlFor="trend_percentage">Aumento Mínimo (%)</Label>
                    <Input
                      id="trend_percentage"
                      type="number"
                      step="0.1"
                      value={formData.trend_percentage}
                      onChange={(e) => setFormData({ ...formData, trend_percentage: e.target.value })}
                      placeholder="20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="trend_period_months">Período de Análise (meses)</Label>
                    <Input
                      id="trend_period_months"
                      type="number"
                      value={formData.trend_period_months}
                      onChange={(e) => setFormData({ ...formData, trend_period_months: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              {(formData.alert_type === 'vehicle_specific' || formData.alert_type === 'cost_threshold') && (
                <div>
                  <Label htmlFor="vehicle_plate">Veículo (Opcional)</Label>
                  <Select
                    value={formData.vehicle_plate}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_plate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os veículos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os veículos</SelectItem>
                      {vehicles.map((plate) => (
                        <SelectItem key={plate} value={plate}>
                          {plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="email_recipients">E-mails para Notificação</Label>
                <Input
                  id="email_recipients"
                  type="text"
                  value={formData.email_recipients}
                  onChange={(e) => setFormData({ ...formData, email_recipients: e.target.value })}
                  placeholder="email1@exemplo.com, email2@exemplo.com"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separe múltiplos e-mails com vírgula
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="email_enabled"
                  checked={formData.email_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, email_enabled: checked })}
                />
                <Label htmlFor="email_enabled">Ativar envio de e-mails</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Alerta</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum alerta configurado</p>
              <p className="text-sm">Crie seu primeiro alerta para começar a monitorar custos</p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className={!alert.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.alert_type)}
                    <div>
                      <CardTitle className="text-lg">{alert.alert_name}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mt-1">
                          {getAlertTypeLabel(alert.alert_type)}
                        </Badge>
                        {alert.vehicle_plate && (
                          <Badge variant="secondary" className="mt-1 ml-2">
                            {alert.vehicle_plate}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={() => toggleAlert(alert.id, alert.is_active)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {alert.cost_threshold && (
                    <div>
                      <span className="text-muted-foreground">Limite:</span>
                      <span className="ml-2 font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(alert.cost_threshold)}
                      </span>
                    </div>
                  )}
                  {alert.trend_percentage && (
                    <div>
                      <span className="text-muted-foreground">Aumento:</span>
                      <span className="ml-2 font-medium">+{alert.trend_percentage}%</span>
                    </div>
                  )}
                  {alert.period_days && (
                    <div>
                      <span className="text-muted-foreground">Período:</span>
                      <span className="ml-2 font-medium">{alert.period_days} dias</span>
                    </div>
                  )}
                  {alert.trend_period_months && (
                    <div>
                      <span className="text-muted-foreground">Análise:</span>
                      <span className="ml-2 font-medium">{alert.trend_period_months} meses</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm pt-2 border-t">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {alert.email_recipients.length} destinatário(s)
                  </span>
                  {alert.trigger_count > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {alert.trigger_count} disparo(s)
                    </Badge>
                  )}
                </div>
                {alert.last_triggered_at && (
                  <p className="text-xs text-muted-foreground">
                    Último disparo: {new Date(alert.last_triggered_at).toLocaleString('pt-BR')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
