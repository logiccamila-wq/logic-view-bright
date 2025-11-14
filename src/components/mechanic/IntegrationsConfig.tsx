import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Workflow, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IntegrationConfig {
  id?: string;
  integration_type: string;
  is_active: boolean;
  config: Record<string, any>;
}

export function IntegrationsConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  // WhatsApp state
  const [whatsappConfig, setWhatsappConfig] = useState<IntegrationConfig>({
    integration_type: 'whatsapp',
    is_active: false,
    config: {
      apiKey: '',
      apiUrl: 'https://graph.facebook.com/v18.0',
      phoneNumberId: '',
    },
  });

  // n8n state
  const [n8nConfig, setN8nConfig] = useState<IntegrationConfig>({
    integration_type: 'n8n',
    is_active: false,
    config: {
      webhookUrl: '',
      description: '',
    },
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      data?.forEach((integration: any) => {
        const config = {
          id: integration.id,
          integration_type: integration.integration_type,
          is_active: integration.is_active,
          config: integration.config as Record<string, any>,
        };
        
        if (integration.integration_type === 'whatsapp') {
          setWhatsappConfig(config);
        } else if (integration.integration_type === 'n8n') {
          setN8nConfig(config);
        }
      });
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveIntegration = async (config: IntegrationConfig) => {
    if (!user) return;

    try {
      const data = {
        user_id: user.id,
        integration_type: config.integration_type,
        is_active: config.is_active,
        config: config.config,
      };

      const { error } = await (supabase as any)
        .from('integration_settings')
        .upsert(data, {
          onConflict: 'user_id,integration_type',
        });

      if (error) throw error;

      toast({
        title: '✅ Configuração Salva',
        description: `Integração ${config.integration_type === 'whatsapp' ? 'WhatsApp' : 'n8n'} atualizada com sucesso`,
      });

      loadIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a configuração',
        variant: 'destructive',
      });
    }
  };

  const testWhatsAppIntegration = async () => {
    setTesting('whatsapp');
    try {
      const { error } = await supabase.functions.invoke('send-whatsapp-alert', {
        body: {
          alertType: 'cost_threshold',
          currentValue: 5000,
          threshold: 3000,
          period: 'Teste de Integração',
          phoneNumbers: [whatsappConfig.config.testPhoneNumber || ''],
          whatsappApiKey: whatsappConfig.config.apiKey,
          whatsappApiUrl: whatsappConfig.config.apiUrl,
        },
      });

      if (error) throw error;

      toast({
        title: '✅ Teste Enviado',
        description: 'Mensagem de teste enviada via WhatsApp',
      });
    } catch (error: any) {
      console.error('Error testing WhatsApp:', error);
      toast({
        title: 'Erro no Teste',
        description: error.message || 'Não foi possível enviar a mensagem de teste',
        variant: 'destructive',
      });
    } finally {
      setTesting(null);
    }
  };

  const testN8nIntegration = async () => {
    setTesting('n8n');
    try {
      const { error } = await supabase.functions.invoke('trigger-n8n-workflow', {
        body: {
          webhookUrl: n8nConfig.config.webhookUrl,
          alertData: {
            alertType: 'cost_threshold',
            alertName: 'Teste de Integração',
            currentValue: 5000,
            threshold: 3000,
            period: 'Teste',
            timestamp: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      toast({
        title: '✅ Workflow Disparado',
        description: 'Workflow n8n acionado com sucesso',
      });
    } catch (error: any) {
      console.error('Error testing n8n:', error);
      toast({
        title: 'Erro no Teste',
        description: error.message || 'Não foi possível disparar o workflow',
        variant: 'destructive',
      });
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Integrações</h2>
        <p className="text-sm text-muted-foreground">
          Configure integrações para enviar alertas via múltiplos canais
        </p>
      </div>

      <Tabs defaultValue="whatsapp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="whatsapp">
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp Business
          </TabsTrigger>
          <TabsTrigger value="n8n">
            <Workflow className="h-4 w-4 mr-2" />
            n8n Workflows
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp Configuration */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Business API
                  </CardTitle>
                  <CardDescription>
                    Envie alertas automáticos via WhatsApp para sua equipe
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {whatsappConfig.is_active && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Ativo
                    </Badge>
                  )}
                  <Switch
                    checked={whatsappConfig.is_active}
                    onCheckedChange={(checked) => {
                      const updated = { ...whatsappConfig, is_active: checked };
                      setWhatsappConfig(updated);
                      saveIntegration(updated);
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Para usar a WhatsApp Business API, você precisa ter uma conta no{' '}
                  <a
                    href="https://business.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    Meta Business
                  </a>{' '}
                  e configurar o WhatsApp Business API.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp_api_key">WhatsApp API Token</Label>
                  <Input
                    id="whatsapp_api_key"
                    type="password"
                    value={whatsappConfig.config.apiKey || ''}
                    onChange={(e) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        config: { ...whatsappConfig.config, apiKey: e.target.value },
                      })
                    }
                    placeholder="EAAxxxxxxxxxxxx..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Token de acesso permanente da Meta Business
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone_number_id">Phone Number ID</Label>
                  <Input
                    id="phone_number_id"
                    value={whatsappConfig.config.phoneNumberId || ''}
                    onChange={(e) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        config: { ...whatsappConfig.config, phoneNumberId: e.target.value },
                      })
                    }
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ID do número de telefone do WhatsApp Business
                  </p>
                </div>

                <div>
                  <Label htmlFor="whatsapp_api_url">API URL (Opcional)</Label>
                  <Input
                    id="whatsapp_api_url"
                    value={whatsappConfig.config.apiUrl || ''}
                    onChange={(e) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        config: { ...whatsappConfig.config, apiUrl: e.target.value },
                      })
                    }
                    placeholder="https://graph.facebook.com/v18.0"
                  />
                </div>

                <div>
                  <Label htmlFor="test_phone">Número para Teste (com DDI)</Label>
                  <Input
                    id="test_phone"
                    value={whatsappConfig.config.testPhoneNumber || ''}
                    onChange={(e) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        config: { ...whatsappConfig.config, testPhoneNumber: e.target.value },
                      })
                    }
                    placeholder="5511999999999"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ex: 5511999999999 (código do país + DDD + número)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => saveIntegration(whatsappConfig)} className="flex-1">
                    Salvar Configuração
                  </Button>
                  <Button
                    onClick={testWhatsAppIntegration}
                    variant="outline"
                    disabled={
                      !whatsappConfig.config.apiKey ||
                      !whatsappConfig.config.testPhoneNumber ||
                      testing === 'whatsapp'
                    }
                  >
                    {testing === 'whatsapp' ? 'Enviando...' : 'Testar Integração'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* n8n Configuration */}
        <TabsContent value="n8n">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    n8n Workflow Automation
                  </CardTitle>
                  <CardDescription>
                    Conecte alertas a workflows personalizados no n8n
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {n8nConfig.is_active && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Ativo
                    </Badge>
                  )}
                  <Switch
                    checked={n8nConfig.is_active}
                    onCheckedChange={(checked) => {
                      const updated = { ...n8nConfig, is_active: checked };
                      setN8nConfig(updated);
                      saveIntegration(updated);
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Workflow className="h-4 w-4" />
                <AlertDescription>
                  Crie workflows personalizados no{' '}
                  <a
                    href="https://n8n.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    n8n
                  </a>{' '}
                  para processar alertas de custo. Configure um trigger "Webhook" e cole a URL aqui.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="n8n_webhook_url">Webhook URL do n8n</Label>
                  <Input
                    id="n8n_webhook_url"
                    value={n8nConfig.config.webhookUrl || ''}
                    onChange={(e) =>
                      setN8nConfig({
                        ...n8nConfig,
                        config: { ...n8nConfig.config, webhookUrl: e.target.value },
                      })
                    }
                    placeholder="https://seu-n8n.com/webhook/xxxxx"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL do webhook gerada pelo n8n workflow
                  </p>
                </div>

                <div>
                  <Label htmlFor="n8n_description">Descrição do Workflow</Label>
                  <Input
                    id="n8n_description"
                    value={n8nConfig.config.description || ''}
                    onChange={(e) =>
                      setN8nConfig({
                        ...n8nConfig,
                        config: { ...n8nConfig.config, description: e.target.value },
                      })
                    }
                    placeholder="Ex: Enviar para Slack e criar ticket no Jira"
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Estrutura do Payload
                  </h4>
                  <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`{
  "source": "ejg_fleet_management",
  "module": "maintenance_cost_alerts",
  "timestamp": "2024-01-15T10:30:00Z",
  "alert": {
    "type": "cost_threshold",
    "vehicle_plate": "ABC-1234",
    "current_value": 5000,
    "threshold": 3000,
    "period": "Últimos 30 dias"
  }
}`}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => saveIntegration(n8nConfig)} className="flex-1">
                    Salvar Configuração
                  </Button>
                  <Button
                    onClick={testN8nIntegration}
                    variant="outline"
                    disabled={!n8nConfig.config.webhookUrl || testing === 'n8n'}
                  >
                    {testing === 'n8n' ? 'Testando...' : 'Testar Webhook'}
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Dica:</strong> No n8n, você pode criar workflows para:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Enviar mensagens para Slack ou Microsoft Teams</li>
                    <li>Criar tickets automaticamente no Jira ou Trello</li>
                    <li>Enviar notificações para Discord ou Telegram</li>
                    <li>Registrar eventos em Google Sheets ou Airtable</li>
                    <li>Disparar ações em outros sistemas (ERP, CRM, etc.)</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
