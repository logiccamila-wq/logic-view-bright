import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  Database, 
  Activity, 
  Terminal,
  Globe,
  Settings,
  AlertCircle,
  CheckCircle,
  Zap,
  Server,
  FileCode,
  Play,
  RefreshCw
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle as AlertIcon } from "lucide-react";
import { toast } from "sonner";

function safeJson(r: Response) {
  const ct = r.headers.get("content-type") || ""
  if (!ct.includes("application/json")) throw new Error("Resposta não JSON")
  return r.json()
}

const Developer = () => {
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Buscar métricas do sistema
  const { data: systemMetrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      // Buscar contagem aproximada de registros
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: tripsCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true });

      const { count: cteCount } = await supabase
        .from('cte')
        .select('*', { count: 'exact', head: true });

      const totalRecords = (profilesCount || 0) + (tripsCount || 0) + (cteCount || 0);

      return {
        tables: 45, // Número fixo baseado no schema
        records: totalRecords,
        uptime: "99.9%",
        responseTime: "45ms"
      };
    }
  });

  // Mock data para edge functions
  const mockEdgeFunctions = [
    { name: "analyze-client", status: "active", lastRun: "2024-11-15 10:30", executions: 145 },
    { name: "calculate-driver-payroll", status: "active", lastRun: "2024-11-15 09:15", executions: 89 },
    { name: "ejg-chatbot", status: "active", lastRun: "2024-11-15 10:45", executions: 523 },
    { name: "import-cte-xml", status: "active", lastRun: "2024-11-15 08:20", executions: 67 },
    { name: "predict-revenue", status: "inactive", lastRun: "2024-11-14 22:10", executions: 12 },
  ];

  // Mock data para logs recentes
  const mockLogs = [
    { 
      id: "1", 
      timestamp: "2024-11-15 10:45:23", 
      level: "info", 
      service: "edge-function",
      message: "EJG Chatbot: Nova conversa iniciada",
      details: { userId: "123", conversationId: "conv-456" }
    },
    { 
      id: "2", 
      timestamp: "2024-11-15 10:44:15", 
      level: "success", 
      service: "database",
      message: "CT-e importado com sucesso",
      details: { cteNumber: "000123456", clientCNPJ: "12.345.678/0001-90" }
    },
    { 
      id: "3", 
      timestamp: "2024-11-15 10:43:02", 
      level: "warning", 
      service: "auth",
      message: "Tentativa de login com senha incorreta",
      details: { email: "user@example.com", attempts: 2 }
    },
    { 
      id: "4", 
      timestamp: "2024-11-15 10:42:18", 
      level: "error", 
      service: "edge-function",
      message: "Erro ao processar pagamento",
      details: { error: "Payment gateway timeout", payrollId: "pay-789" }
    },
  ];

  // Mock data para queries do banco
  const mockQueries = [
    { query: "SELECT * FROM trips WHERE status = 'em_andamento'", time: "15ms", rows: 23 },
    { query: "SELECT * FROM cte ORDER BY created_at DESC LIMIT 50", time: "32ms", rows: 50 },
    { query: "SELECT * FROM service_orders WHERE status = 'aberta'", time: "8ms", rows: 12 },
  ];

  const getLevelBadge = (level: string) => {
    const variants = {
      info: { label: "Info", className: "bg-blue-500/20 text-blue-600" },
      success: { label: "Success", className: "bg-green-500/20 text-green-600" },
      warning: { label: "Warning", className: "bg-yellow-500/20 text-yellow-600" },
      error: { label: "Error", className: "bg-red-500/20 text-red-600" },
    };
    return (
      <Badge className={variants[level as keyof typeof variants]?.className}>
        {variants[level as keyof typeof variants]?.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-500/20 text-green-600">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge className="bg-gray-500/20 text-gray-600">
        <AlertCircle className="w-3 h-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Painel do Desenvolvedor</h1>
          <p className="text-muted-foreground mt-2">
            Gerenciamento técnico e monitoramento do sistema
          </p>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Uptime"
            value={systemMetrics?.uptime || "99.9%"}
            icon={Activity}
            trend={{ value: "Últimos 30 dias", positive: true }}
          />
          <StatCard
            title="Tempo de Resposta"
            value={systemMetrics?.responseTime || "45ms"}
            icon={Zap}
            trend={{ value: "Média", positive: true }}
          />
          <StatCard
            title="Tabelas DB"
            value={systemMetrics?.tables || 0}
            icon={Database}
          />
          <StatCard
            title="Registros Totais"
            value={systemMetrics?.records?.toLocaleString() || "0"}
            icon={Server}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="functions" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="functions">Edge Functions</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="api">API Monitor</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
            <TabsTrigger value="supabase">Supabase Debug</TabsTrigger>
          </TabsList>

          {/* Edge Functions */}
          <TabsContent value="functions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Edge Functions
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar
                    </Button>
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Deploy
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Última Execução</TableHead>
                      <TableHead>Total Execuções</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEdgeFunctions.map((func) => (
                      <TableRow key={func.name}>
                        <TableCell className="font-mono font-medium">{func.name}</TableCell>
                        <TableCell>{getStatusBadge(func.status)}</TableCell>
                        <TableCell>{func.lastRun}</TableCell>
                        <TableCell>{func.executions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileCode className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Terminal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Queries Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead>Tempo</TableHead>
                      <TableHead>Linhas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockQueries.map((query, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{query.query}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{query.time}</Badge>
                        </TableCell>
                        <TableCell>{query.rows}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  SQL Console
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <textarea
                    className="w-full h-32 p-4 bg-muted rounded-md font-mono text-sm"
                    placeholder="Digite sua query SQL aqui..."
                  />
                  <Button>
                    <Play className="w-4 h-4 mr-2" />
                    Executar Query
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Logs do Sistema
                  </div>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {mockLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {getLevelBadge(log.level)}
                              <Badge variant="outline">{log.service}</Badge>
                              <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                            </div>
                            <p className="text-sm font-medium">{log.message}</p>
                            {selectedLog?.id === log.id && (
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Monitor */}
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Endpoints da API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-600">GET</Badge>
                        <code className="text-sm">/api/trips</code>
                      </div>
                      <Badge variant="outline">200ms</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Últimas 24h: 1.234 requests</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500/20 text-blue-600">POST</Badge>
                        <code className="text-sm">/api/cte</code>
                      </div>
                      <Badge variant="outline">350ms</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Últimas 24h: 456 requests</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500/20 text-yellow-600">PUT</Badge>
                        <code className="text-sm">/api/vehicles</code>
                      </div>
                      <Badge variant="outline">180ms</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Últimas 24h: 89 requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Modo Debug</h3>
                      <p className="text-sm text-muted-foreground">Ativar logs detalhados</p>
                    </div>
                    <Button variant="outline" size="sm">Desativado</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Cache Redis</h3>
                      <p className="text-sm text-muted-foreground">Sistema de cache distribuído</p>
                    </div>
                    <Button variant="outline" size="sm">Ativado</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Rate Limiting</h3>
                      <p className="text-sm text-muted-foreground">Limite de requisições por minuto</p>
                    </div>
                    <Button variant="outline" size="sm">100 req/min</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Backup Automático</h3>
                      <p className="text-sm text-muted-foreground">Backup diário do banco de dados</p>
                    </div>
                    <Button variant="outline" size="sm">Ativado</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variáveis de Ambiente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded font-mono text-xs">
                    <span className="text-muted-foreground">VITE_SUPABASE_URL=</span>
                    <span>***************************</span>
                  </div>
                  <div className="p-3 bg-muted rounded font-mono text-xs">
                    <span className="text-muted-foreground">VITE_SUPABASE_PUBLISHABLE_KEY=</span>
                    <span>***************************</span>
                  </div>
                  <div className="p-3 bg-muted rounded font-mono text-xs">
                    <span className="text-muted-foreground">NEON_API_KEY=</span>
                    <span>***************************</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Supabase Debug */}
          <TabsContent value="supabase" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Supabase Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">URL</div>
                    <div className="font-mono break-all bg-muted/30 p-2 rounded">
                      {import.meta.env.VITE_SUPABASE_URL || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Publishable Key (anon)</div>
                    <div className="font-mono break-all bg-muted/30 p-2 rounded">
                      {(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').slice(0, 16)}…
                    </div>
                  </div>
                </div>

                <div className="mt-4 border rounded p-3">
                  <Diagnostics />
                </div>
                <div className="mt-4">
                  <UsersDiagnostics />
                </div>
                <div className="mt-4 p-3 border rounded">
                  <AssignRoleTool />
                </div>
                {/* Runtime API Key Check */}
                <div className="mt-4 p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Teste de Auth Settings</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
                          const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

                          const res = await fetch(`${url}/auth/v1/settings`, {
                            headers: {
                              apikey: key,
                              Authorization: `Bearer ${key}`
                            }
                          });

                          if (res.ok) {
                            const json = await safeJson(res);
                            alert(`Auth Settings OK. Providers: ${Object.keys(json).join(', ')}`);
                          } else {
                            const text = await res.text();
                            alert(`Auth Settings falhou (${res.status}). Resposta: ${text}`);
                          }
                        } catch (e: any) {
                          alert(`Erro ao testar Auth Settings: ${e?.message || e}`);
                        }
                      }}
                    >
                      Testar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Este teste chama <code className="font-mono">/auth/v1/settings</code> com sua chave anon/public para validar se a API aceita a key.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

function Diagnostics() {
  // Decode token payload to show ref and role
  const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

  let projectRef = '';
  let tokenRef = '';
  let role = '';
  let tokenValid = false;
  let mismatch = false;

  try {
    const host = new URL(url).host;
    projectRef = host.split('.supabase.co')[0] || '';
  } catch {}

  try {
    const parts = key.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payloadBase64 + '='.repeat((4 - (payloadBase64.length % 4)) % 4);
      const payloadJson = JSON.parse(atob(padded));
      tokenRef = payloadJson?.ref || '';
      role = payloadJson?.role || '';
      tokenValid = !!tokenRef;
    }
  } catch {}

  mismatch = !!projectRef && !!tokenRef && projectRef !== tokenRef;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Info label="Project Ref" value={projectRef || 'N/A'} />
        <Info label="Token Ref" value={tokenRef || 'N/A'} />
        <Info label="Role" value={role || 'N/A'} />
      </div>
      <div className="flex items-center gap-2 text-sm">
        {mismatch ? (
          <span className="text-red-600 flex items-center gap-1"><AlertIcon className="w-4 h-4" /> Mismatch: a chave pertence ao projeto {tokenRef}, mas a URL aponta para {projectRef}.</span>
        ) : (
          <span className="text-green-700 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Chave e URL parecem consistentes.</span>
        )}
      </div>
      {!tokenValid && (
        <div className="text-yellow-700 text-sm flex items-center gap-1">
          <AlertIcon className="w-4 h-4" /> Não foi possível decodificar a chave. Verifique se é uma publishable/anon key válida.
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono bg-muted/30 p-2 rounded break-all">{value}</div>
    </div>
  );
}

export default Developer;

const UsersDiagnostics = () => {
  const [users, setUsers] = useState([] as any[]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at, user_roles(role)')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar usuários: ' + error.message);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnóstico de Usuários e Roles</CardTitle>
        <CardDescription>Lista de usuários com roles e status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>
                    {user.user_roles?.map(r => r.role).join(', ') || 'Sem role'}
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

const AssignRoleTool = () => {
  const [email, setEmail] = useState("logiccamila@gmail.com");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const ct = r.headers.get('content-type') || '';
      let msg = `Status ${r.status}`;
      if (ct.includes('application/json')) {
        const j = await r.json();
        msg = j.error ? `Erro: ${j.error}` : `OK: ${j.role || role}`;
      } else {
        msg = await r.text();
      }
      alert(`Assign Role: ${msg}`);
    } catch (e: any) {
      alert(`Falha: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Atribuir Role ao Usuário</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input className="p-2 border rounded" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" />
        <input className="p-2 border rounded" value={role} onChange={(e)=>setRole(e.target.value)} placeholder="role" />
        <Button disabled={loading} onClick={submit}>{loading ? 'Processando…' : 'Atribuir'}</Button>
      </div>
      <p className="text-xs text-muted-foreground">Usa /api/assign-role no backend. Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em Produção.</p>
    </div>
  );
};
