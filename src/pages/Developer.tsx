import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="functions">Edge Functions</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="api">API Monitor</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default Developer;
