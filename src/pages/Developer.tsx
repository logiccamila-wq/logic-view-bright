import { useState, useEffect } from "react";
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

const platformOrganization = [
  {
    area: "Backend",
    icon: Server,
    owner: "Azure Functions + runtime API",
    summary: "Centraliza autenticação, autorização por roles, integrações e regras de negócio sensíveis.",
    highlights: [
      "API principal em /api/runtime/*",
      "JWT com AZURE_JWT_SECRET e validação de roles",
      "Integrações externas e automações ficam no backend"
    ]
  },
  {
    area: "Frontend",
    icon: Globe,
    owner: "React 18 + TypeScript + Vite",
    summary: "Entrega módulos de negócio lazy-loaded e consome o runtime Azure com cache e estados reativos.",
    highlights: [
      "Rotas centralizadas em src/App.tsx",
      "Módulos registrados em src/modules/registry.ts",
      "Hooks e React Query sustentam listagens e sincronização"
    ]
  },
  {
    area: "UI & UX",
    icon: Settings,
    owner: "TailwindCSS + shadcn/ui",
    summary: "Padroniza componentes, feedback visual, acessibilidade e responsividade para o produto inteiro.",
    highlights: [
      "Biblioteca em src/components/ui/",
      "Layout compartilhado com sidebar, header e skeletons",
      "Experiência consistente para dashboards, formulários e tabelas"
    ]
  },
  {
    area: "CI/CD",
    icon: RefreshCw,
    owner: "GitHub Actions + Azure Static Web Apps",
    summary: "Automatiza instalação, build e deploy do frontend e da API em cada push ou PR para main.",
    highlights: [
      "Workflow: .github/workflows/azure-static-web-apps.yml",
      "Pipeline usa npm ci + npm run build:azure",
      "Deploy publica app em dist e API na pasta api"
    ]
  },
  {
    area: "CRUD",
    icon: Code2,
    owner: "Páginas de negócio + Admin Dados",
    summary: "Operações de criar, listar, atualizar e excluir devem ficar distribuídas por domínio, com apoio do admin técnico.",
    highlights: [
      "Página /admin oferece CRUD técnico rápido",
      "Fluxos de negócio continuam nos módulos específicos",
      "Mutations devem invalidar queries para manter UI sincronizada"
    ]
  },
  {
    area: "Banco de Dados",
    icon: Database,
    owner: "Azure Database for PostgreSQL",
    summary: "Armazena perfis, viagens, documentos e eventos operacionais acessados pelo runtime seguro.",
    highlights: [
      "Banco acessado pelo backend, nunca direto com secrets no frontend",
      "Queries e roles técnicas ficam auditáveis no runtime",
      "Estrutura e evolução do schema seguem migrations SQL"
    ]
  }
] as const;

const deliveryPipeline = [
  {
    step: "1. Commit e Pull Request",
    detail: "Mudanças entram pela branch e são validadas antes da publicação.",
  },
  {
    step: "2. Instalação e build",
    detail: "O workflow executa npm ci e npm run build:azure para gerar o bundle Vite.",
  },
  {
    step: "3. Deploy Azure",
    detail: "O action Azure/static-web-apps-deploy publica o frontend em dist e mantém api/ disponível.",
  },
  {
    step: "4. Operação assistida",
    detail: "Logs, diagnósticos e testes de health check permanecem acessíveis nesta própria central técnica.",
  },
] as const;

