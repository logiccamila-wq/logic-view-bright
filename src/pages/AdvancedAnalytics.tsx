import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Database, Zap, Download, Filter, Calendar } from "lucide-react";

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [dataSource, setDataSource] = useState("all");

  const metrics = {
    dataPoints: 2847523,
    modelsActive: 8,
    predictionAccuracy: 94.7,
    realtimeStreams: 47
  };

  const insights = [
    {
      category: "Operacional",
      metric: "Eficiência de Entregas",
      value: 94.3,
      trend: "+5.2%",
      prediction: "Tendência de melhoria nos próximos 30 dias"
    },
    {
      category: "Financeiro",
      metric: "Redução de Custos",
      value: 18.7,
      trend: "+12.4%",
      prediction: "Economia adicional de R$ 23K prevista"
    },
    {
      category: "Frota",
      metric: "Disponibilidade",
      value: 92.1,
      trend: "+3.8%",
      prediction: "Manutenção preditiva reduzirá downtime em 15%"
    },
    {
      category: "Sustentabilidade",
      metric: "Redução CO₂",
      value: 23.4,
      trend: "+8.9%",
      prediction: "Meta de -30% será atingida em 45 dias"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-violet-600" />
              Analytics Avançado & Big Data
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise preditiva, inteligência de dados e insights em tempo real
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dataSource} onValueChange={setDataSource}>
            <SelectTrigger className="w-[180px]">
              <Database className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as fontes</SelectItem>
              <SelectItem value="operations">Operações</SelectItem>
              <SelectItem value="finance">Financeiro</SelectItem>
              <SelectItem value="iot">IoT & Telemetria</SelectItem>
              <SelectItem value="external">APIs Externas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos de Dados</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.dataPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Processados este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modelos ML Ativos</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.modelsActive}</div>
              <p className="text-xs text-green-600">+2 novos este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acurácia Predições</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.predictionAccuracy}%</div>
              <p className="text-xs text-muted-foreground">Média dos modelos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streams Tempo Real</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.realtimeStreams}</div>
              <p className="text-xs text-muted-foreground">Fontes ativas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="insights" className="space-y-4">
          <TabsList>
            <TabsTrigger value="insights">Insights Preditivos</TabsTrigger>
            <TabsTrigger value="patterns">Padrões & Anomalias</TabsTrigger>
            <TabsTrigger value="pipelines">Data Pipelines</TabsTrigger>
            <TabsTrigger value="models">Modelos ML</TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Insights Gerados por IA</CardTitle>
                <CardDescription>
                  Análise preditiva baseada em {metrics.dataPoints.toLocaleString()} pontos de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2">{insight.category}</Badge>
                          <h4 className="font-semibold text-lg">{insight.metric}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-600">{insight.value}%</div>
                          <div className="text-sm text-green-600 font-medium">{insight.trend}</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${insight.value}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                        {insight.prediction}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Anomalias Detectadas</CardTitle>
                  <CardDescription>Últimas 24 horas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "Consumo combustível", severity: "high", count: 3 },
                      { type: "Tempo de entrega", severity: "medium", count: 7 },
                      { type: "Custos operacionais", severity: "low", count: 12 }
                    ].map((anomaly, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant={anomaly.severity === "high" ? "destructive" : "outline"}>
                            {anomaly.severity}
                          </Badge>
                          <span className="font-medium">{anomaly.type}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{anomaly.count} casos</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Padrões Identificados</CardTitle>
                  <CardDescription>Machine Learning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { pattern: "Pico de demanda Sextas 14h-16h", confidence: 94 },
                      { pattern: "Rotas mais eficientes manhã", confidence: 89 },
                      { pattern: "Sazonalidade entregas", confidence: 92 }
                    ].map((pattern, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{pattern.pattern}</span>
                          <span className="text-xs text-muted-foreground">{pattern.confidence}% confiança</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full"
                            style={{ width: `${pattern.confidence}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pipelines Tab */}
          <TabsContent value="pipelines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Pipelines Ativos</CardTitle>
                <CardDescription>ETL e processamento em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "IoT → Data Lake", status: "running", throughput: "2.3M/h" },
                    { name: "ERP → Analytics DB", status: "running", throughput: "450K/h" },
                    { name: "APIs Externas → Warehouse", status: "running", throughput: "180K/h" },
                    { name: "ML Training Pipeline", status: "scheduled", throughput: "N/A" }
                  ].map((pipeline, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{pipeline.name}</p>
                        <p className="text-sm text-muted-foreground">Throughput: {pipeline.throughput}</p>
                      </div>
                      <Badge variant={pipeline.status === "running" ? "default" : "secondary"}>
                        {pipeline.status === "running" ? "Ativo" : "Agendado"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ML Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Modelos de Machine Learning</CardTitle>
                <CardDescription>Performance e estatísticas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Previsão Demanda", accuracy: 94.2, status: "production" },
                    { name: "Otimização Rotas", accuracy: 91.8, status: "production" },
                    { name: "Manutenção Preditiva", accuracy: 96.3, status: "production" },
                    { name: "Análise Sentimento", accuracy: 87.5, status: "testing" },
                    { name: "Detecção Fraude", accuracy: 98.1, status: "production" },
                    { name: "Classificação Carga", accuracy: 89.4, status: "production" }
                  ].map((model, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{model.name}</h4>
                        <Badge variant={model.status === "production" ? "default" : "secondary"}>
                          {model.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Acurácia</span>
                          <span className="font-bold text-green-600">{model.accuracy}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${model.accuracy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Real-time Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard em Tempo Real</CardTitle>
            <CardDescription>Atualização a cada 5 segundos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Entregas Ativas", value: "147", color: "text-blue-600" },
                { label: "Veículos em Rota", value: "89", color: "text-green-600" },
                { label: "Alertas Ativos", value: "12", color: "text-yellow-600" },
                { label: "Processando", value: "2.3K/s", color: "text-purple-600" }
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-4 bg-muted rounded-lg">
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
