import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Bell, 
  BellOff,
  Target,
  TrendingDown,
  RefreshCw,
  History
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface RevenueTarget {
  id: string;
  mes: number;
  ano: number;
  target_value: number;
  description?: string;
}

interface PredictiveAlert {
  id: string;
  alert_name: string;
  alert_type: string;
  threshold_percentage?: number;
  check_target_miss: boolean;
  target_threshold_percentage?: number;
  is_active: boolean;
  email_recipients: string[];
  whatsapp_enabled: boolean;
  whatsapp_numbers: string[];
  n8n_enabled: boolean;
  n8n_webhook_url?: string;
  last_triggered_at?: string;
  trigger_count: number;
}

interface AlertHistory {
  id: string;
  mes_previsto: number;
  ano_previsto: number;
  predicted_value: number;
  target_value?: number;
  variance_percentage: number;
  alert_reason: string;
  created_at: string;
}

export function PredictiveAlertsConfig() {
  const [targets, setTargets] = useState<RevenueTarget[]>([]);
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [targetForm, setTargetForm] = useState({
    mes: '',
    ano: new Date().getFullYear().toString(),
    target_value: '',
    description: ''
  });

  const [alertForm, setAlertForm] = useState({
    alert_name: '',
    alert_type: 'revenue_drop',
    threshold_percentage: '',
    check_target_miss: false,
    target_threshold_percentage: '',
    email_recipients: '',
    whatsapp_enabled: false,
    whatsapp_numbers: '',
    n8n_enabled: false,
    n8n_webhook_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar metas
      const { data: targetsData, error: targetsError } = await (supabase as any)
        .from('revenue_targets')
        .select('*')
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (targetsError) throw targetsError;
      setTargets(targetsData || []);

      // Buscar alertas
      const { data: alertsData, error: alertsError } = await (supabase as any)
        .from('predictive_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

      // Buscar histórico (últimos 20)
      const { data: historyData, error: historyError } = await (supabase as any)
        .from('predictive_alert_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;
      setHistory(historyData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('revenue_targets')
        .insert([{
          mes: parseInt(targetForm.mes),
          ano: parseInt(targetForm.ano),
          target_value: parseFloat(targetForm.target_value),
          description: targetForm.description || null,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Meta criada",
        description: "Meta de receita configurada com sucesso"
      });

      setShowTargetForm(false);
      setTargetForm({
        mes: '',
        ano: new Date().getFullYear().toString(),
        target_value: '',
        description: ''
      });
      loadData();
    } catch (error: any) {
      console.error('Erro ao criar meta:', error);
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const alertData: any = {
        user_id: user.id,
        alert_name: alertForm.alert_name,
        alert_type: alertForm.alert_type,
        check_target_miss: alertForm.check_target_miss,
        is_active: true,
        email_recipients: alertForm.email_recipients.split(',').map(e => e.trim()).filter(Boolean),
        whatsapp_enabled: alertForm.whatsapp_enabled,
        whatsapp_numbers: alertForm.whatsapp_enabled ? 
          alertForm.whatsapp_numbers.split(',').map(n => n.trim()).filter(Boolean) : [],
        n8n_enabled: alertForm.n8n_enabled,
        n8n_webhook_url: alertForm.n8n_enabled ? alertForm.n8n_webhook_url : null
      };

      if (alertForm.threshold_percentage) {
        alertData.threshold_percentage = parseFloat(alertForm.threshold_percentage);
      }
      if (alertForm.check_target_miss && alertForm.target_threshold_percentage) {
        alertData.target_threshold_percentage = parseFloat(alertForm.target_threshold_percentage);
      }

      const { error } = await (supabase as any)
        .from('predictive_alerts')
        .insert([alertData]);

      if (error) throw error;

      toast({
        title: "Alerta criado",
        description: "Alerta preditivo configurado com sucesso"
      });

      setShowAlertForm(false);
      setAlertForm({
        alert_name: '',
        alert_type: 'revenue_drop',
        threshold_percentage: '',
        check_target_miss: false,
        target_threshold_percentage: '',
        email_recipients: '',
        whatsapp_enabled: false,
        whatsapp_numbers: '',
        n8n_enabled: false,
        n8n_webhook_url: ''
      });
      loadData();
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
        .from('predictive_alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Alerta desativado" : "Alerta ativado",
        description: "Status atualizado com sucesso"
      });
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar alerta:', error);
      toast({
        title: "Erro ao atualizar alerta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTarget = async (targetId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      const { error } = await (supabase as any)
        .from('revenue_targets')
        .delete()
        .eq('id', targetId);

      if (error) throw error;

      toast({
        title: "Meta excluída",
        description: "Meta removida com sucesso"
      });
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir meta:', error);
      toast({
        title: "Erro ao excluir meta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Tem certeza que deseja excluir este alerta?')) return;

    try {
      const { error } = await (supabase as any)
        .from('predictive_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alerta excluído",
        description: "Alerta removido com sucesso"
      });
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir alerta:', error);
      toast({
        title: "Erro ao excluir alerta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const checkAlertsNow = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('check-predictive-alerts');

      if (error) throw error;

      toast({
        title: "Verificação concluída",
        description: `${data.alerts_triggered} alerta(s) disparado(s)`
      });

      loadData();
    } catch (error: any) {
      console.error('Erro ao verificar alertas:', error);
      toast({
        title: "Erro ao verificar alertas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="targets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="targets">Metas</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Metas Tab */}
        <TabsContent value="targets" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Metas de Receita</h3>
              <p className="text-sm text-muted-foreground">Configure metas mensais para acompanhar performance</p>
            </div>
            <Button onClick={() => setShowTargetForm(!showTargetForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
          </div>

          {showTargetForm && (
            <Card>
              <CardHeader>
                <CardTitle>Configurar Nova Meta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTarget} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target_mes">Mês</Label>
                      <Select value={targetForm.mes} onValueChange={(value) => setTargetForm({ ...targetForm, mes: value })} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {new Date(2025, i).toLocaleDateString('pt-BR', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_ano">Ano</Label>
                      <Input
                        id="target_ano"
                        type="number"
                        value={targetForm.ano}
                        onChange={(e) => setTargetForm({ ...targetForm, ano: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_value">Valor da Meta (R$)</Label>
                      <Input
                        id="target_value"
                        type="number"
                        step="0.01"
                        value={targetForm.target_value}
                        onChange={(e) => setTargetForm({ ...targetForm, target_value: e.target.value })}
                        placeholder="Ex: 100000"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_description">Descrição (opcional)</Label>
                    <Input
                      id="target_description"
                      value={targetForm.description}
                      onChange={(e) => setTargetForm({ ...targetForm, description: e.target.value })}
                      placeholder="Ex: Meta de expansão Q4"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">Criar Meta</Button>
                    <Button type="button" variant="outline" onClick={() => setShowTargetForm(false)}>Cancelar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {targets.map((target) => (
              <Card key={target.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {new Date(target.ano, target.mes - 1).toLocaleDateString('pt-BR', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </h4>
                        <p className="text-2xl font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(target.target_value)}
                        </p>
                        {target.description && (
                          <p className="text-sm text-muted-foreground mt-1">{target.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteTarget(target.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {targets.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="mx-auto h-12 w-12 mb-4" />
                    <p>Nenhuma meta configurada</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Alertas Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Alertas Preditivos</h3>
              <p className="text-sm text-muted-foreground">Configure alertas baseados em previsões de ML</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={checkAlertsNow} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Verificar Agora
              </Button>
              <Button onClick={() => setShowAlertForm(!showAlertForm)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Alerta
              </Button>
            </div>
          </div>

          {showAlertForm && (
            <Card>
              <CardHeader>
                <CardTitle>Configurar Novo Alerta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAlert} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="alert_name">Nome do Alerta</Label>
                      <Input
                        id="alert_name"
                        value={alertForm.alert_name}
                        onChange={(e) => setAlertForm({ ...alertForm, alert_name: e.target.value })}
                        placeholder="Ex: Alerta de Queda de Receita"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="threshold_percentage">Queda de Receita (%)</Label>
                      <Input
                        id="threshold_percentage"
                        type="number"
                        step="0.1"
                        value={alertForm.threshold_percentage}
                        onChange={(e) => setAlertForm({ ...alertForm, threshold_percentage: e.target.value })}
                        placeholder="Ex: 10"
                      />
                      <p className="text-xs text-muted-foreground">Alertar quando previsão indicar queda superior a X%</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <Switch
                          id="check_target_miss"
                          checked={alertForm.check_target_miss}
                          onCheckedChange={(checked) => setAlertForm({ ...alertForm, check_target_miss: checked })}
                        />
                        <Label htmlFor="check_target_miss">Alertar Meta Não Atingida</Label>
                      </div>
                      {alertForm.check_target_miss && (
                        <Input
                          type="number"
                          step="0.1"
                          value={alertForm.target_threshold_percentage}
                          onChange={(e) => setAlertForm({ ...alertForm, target_threshold_percentage: e.target.value })}
                          placeholder="Margem (%)"
                        />
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="alert_email_recipients">E-mails (separados por vírgula)</Label>
                      <Input
                        id="alert_email_recipients"
                        value={alertForm.email_recipients}
                        onChange={(e) => setAlertForm({ ...alertForm, email_recipients: e.target.value })}
                        placeholder="email1@example.com, email2@example.com"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="alert_whatsapp_enabled"
                          checked={alertForm.whatsapp_enabled}
                          onCheckedChange={(checked) => setAlertForm({ ...alertForm, whatsapp_enabled: checked })}
                        />
                        <Label htmlFor="alert_whatsapp_enabled">Ativar WhatsApp</Label>
                      </div>
                      {alertForm.whatsapp_enabled && (
                        <Input
                          value={alertForm.whatsapp_numbers}
                          onChange={(e) => setAlertForm({ ...alertForm, whatsapp_numbers: e.target.value })}
                          placeholder="+5511999999999, +5511888888888"
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="alert_n8n_enabled"
                          checked={alertForm.n8n_enabled}
                          onCheckedChange={(checked) => setAlertForm({ ...alertForm, n8n_enabled: checked })}
                        />
                        <Label htmlFor="alert_n8n_enabled">Ativar n8n</Label>
                      </div>
                      {alertForm.n8n_enabled && (
                        <Input
                          value={alertForm.n8n_webhook_url}
                          onChange={(e) => setAlertForm({ ...alertForm, n8n_webhook_url: e.target.value })}
                          placeholder="https://sua-instancia-n8n.com/webhook/..."
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">Criar Alerta</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAlertForm(false)}>Cancelar</Button>
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
                      <div className="flex-1">
                        <h4 className="font-semibold">{alert.alert_name}</h4>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {alert.threshold_percentage && (
                            <Badge variant="outline">
                              <TrendingDown className="mr-1 h-3 w-3" />
                              Queda: {alert.threshold_percentage}%
                            </Badge>
                          )}
                          {alert.check_target_miss && (
                            <Badge variant="outline">
                              <Target className="mr-1 h-3 w-3" />
                              Meta: {alert.target_threshold_percentage}%
                            </Badge>
                          )}
                          {alert.trigger_count > 0 && (
                            <Badge variant="secondary">
                              {alert.trigger_count} disparos
                            </Badge>
                          )}
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
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Histórico Tab */}
        <TabsContent value="history" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Histórico de Alertas</h3>
            <p className="text-sm text-muted-foreground">Alertas disparados recentemente</p>
          </div>

          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <History className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.alert_reason}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(item.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant={item.variance_percentage > 20 ? 'destructive' : 'secondary'}>
                          {item.variance_percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {history.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="mx-auto h-12 w-12 mb-4" />
                    <p>Nenhum alerta disparado ainda</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}