const technicalOwnership = [
  {
    scope: "Rotas e módulos",
    source: "src/App.tsx + src/modules/registry.ts",
    responsibility: "Organizam navegação, lazy loading e catálogo funcional do produto.",
  },
  {
    scope: "Componentes visuais",
    source: "src/components/ui/ + layout compartilhado",
    responsibility: "Garantem consistência de UI/UX, feedback e acessibilidade.",
  },
  {
    scope: "Integração de dados",
    source: "src/integrations/supabase/client.ts + hooks",
    responsibility: "Padronizam chamadas ao runtime e sincronização com o frontend.",
  },
  {
    scope: "CRUD técnico",
    source: "src/pages/Admin.tsx",
    responsibility: "Oferece operação rápida para tabelas críticas em suporte administrativo.",
  },
  {
    scope: "API e segurança",
    source: "api/runtime/index.js",
    responsibility: "Concentra autenticação, autorização, CORS e acesso seguro ao PostgreSQL.",
  },
  {
    scope: "Entrega contínua",
    source: ".github/workflows/azure-static-web-apps.yml",
    responsibility: "Automatiza build, deploy e encerramento de ambientes de PR.",
  },
] as const;

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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="organization">Organização</TabsTrigger>
            <TabsTrigger value="functions">Edge Functions</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="api">API Monitor</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
            <TabsTrigger value="supabase">Supabase Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="organization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organização da Plataforma</CardTitle>
                <CardDescription>
                  Visão central para alinhar backend, frontend, UI/UX, CI/CD, CRUD e banco de dados em um único fluxo operacional.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {platformOrganization.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Card key={item.area} className="border-dashed">
                        <CardHeader className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5 text-primary" />
                              <CardTitle className="text-lg">{item.area}</CardTitle>
                            </div>
                            <Badge variant="outline">{item.owner}</Badge>
                          </div>
                          <CardDescription>{item.summary}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {item.highlights.map((highlight) => (
                              <li key={highlight} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        Pipeline de entrega
                      </CardTitle>
                      <CardDescription>
                        Fluxo mínimo recomendado para manter a plataforma organizada do código até a publicação.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {deliveryPipeline.map((stage) => (
                        <div key={stage.step} className="rounded-lg border p-4">
                          <p className="font-medium">{stage.step}</p>
                          <p className="text-sm text-muted-foreground mt-1">{stage.detail}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Terminal className="w-5 h-5" />
                        Mapa de responsabilidades
                      </CardTitle>
                      <CardDescription>
                        Referência rápida dos arquivos e áreas que sustentam a organização técnica do produto.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Escopo</TableHead>
                            <TableHead>Fonte principal</TableHead>
                            <TableHead>Responsabilidade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {technicalOwnership.map((item) => (
                            <TableRow key={item.scope}>
                              <TableCell className="font-medium">{item.scope}</TableCell>
                              <TableCell className="font-mono text-xs">{item.source}</TableCell>
                              <TableCell>{item.responsibility}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                    <span className="text-muted-foreground">VITE_API_BASE_URL=</span>
                    <span>{import.meta.env.VITE_API_BASE_URL || '/api'}</span>
                  </div>
                  <div className="p-3 bg-muted rounded font-mono text-xs">
                    <span className="text-muted-foreground">VITE_APP_URL=</span>
                    <span>{import.meta.env.VITE_APP_URL || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Azure API Debug */}
          <TabsContent value="supabase" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Azure API Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">API Base URL</div>
                    <div className="font-mono break-all bg-muted/30 p-2 rounded">
                      {import.meta.env.VITE_API_BASE_URL || '/api'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">App URL</div>
                    <div className="font-mono break-all bg-muted/30 p-2 rounded">
                      {import.meta.env.VITE_APP_URL || window.location.origin}
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
                {/* Runtime API Health Check */}
                <div className="mt-4 p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Teste de Health Check</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
                          const res = await fetch(`${apiBase}/runtime/health`);

                          if (res.ok) {
                            const json = await safeJson(res);
                            alert(`API Health OK: ${JSON.stringify(json)}`);
                          } else {
                            const text = await res.text();
                            alert(`Health check falhou (${res.status}). Resposta: ${text}`);
                          }
                        } catch (e: any) {
                          alert(`Erro ao testar Health Check: ${e?.message || e}`);
                        }
                      }}
                    >
                      Testar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Testa <code className="font-mono">/api/runtime/health</code> para validar se a API Azure está respondendo.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

function Diagnostics() {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Info label="API Base" value={apiBase} />
        <Info label="App URL" value={import.meta.env.VITE_APP_URL || window.location.origin} />
        <Info label="Platform" value="Azure Static Web Apps" />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-700 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Configuração 100% Azure.</span>
      </div>
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
      <p className="text-xs text-muted-foreground">Usa /api/assign-role no backend. Requer AZURE_JWT_SECRET e DATABASE_URL em Produção.</p>
    </div>
  );
};
