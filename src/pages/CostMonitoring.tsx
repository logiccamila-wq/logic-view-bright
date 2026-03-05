import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNeonMetrics } from "@/hooks/useNeonMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2,
  Database,
  HardDrive,
  Network,
  Clock,
  Users,
  BarChart3,
  ArrowRight
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

// Dados mockados do Neon (baseados na sua imagem)
const currentNeonUsage = {
  computeHours: 5.12,
  storageGB: 0.13,
  historyGB: 0,
  networkGB: 0,
  branches: 39,
  cost: 5.86, // USD
  period: "Novembro 2025"
};

// Preços Neon
const neonPricing = {
  computePerHour: 0.222, // USD por CU/hora
  storagePerGB: 0.35, // USD por GB/mês
  historyPerGB: 0.20, // USD por GB/mês
  branchHours: 0.0018 // USD por hora de branch
};

// Preços Supabase
const supabasePricing = {
  free: { monthly: 0, users: 50000, storage: 0.5, compute: "compartilhado" },
  pro: { monthly: 25, users: 100000, storage: 8, compute: "dedicado", extraMAU: 0.00325 },
  team: { monthly: 599, users: 100000, storage: 8, compute: "dedicado" }
};

// Projeções baseadas em número de clientes
const projectionsData = [
  { clients: 1, neon: 5.86, supabaseFree: 0, supabasePro: 25, recommended: "neon" },
  { clients: 5, neon: 12.50, supabaseFree: 0, supabasePro: 25, recommended: "neon" },
  { clients: 10, neon: 22.00, supabaseFree: 0, supabasePro: 25, recommended: "neon" },
  { clients: 20, neon: 38.00, supabaseFree: "pausado", supabasePro: 25, recommended: "supabase" },
  { clients: 50, neon: 85.00, supabaseFree: "pausado", supabasePro: 32.50, recommended: "supabase" },
  { clients: 100, neon: 165.00, supabaseFree: "pausado", supabasePro: 50.00, recommended: "supabase" },
  { clients: 500, neon: 450.00, supabaseFree: "pausado", supabasePro: 187.50, recommended: "supabase" },
  { clients: 1000, neon: 850.00, supabaseFree: "pausado", supabasePro: 350.00, recommended: "supabase" }
];

// Histórico mensal (mockado)
const monthlyHistory = [
  { month: "Jun", cost: 3.20, compute: 3.2, storage: 0.8, branches: 2.1 },
  { month: "Jul", cost: 4.15, compute: 4.0, storage: 1.2, branches: 2.8 },
  { month: "Ago", cost: 4.85, compute: 4.5, storage: 1.5, branches: 3.2 },
  { month: "Set", cost: 5.20, compute: 4.8, storage: 1.6, branches: 3.5 },
  { month: "Out", cost: 5.60, compute: 5.0, storage: 1.7, branches: 4.0 },
  { month: "Nov", cost: 5.86, compute: 5.12, storage: 1.8, branches: 4.7 }
];

