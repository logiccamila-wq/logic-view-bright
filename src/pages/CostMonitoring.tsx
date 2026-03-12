import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Database,
  HardDrive,
  Network,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// Projeções baseadas em número de clientes (Azure)
const projectionsData = [
  { clients: 1, azure: 12.99, label: "Burstable B1ms" },
  { clients: 5, azure: 15.50, label: "Burstable B1ms" },
  { clients: 10, azure: 22.00, label: "Burstable B2s" },
  { clients: 20, azure: 35.00, label: "Burstable B2s" },
  { clients: 50, azure: 58.00, label: "General Purpose D2s" },
  { clients: 100, azure: 85.00, label: "General Purpose D2s" },
  { clients: 500, azure: 180.00, label: "General Purpose D4s" },
  { clients: 1000, azure: 320.00, label: "General Purpose D8s" },
];

// Histórico mensal (estimado)
const monthlyHistory = [
  { month: "Out", cost: 14.20, compute: 9.0, storage: 3.2, functions: 2.0 },
  { month: "Nov", cost: 15.80, compute: 10.0, storage: 3.5, functions: 2.3 },
  { month: "Dez", cost: 16.50, compute: 10.5, storage: 3.8, functions: 2.2 },
  { month: "Jan", cost: 17.30, compute: 11.0, storage: 4.0, functions: 2.3 },
  { month: "Fev", cost: 18.10, compute: 11.5, storage: 4.2, functions: 2.4 },
  { month: "Mar", cost: 19.00, compute: 12.0, storage: 4.5, functions: 2.5 },
];

export default function CostMonitoring() {
  const [selectedClients, setSelectedClients] = useState(10);

  const currentProjection = projectionsData.find((p) => p.clients === selectedClients);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Monitoramento de Custos</h1>
        <p className="text-muted-foreground">
          Acompanhe gastos de infraestrutura Azure com foco em qualidade, rapidez e economia
        </p>
      </div>

      {/* Status Azure */}
      <Card className="border-green-500 bg-green-50 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-green-900 dark:text-green-100 mb-2">
                Infraestrutura 100% Azure
              </h3>
              <p className="text-green-800 dark:text-green-200 text-sm">
                Azure App Service + Runtime API Node.js + Azure Database for PostgreSQL
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Domínio: www.xyzlogicflow.com.br
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Atuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Estimado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentProjection?.azure?.toFixed(2) || "19.00"}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              Azure mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PostgreSQL</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.99</div>
            <p className="text-xs text-muted-foreground">Flexible Server Burstable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">App Service</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$6.00</div>
            <p className="text-xs text-muted-foreground">Linux B1 compartilhado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runtime API</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Incluso</div>
            <p className="text-xs text-muted-foreground">Hospedado no mesmo App Service</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projections">Projeções de Crescimento</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="services">Serviços Azure</TabsTrigger>
        </TabsList>

        {/* Projeções */}
        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Custos Azure por Número de Clientes</CardTitle>
              <CardDescription>
                Veja quanto custará sua infraestrutura conforme sua startup cresce
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={projectionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="clients" label={{ value: "Clientes", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Custo Mensal (USD)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="azure" stroke="#0078D4" fill="#0078D4" name="Azure" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>

              {currentProjection && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Custo Azure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">${currentProjection.azure}</div>
                      <p className="text-xs text-muted-foreground mt-1">/mês estimado</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Tier Recomendado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-blue-600">{currentProjection.label}</div>
                      <p className="text-xs text-muted-foreground mt-1">PostgreSQL Flexible Server</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Custo por Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        ${(currentProjection.azure / currentProjection.clients).toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">por cliente/mês</p>
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
              <CardDescription>Acompanhe o crescimento dos seus gastos mensais</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="compute" stackId="a" fill="#0078D4" name="PostgreSQL" />
                  <Bar dataKey="storage" stackId="a" fill="#10b981" name="Storage" />
                  <Bar dataKey="functions" stackId="a" fill="#f59e0b" name="Runtime API" />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Custo Médio</p>
                  <p className="text-2xl font-bold">$16.82</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Crescimento</p>
                  <p className="text-2xl font-bold text-green-600">+34%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Tendência</p>
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    <TrendingUp className="h-5 w-5" />
                    Estável
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Serviços Azure */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Azure App Service
                  <Badge variant="secondary">Ativo</Badge>
                </CardTitle>
                <CardDescription>Frontend + runtime Node.js unificados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">$6.00</div>
                  <p className="text-sm text-muted-foreground">/mês (Linux B1)</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Deploy único do frontend e backend
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    SSL/TLS incluído
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Custom domain
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    CI/CD via GitHub Actions
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  PostgreSQL Flexible
                  <Badge>Principal</Badge>
                </CardTitle>
                <CardDescription>Banco de dados gerenciado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">$12.99</div>
                  <p className="text-sm text-muted-foreground">/mês (Burstable B1ms)</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    High availability
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Backups automáticos
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Escalável sob demanda
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    SLA 99.99%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Runtime API Node.js
                  <Badge variant="secondary">Ativo</Badge>
                </CardTitle>
                <CardDescription>API compartilhada no App Service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">Incluso</div>
                  <p className="text-sm text-muted-foreground">Sem custo separado de hospedagem</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Endpoints centralizados em /api/runtime/*
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    JWT e roles validados no backend
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Pool PostgreSQL reutilizado
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Escala junto com o App Service
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
