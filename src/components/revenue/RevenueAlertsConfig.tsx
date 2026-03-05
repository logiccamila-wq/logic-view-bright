import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Plus, Trash2, Bell, BellOff } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface RevenueAlert {
  id: string;
  alert_name: string;
  alert_type: string;
  threshold_value?: number;
  threshold_percentage?: number;
  comparison_period: string;
  is_active: boolean;
  email_recipients: string[];
  whatsapp_enabled: boolean;
  whatsapp_numbers: string[];
  n8n_enabled: boolean;
  n8n_webhook_url?: string;
}

export function RevenueAlertsConfig() {
  const [alerts, setAlerts] = useState<RevenueAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    alert_name: '',
    alert_type: 'revenue_drop',
    threshold_value: '',
    threshold_percentage: '',
    comparison_period: 'mes_anterior',
    email_recipients: '',
    whatsapp_enabled: false,
    whatsapp_numbers: '',
    n8n_enabled: false,
    n8n_webhook_url: ''
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('revenue_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar alertas:', error);
      toast({
        title: "Erro ao carregar alertas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const alertData: any = {
        user_id: user.id,
        alert_name: formData.alert_name,
        alert_type: formData.alert_type,
        comparison_period: formData.comparison_period,
        is_active: true,
        email_recipients: formData.email_recipients.split(',').map(e => e.trim()).filter(Boolean),
        whatsapp_enabled: formData.whatsapp_enabled,
        whatsapp_numbers: formData.whatsapp_enabled ? 
          formData.whatsapp_numbers.split(',').map(n => n.trim()).filter(Boolean) : [],
        n8n_enabled: formData.n8n_enabled,
        n8n_webhook_url: formData.n8n_enabled ? formData.n8n_webhook_url : null
      };

      if (formData.threshold_value) {
        alertData.threshold_value = parseFloat(formData.threshold_value);
      }
      if (formData.threshold_percentage) {
        alertData.threshold_percentage = parseFloat(formData.threshold_percentage);
      }

      const { error } = await (supabase as any)
        .from('revenue_alerts')
        .insert([alertData]);

      if (error) throw error;

      toast({
        title: "Alerta criado",
        description: "O alerta foi configurado com sucesso"
      });

      setShowForm(false);
      setFormData({
        alert_name: '',
        alert_type: 'revenue_drop',
        threshold_value: '',
        threshold_percentage: '',
        comparison_period: 'mes_anterior',
        email_recipients: '',
        whatsapp_enabled: false,
        whatsapp_numbers: '',
        n8n_enabled: false,
        n8n_webhook_url: ''
      });
      loadAlerts();
    } catch (error: any) {
      console.error('Erro ao criar alerta:', error);
      toast({
        title: "Erro ao criar alerta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleAlert = async (alertId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('revenue_alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Alerta desativado" : "Alerta ativado",
        description: "Status do alerta atualizado com sucesso"
      });
      loadAlerts();
    } catch (error: any) {
      console.error('Erro ao atualizar alerta:', error);
      toast({
        title: "Erro ao atualizar alerta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Tem certeza que deseja excluir este alerta?')) return;

    try {
      const { error } = await (supabase as any)
        .from('revenue_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alerta excluído",
        description: "O alerta foi removido com sucesso"
      });
      loadAlerts();
    } catch (error: any) {
      console.error('Erro ao excluir alerta:', error);
      toast({
        title: "Erro ao excluir alerta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando alertas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Alertas de Receita</h3>
          <p className="text-sm text-muted-foreground">Configure notificações automáticas para variações de receita</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Alerta
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Novo Alerta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alert_name">Nome do Alerta</Label>
                  <Input
                    id="alert_name"
                    value={formData.alert_name}
                    onChange={(e) => setFormData({ ...formData, alert_name: e.target.value })}
                    placeholder="Ex: Queda de Receita Mensal"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alert_type">Tipo de Alerta</Label>
                  <Select value={formData.alert_type} onValueChange={(value) => setFormData({ ...formData, alert_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue_drop">Queda de Receita</SelectItem>
                      <SelectItem value="revenue_target">Meta de Receita</SelectItem>
                      <SelectItem value="margin_alert">Alerta de Margem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold_value">Valor Limite (R$)</Label>
                  <Input
                    id="threshold_value"
                    type="number"
                    step="0.01"
                    value={formData.threshold_value}
                    onChange={(e) => setFormData({ ...formData, threshold_value: e.target.value })}
                    placeholder="Ex: 50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold_percentage">Variação (%)</Label>
                  <Input
                    id="threshold_percentage"
                    type="number"
                    step="0.1"
                    value={formData.threshold_percentage}
                    onChange={(e) => setFormData({ ...formData, threshold_percentage: e.target.value })}
                    placeholder="Ex: 10"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="comparison_period">Período de Comparação</Label>
                  <Select value={formData.comparison_period} onValueChange={(value) => setFormData({ ...formData, comparison_period: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
                      <SelectItem value="mesmo_mes_ano_anterior">Mesmo Mês Ano Anterior</SelectItem>
                      <SelectItem value="media_trimestral">Média Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email_recipients">E-mails (separados por vírgula)</Label>
                  <Input
                    id="email_recipients"
                    value={formData.email_recipients}
                    onChange={(e) => setFormData({ ...formData, email_recipients: e.target.value })}
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="whatsapp_enabled"
                      checked={formData.whatsapp_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, whatsapp_enabled: checked })}
                    />
                    <Label htmlFor="whatsapp_enabled">Ativar alertas via WhatsApp</Label>
                  </div>
                  {formData.whatsapp_enabled && (
                    <Input
                      value={formData.whatsapp_numbers}
                      onChange={(e) => setFormData({ ...formData, whatsapp_numbers: e.target.value })}
                      placeholder="+5511999999999, +5511888888888"
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="n8n_enabled"
                      checked={formData.n8n_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, n8n_enabled: checked })}
                    />
                    <Label htmlFor="n8n_enabled">Ativar integração n8n</Label>
                  </div>
                  {formData.n8n_enabled && (
                    <Input
                      value={formData.n8n_webhook_url}
                      onChange={(e) => setFormData({ ...formData, n8n_webhook_url: e.target.value })}
                      placeholder="https://sua-instancia-n8n.com/webhook/..."
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Criar Alerta</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${alert.is_active ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                    {alert.is_active ? (
                      <Bell className="h-5 w-5 text-green-600" />
                    ) : (
                      <BellOff className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{alert.alert_name}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Tipo: {alert.alert_type}</p>
                      {alert.threshold_value && <p>Limite: R$ {alert.threshold_value.toLocaleString('pt-BR')}</p>}
                      {alert.threshold_percentage && <p>Variação: {alert.threshold_percentage}%</p>}
                      <p>Período: {alert.comparison_period}</p>
                      {alert.whatsapp_enabled && <p>WhatsApp: Ativado ({alert.whatsapp_numbers.length} números)</p>}
                      {alert.n8n_enabled && <p>n8n: Ativado</p>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleAlert(alert.id, alert.is_active)}
                  >
                    {alert.is_active ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteAlert(alert.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {alerts.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhum alerta configurado</p>
                <p className="text-sm">Clique em "Novo Alerta" para começar</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}