export default function CostMonitoring() {
  const [selectedClients, setSelectedClients] = useState(10);
  const [neonProjectId, setNeonProjectId] = useState<string>("");
  const [useRealData, setUseRealData] = useState(false);
  
  // Buscar métricas reais do Neon
  const { metrics: neonMetrics, loading: neonLoading, error: neonError, refetch } = useNeonMetrics(
    neonProjectId,
    useRealData
  );

  // Usar dados reais se disponíveis, senão usar mockados
  const currentUsage = neonMetrics ? {
    computeHours: parseFloat(neonMetrics.computeHours),
    storageGB: parseFloat(neonMetrics.storageGB),
    historyGB: 0,
    networkGB: parseFloat(neonMetrics.dataTransferGB),
    branches: neonMetrics.branches,
    cost: parseFloat(neonMetrics.totalEstimatedCost),
    period: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  } : currentNeonUsage;

  const handleConnectNeon = () => {
    if (neonProjectId.trim()) {
      setUseRealData(true);
      refetch();
    }
  };

  const currentProjection = projectionsData.find(p => p.clients === selectedClients);
  const migrationThreshold = projectionsData.find(p => p.recommended === "supabase" && p.clients <= selectedClients);

  const shouldMigrate = migrationThreshold && selectedClients >= migrationThreshold.clients;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Monitoramento de Custos</h1>
        <p className="text-muted-foreground">
          Acompanhe gastos de infraestrutura e projeções para crescimento
        </p>
      </div>

      {/* Conexão com Neon */}
      {!useRealData && (
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">
                  Conectar ao Neon Database
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                  Digite o ID do seu projeto Neon para ver métricas de uso em tempo real
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="neon-project-id" className="text-sm">Project ID</Label>
                  <Input
                    id="neon-project-id"
                    placeholder="ex: autumn-frost-12345"
                    value={neonProjectId}
                    onChange={(e) => setNeonProjectId(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Encontre no dashboard Neon em Settings → General
                  </p>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleConnectNeon} disabled={!neonProjectId.trim()}>
                    Conectar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {useRealData && neonMetrics && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-green-900 dark:text-green-100 mb-2">
                  Conectado ao Neon: {neonMetrics.projectName}
                </h3>
                <p className="text-green-800 dark:text-green-200 text-sm mb-2">
                  Região: {neonMetrics.region} • {neonMetrics.branches} branches ativos
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Última atualização: {neonMetrics.lastUpdated ? new Date(neonMetrics.lastUpdated).toLocaleString('pt-BR') : '-'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={refetch} disabled={neonLoading}>
                {neonLoading ? "Atualizando..." : "Atualizar"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setUseRealData(false)}>
                Desconectar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {neonError && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-red-900 dark:text-red-100 mb-2">
                  Erro ao conectar com Neon
                </h3>
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {neonError}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Recomendação */}
      {shouldMigrate ? (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-orange-900 dark:text-orange-100 mb-2">
                  Considere Migrar para Supabase Pro
                </h3>
                <p className="text-orange-800 dark:text-orange-200 mb-3">
                  Com {selectedClients} clientes, o Supabase Pro (${currentProjection?.supabasePro}/mês) 
                  será mais econômico que o Neon (${currentProjection?.neon}/mês).
                </p>
                <div className="flex gap-3">
                  <Button variant="default" size="sm">
                    Ver Planos Supabase
                  </Button>
                  <Button variant="outline" size="sm">
                    Calcular Break-even
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-green-900 dark:text-green-100 mb-2">
                  Neon é a Melhor Opção Agora
                </h3>
                <p className="text-green-800 dark:text-green-200">
                  Para {selectedClients} clientes, o Neon (${currentProjection?.neon}/mês) 
                  é mais econômico que Supabase Pro (${currentProjection?.supabasePro}/mês). 
                  Continue focando em crescimento!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas Atuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Custo Atual {useRealData ? '(Tempo Real)' : '(Simulado)'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {neonLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">${currentUsage.cost.toFixed(2)}</div>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +4.6% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compute (CU-horas)</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {neonLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{currentUsage.computeHours.toFixed(2)}h</div>
                <p className="text-xs text-muted-foreground">
                  ${(currentUsage.computeHours * neonPricing.computePerHour).toFixed(2)} este mês
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {neonLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{currentUsage.storageGB.toFixed(2)} GB</div>
                <p className="text-xs text-muted-foreground">
                  ${(currentUsage.storageGB * neonPricing.storagePerGB).toFixed(2)} este mês
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Branches Ativos</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {neonLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">{currentUsage.branches}</div>
                <p className="text-xs text-muted-foreground">
                  {useRealData ? 'Branches ativos' : `$${(2583 * neonPricing.branchHours).toFixed(2)} em branches`}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principais */}
      <Tabs defaultValue="projections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projections">Projeções de Crescimento</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="comparison">Comparação de Planos</TabsTrigger>
        </TabsList>

        {/* Projeções */}
        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Custos por Número de Clientes</CardTitle>
              <CardDescription>
                Veja quanto custará sua infraestrutura conforme sua startup cresce
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seletor de Clientes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Número de Clientes</label>
                  <Badge variant="secondary">{selectedClients} clientes</Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[1, 5, 10, 20, 50, 100, 500, 1000].map((num) => (
                    <Button
                      key={num}
                      variant={selectedClients === num ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedClients(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Gráfico de Comparação */}
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={projectionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="clients" label={{ value: 'Clientes', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Custo Mensal (USD)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="neon" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Neon" />
                  <Area type="monotone" dataKey="supabasePro" stackId="2" stroke="#10b981" fill="#10b981" name="Supabase Pro" />
                </AreaChart>
              </ResponsiveContainer>

              {/* Detalhes da Projeção Selecionada */}
              {currentProjection && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Neon Scale</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">
                        ${currentProjection.neon}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pay-as-you-go
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Supabase Pro</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        ${currentProjection.supabasePro}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fixo + overages
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Economia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${currentProjection.neon < currentProjection.supabasePro ? 'text-green-600' : 'text-orange-600'}`}>
                        ${Math.abs(currentProjection.neon - currentProjection.supabasePro).toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentProjection.neon < currentProjection.supabasePro ? 'Economizando com Neon' : 'Economiza com Supabase'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Custos (Últimos 6 Meses)</CardTitle>
              <CardDescription>
                Acompanhe o crescimento dos seus gastos mensais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="compute" stackId="a" fill="#8b5cf6" name="Compute" />
                  <Bar dataKey="storage" stackId="a" fill="#10b981" name="Storage" />
                  <Bar dataKey="branches" stackId="a" fill="#f59e0b" name="Branches" />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Custo Médio</p>
                  <p className="text-2xl font-bold">$4.81</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Crescimento</p>
                  <p className="text-2xl font-bold text-green-600">+83%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Tendência</p>
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    <TrendingUp className="h-5 w-5" />
                    Alta
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparação */}
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Neon Scale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Neon Scale
                  <Badge variant="secondary">Atual</Badge>
                </CardTitle>
                <CardDescription>Pay-as-you-grow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">$5.86</div>
                  <p className="text-sm text-muted-foreground">mês atual</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Autoscaling até 16 CUs
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Scale-to-zero automático
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Até 1000 projetos
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Branching ilimitado
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    SLA 99.95%
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Ver Dashboard Neon
                </Button>
              </CardContent>
            </Card>

            {/* Supabase Pro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Supabase Pro
                  <Badge>Popular</Badge>
                </CardTitle>
                <CardDescription>A partir de</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">$25</div>
                  <p className="text-sm text-muted-foreground">/mês fixo</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    100k MAUs inclusos
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    8 GB storage
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    250 GB egress
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Suporte por email
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Backups 7 dias
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Simular Migração
                </Button>
              </CardContent>
            </Card>

            {/* Supabase Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Supabase Team
                  <Badge variant="outline">Enterprise</Badge>
                </CardTitle>
                <CardDescription>A partir de</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">$599</div>
                  <p className="text-sm text-muted-foreground">/mês</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    SOC2 Compliance
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    HIPAA disponível
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    SSO para dashboard
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Suporte prioritário + SLA
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Backups 14 dias
                  </div>
                </div>
                <Button className="w-full" variant="outline" disabled>
                  Futuramente
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Break-even Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Break-even Point</CardTitle>
              <CardDescription>
                Em qual ponto vale a pena migrar do Neon para Supabase Pro?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Break-even: ~15 clientes</p>
                      <p className="text-sm text-muted-foreground">
                        Neon: $30/mês vs Supabase Pro: $25/mês
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Mantenha Neon se:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Menos de 15 clientes ativos</li>
                      <li>• Uso variável (não constante)</li>
                      <li>• Muitos ambientes de dev/staging</li>
                      <li>• Quer economizar no curto prazo</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Migre para Supabase se:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Mais de 20 clientes confirmados</li>
                      <li>• Precisa de SOC2/HIPAA</li>
                      <li>• Quer suporte prioritário</li>
                      <li>• Tráfego constante e previsível</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
