import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Link as LinkIcon
} from "lucide-react";

export default function SettingsOdoo() {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    url: 'https://xyzlogicflow.odoo.com',
    database: '',
    username: '',
    apiKey: '',
    syncProducts: true,
    syncCustomers: true,
    syncOrders: true,
    autoSync: false,
    syncInterval: 3600, // 1 hour in seconds
  });
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadConfig();
  }, [user]);

  const loadConfig = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('config, is_active, last_sync_at')
        .eq('user_id', user.id)
        .eq('integration_type', 'odoo')
        .single();

      if (error) {
        console.log('No existing Odoo config found');
        return;
      }

      if (data?.config) {
        setConfig(prev => ({
          ...prev,
          ...(data.config || {}),
        }));
        setConnectionStatus(data.is_active ? 'connected' : 'disconnected');
        if (data.last_sync_at) {
          setLastSync(new Date(data.last_sync_at));
        }
      }
    } catch (error) {
      console.error('Error loading Odoo config:', error);
    }
  };

  const saveConfig = async () => {
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          user_id: user.id,
          integration_type: 'odoo',
          is_active: true,
          config,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,integration_type'
        });

      if (error) throw error;
      
      toast.success('Configuração salva com sucesso');
      setConnectionStatus('connected');
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar configuração: ' + error.message);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    
    try {
      // Call Supabase Edge Function to test Odoo connection
      const { data, error } = await supabase.functions.invoke('odoo-test-connection', {
        body: {
          url: config.url,
          database: config.database,
          username: config.username,
          apiKey: config.apiKey,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`✅ Conexão estabelecida com sucesso! UID: ${data.uid}`);
        setConnectionStatus('connected');
      } else {
        toast.error(`❌ Falha na conexão: ${data?.error || 'Erro desconhecido'}`);
        setConnectionStatus('disconnected');
      }
    } catch (error: any) {
      console.error('Error testing connection:', error);
      toast.error('Erro ao testar conexão: ' + error.message);
      setConnectionStatus('disconnected');
    } finally {
      setTesting(false);
    }
  };

  const syncNow = async () => {
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    setSyncing(true);
    const startTime = Date.now();
    
    try {
      toast.info('🔄 Iniciando sincronização com Odoo...');

      const { data, error } = await supabase.functions.invoke('odoo-sync', {
        body: {
          config,
          userId: user.id,
        }
      });

      if (error) throw error;

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (data?.success) {
        const message = [
          `✅ Sincronização concluída em ${duration}s`,
          data.products ? `Produtos: ${data.products}` : '',
          data.customers ? `Clientes: ${data.customers}` : '',
          data.orders ? `Pedidos: ${data.orders}` : '',
        ].filter(Boolean).join(' | ');

        toast.success(message);
        setLastSync(new Date());

        // Update last_sync_at in database
        await supabase
          .from('integration_settings')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('integration_type', 'odoo');
      } else {
        toast.error(`❌ Erro na sincronização: ${data?.message || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      console.error('Error syncing:', error);
      toast.error('Erro ao sincronizar: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'disconnected':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Desconectado</Badge>;
      default:
        return <Badge variant="secondary">Não testado</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8" />
          Integração Odoo
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure a conexão com seu ERP Odoo para sincronizar dados automaticamente
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Status da Integração
              </CardTitle>
              <CardDescription>
                {lastSync 
                  ? `Última sincronização: ${lastSync.toLocaleString('pt-BR')}` 
                  : 'Nenhuma sincronização realizada'}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
      </Card>

      {/* Connection Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Configuração da Conexão
          </CardTitle>
          <CardDescription>
            Credenciais de acesso ao Odoo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Help Alert for API Credentials */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>📍 Onde obter as credenciais do Odoo.com:</strong>
              <br />
              1. Acesse seu Odoo.com e faça login
              <br />
              2. Vá em <strong>Configurações → Usuários & Empresas → Usuários</strong>
              <br />
              3. Clique no seu usuário → Aba <strong>"Preferências"</strong>
              <br />
              4. Role até <strong>"Account Security"</strong> → Seção <strong>"API Keys"</strong>
              <br />
              5. Clique em <strong>"New API Key"</strong>, dê um nome (ex: "Logic View Bright") e copie a chave
              <br />
              <br />
              <strong>🔗 Acesso direto:</strong>{' '}
              <a 
                href="https://www.odoo.com/my/home" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Odoo.com → My Account → API Keys
              </a>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="url">URL do Odoo</Label>
            <Input
              id="url"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              placeholder="https://xyzlogicflow.odoo.com"
            />
            <p className="text-xs text-muted-foreground">
              URL completa da sua instância Odoo (sem /web no final)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="database">Nome do Banco de Dados</Label>
            <Input
              id="database"
              value={config.database}
              onChange={(e) => setConfig({ ...config, database: e.target.value })}
              placeholder="xyzlogicflow"
            />
            <p className="text-xs text-muted-foreground">
              Nome da sua base de dados Odoo (geralmente o mesmo do subdomínio)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuário / E-mail</Label>
            <Input
              id="username"
              type="email"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              placeholder="admin@xyzlogicflow.com"
            />
            <p className="text-xs text-muted-foreground">
              E-mail que você usa para fazer login no Odoo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave API do Odoo.com</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="••••••••"
            />
            <p className="text-xs text-muted-foreground">
              <strong>⚠️ Use API Key, não sua senha!</strong> A API Key é mais segura e pode ser revogada a qualquer momento.
              <br />
              Onde criar: <strong>Odoo.com → Minha Conta → Preferências → Account Security → API Keys</strong>
            </p>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={saveConfig}>
              Salvar Configuração
            </Button>
            <Button variant="outline" onClick={testConnection} disabled={testing}>
              {testing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Testando...</>
              ) : (
                <><CheckCircle2 className="mr-2 h-4 w-4" />Testar Conexão</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Opções de Sincronização
          </CardTitle>
          <CardDescription>
            Escolha quais dados sincronizar com o Odoo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="syncProducts" className="text-base">Sincronizar Produtos</Label>
              <p className="text-sm text-muted-foreground">
                Importar catálogo de produtos e estoque
              </p>
            </div>
            <Switch
              id="syncProducts"
              checked={config.syncProducts}
              onCheckedChange={(checked) => setConfig({ ...config, syncProducts: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="syncCustomers" className="text-base">Sincronizar Clientes</Label>
              <p className="text-sm text-muted-foreground">
                Importar cadastro de clientes/parceiros
              </p>
            </div>
            <Switch
              id="syncCustomers"
              checked={config.syncCustomers}
              onCheckedChange={(checked) => setConfig({ ...config, syncCustomers: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="syncOrders" className="text-base">Sincronizar Pedidos</Label>
              <p className="text-sm text-muted-foreground">
                Importar pedidos de venda e compra
              </p>
            </div>
            <Switch
              id="syncOrders"
              checked={config.syncOrders}
              onCheckedChange={(checked) => setConfig({ ...config, syncOrders: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSync" className="text-base">Sincronização Automática</Label>
              <p className="text-sm text-muted-foreground">
                Sincronizar automaticamente a cada {config.syncInterval / 60} minutos
              </p>
            </div>
            <Switch
              id="autoSync"
              checked={config.autoSync}
              onCheckedChange={(checked) => setConfig({ ...config, autoSync: checked })}
            />
          </div>

          <Separator />

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A primeira sincronização pode levar alguns minutos dependendo da quantidade de dados.
              Os dados serão armazenados localmente para consulta offline.
            </AlertDescription>
          </Alert>

          <Button onClick={syncNow} className="w-full" disabled={syncing || connectionStatus !== 'connected'} size="lg">
            {syncing ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Sincronizando...</>
            ) : (
              <><RefreshCw className="mr-2 h-5 w-5" />Sincronizar Agora</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle>Precisa de Ajuda?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">🔑 Como obter Chave API do Odoo.com</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Acesse <a href="https://www.odoo.com/my/home" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">odoo.com/my/home</a> e faça login</li>
              <li>Clique no seu nome (canto superior direito) → <strong>"My Account"</strong></li>
              <li>Vá na aba <strong>"Account Security"</strong></li>
              <li>Na seção <strong>"Developer API Keys"</strong>, clique em <strong>"New API Key"</strong></li>
              <li>Dê um nome para a chave (ex: "Logic View Bright")</li>
              <li>Copie a chave gerada e cole no campo "Chave API" acima</li>
            </ol>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">📚 Documentação Útil</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Documentação Odoo:</strong>{' '}
                <a 
                  href="https://www.odoo.com/documentation/18.0/developer/api/external_api.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  API Externa (v18.0)
                </a>
              </p>
              <p>
                <strong>Sua Instância:</strong>{' '}
                <a 
                  href={config.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {config.url}
                </a>
              </p>
              <p>
                <strong>Gerenciar API Keys:</strong>{' '}
                <a 
                  href="https://www.odoo.com/my/security" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Connection & Security Page
                </a>
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">⚠️ Importante: Diferença entre Senha e API Key</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>✅ Use API Key (recomendado):</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Mais segura - não expõe sua senha</li>
                <li>Pode ser revogada sem mudar sua senha</li>
                <li>Permite rastrear uso da API</li>
                <li>Criada em: Account Security → Developer API Keys</li>
              </ul>
              <p className="mt-2"><strong>❌ Evite usar senha:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Menos segura - expõe credencial principal</li>
                <li>Se comprometida, precisa trocar senha em tudo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
