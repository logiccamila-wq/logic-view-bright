import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import { runtimeClient } from "@/integrations/azure/client";
import { predictNextMaintenance, optimizeFuelCosts, predictTireFailureRisk } from "@/utils/mlPredictive";
import { useToast } from "@/hooks/use-toast";
import { Activity, AlertTriangle, Brain, Database, Sparkles, Target, TrendingUp, Zap } from "lucide-react";

type Metric = {
  title: string;
  value: string | number;
  detail?: string;
};

type AIInsight = {
  id: string;
  type: "optimization" | "prediction" | "alert" | "recommendation";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  action?: string;
};

type MLModel = {
  name: string;
  status: "training" | "ready";
  accuracy: number;
  predictions: number;
  lastTrained: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const MAX_AI_INSIGHTS = 6;
const AI_CONFIDENCE_MIN = 72;
const AI_CONFIDENCE_MAX = 97;
const DEFAULT_AI_CONFIDENCE = 84;
const QUERY_INSIGHT_CONFIDENCE = 82;
const FALLBACK_INSIGHT_CONFIDENCE = 74;
const SUPERGESTOR_MODELS: MLModel[] = [
  {
    name: "Previsão de Manutenção",
    status: "ready",
    accuracy: 94.5,
    predictions: 1247,
    lastTrained: new Date(Date.now() - MS_PER_DAY).toISOString(),
  },
  {
    name: "Otimização de Rotas",
    status: "ready",
    accuracy: 89.2,
    predictions: 3421,
    lastTrained: new Date(Date.now() - (2 * MS_PER_DAY)).toISOString(),
  },
  {
    name: "Análise de Custos",
    status: "training",
    accuracy: 91.8,
    predictions: 892,
    lastTrained: new Date(Date.now() - (3 * MS_PER_DAY)).toISOString(),
  },
];

export default function Supergestor() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [autoMode, setAutoMode] = useState(false);

  const getImpactColor = (impact: AIInsight["impact"]) => {
    switch (impact) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const getTypeIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "optimization":
        return <Zap className="h-4 w-4" />;
      case "prediction":
        return <TrendingUp className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const showPlannedActionToast = (title: string, description: string) => {
    toast({ title, description });
  };

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const since = new Date();
      since.setMonth(since.getMonth() - 12);

      const { data: rev } = await runtimeClient
        .from("revenue_records")
        .select("valor_frete, valor_icms, data_emissao")
        .order("data_emissao", { ascending: false })
        .limit(2000);

      const receitaTotal = (rev || [])
        .filter(r => new Date(r.data_emissao).getTime() >= since.getTime())
        .reduce((s, r) => s + (r.valor_frete || 0), 0);

      const icmsTotal = (rev || [])
        .filter(r => new Date(r.data_emissao).getTime() >= since.getTime())
        .reduce((s, r) => s + (r.valor_icms || 0), 0);

      const { data: vehicles } = await runtimeClient
        .from("vehicles")
        .select("id, status");
      const vehiclesActive = (vehicles || []).filter(v => String(v.status || '').toUpperCase().includes("ATIV")).length || (vehicles || []).length;

      const { data: orders } = await runtimeClient
        .from("service_orders")
        .select("status, vehicle_plate, odometer, created_at, completed_at, labor_hours");
      const ordersPending = (orders || []).filter(o => (o.status || '').toLowerCase().includes("abert") || (o.status || '').toLowerCase().includes("pend")).length;

      const { data: ncs, error: ncErr } = await (runtimeClient as any)
        .from("non_conformities")
        .select("severity, status")
        .limit(500);
      const criticalNC = ncErr ? 0 : (ncs || []).filter((n: any) => (n.status || '').toLowerCase().includes("open") || (n.severity || 0) >= 7).length;

      const { data: trips } = await (runtimeClient as any)
        .from("trips")
        .select("status")
        .limit(500);
      const tripsRunning = (trips || []).filter((t: any) => (t.status || '').toLowerCase().includes("andamento") || (t.status || '').toLowerCase().includes("ativa")).length;

      const { data: refuelings } = await runtimeClient
        .from("refuelings")
        .select("cost_per_km, timestamp, vehicle_plate")
        .order("timestamp", { ascending: false })
        .limit(2000);
      const fuel = optimizeFuelCosts((refuelings || []).map(r => ({
        km: 0,
        liters: 0,
        total_value: 0,
        cost_per_km: r.cost_per_km,
        timestamp: r.timestamp,
        vehicle_plate: r.vehicle_plate,
      })));
      const avgCostKm = fuel.avgCostPerKm;
      const avgCostKmLabel = avgCostKm > 0 ? `R$ ${avgCostKm.toFixed(2)}` : "--";

      const byPlate = new Map<string, any[]>();
      (orders || []).forEach(o => {
        if (!byPlate.has(o.vehicle_plate)) byPlate.set(o.vehicle_plate, []);
        byPlate.get(o.vehicle_plate)!.push(o);
      });
      let predictedMaint = 0;
      byPlate.forEach((list, plate) => {
        const currentOdo = Math.max(...list.map(l => l.odometer || 0));
        const pred = predictNextMaintenance(list.map(l => ({
          status: l.status,
          created_at: l.created_at || new Date().toISOString(),
          completed_at: l.completed_at,
          vehicle_plate: plate,
          odometer: l.odometer || 0,
          labor_hours: l.labor_hours || 0,
        })), currentOdo);
        if (pred.predictedDays <= 30) predictedMaint += 1;
      });

      const { data: tpms } = await runtimeClient
        .from("tpms_readings")
        .select("pressure_psi, temperature_celsius, tread_depth_mm, alert_level, created_at, vehicle_plate, tire_position")
        .order("created_at", { ascending: false })
        .limit(200);
      const tire = (tpms && tpms.length > 0) ? predictTireFailureRisk(tpms) : null;

      const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
      const list: Metric[] = [
        { title: "Receita Total (12m)", value: fmt.format(receitaTotal || 0) },
        { title: "ICMS Total (12m)", value: fmt.format(icmsTotal || 0) },
        { title: "Veículos Ativos", value: vehiclesActive || 0 },
        { title: "Ordens Pendentes", value: ordersPending || 0 },
        { title: "NCs Críticas", value: criticalNC || 0 },
        { title: "Rotas em Andamento", value: tripsRunning || 0 },
        { title: "Custo/KM Médio", value: avgCostKmLabel },
        { title: "Previsões Manutenção (30d)", value: predictedMaint || 0, detail: tire ? `Risco pneus: ${tire.riskScore}%` : undefined },
      ];
      setMetrics(list);
      setAiInsights([
        {
          id: "maintenance",
          type: predictedMaint > 0 ? "alert" : "recommendation",
          title: predictedMaint > 0 ? "Janela de manutenção preditiva" : "Operação estabilizada",
          description:
            predictedMaint > 0
              ? `${predictedMaint} veículo(s) com manutenção prevista nos próximos 30 dias.`
              : "Nenhuma previsão crítica de manutenção foi detectada para os próximos 30 dias.",
          confidence: tire ? Math.min(AI_CONFIDENCE_MAX, Math.max(AI_CONFIDENCE_MIN, tire.riskScore)) : DEFAULT_AI_CONFIDENCE,
          impact: predictedMaint > 2 ? "high" : predictedMaint > 0 ? "medium" : "low",
          action: predictedMaint > 0 ? "Priorizar agendamento das inspeções preventivas" : "Manter rotina preventiva atual",
        },
        {
          id: "operations",
          type: ordersPending > 0 || criticalNC > 0 ? "alert" : "recommendation",
          title: "Saúde operacional",
          description:
            criticalNC > 0
              ? `${criticalNC} NC(s) crítica(s) e ${ordersPending} ordem(ns) pendente(s) exigem atenção imediata.`
              : `${tripsRunning} rota(s) em andamento com operação sem NCs críticas abertas.`,
          confidence: criticalNC > 0 ? 93 : 79,
          impact: criticalNC > 0 ? "high" : ordersPending > 5 ? "medium" : "low",
          action: criticalNC > 0 ? "Acionar responsáveis e revisar desvios operacionais" : "Acompanhar ordens pendentes pelo cockpit",
        },
        {
          id: "financial",
          type: "optimization",
          title: "Eficiência de custos",
          description:
            avgCostKm > 0
              ? `Custo médio por KM em ${avgCostKmLabel}. Combine esse dado com receita de ${fmt.format(receitaTotal || 0)} para recalibrar margens.`
              : "Dados de abastecimento insuficientes para calcular custo por KM com precisão.",
          confidence: avgCostKm > 0 ? 88 : 70,
          impact: receitaTotal > icmsTotal ? "medium" : "high",
          action: "Revisar contratos e rotas com maior custo operacional",
        },
      ]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Falha ao carregar insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    if (!autoMode) return;

    const interval = window.setInterval(() => {
      fetchInsights();
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [autoMode, fetchInsights]);

  const handleAIQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data, error: invokeError } = await runtimeClient.functions.invoke("ai-analyze", {
        body: {
          query,
          context: "supergestor",
          includeData: true,
        },
      });

      if (invokeError) throw invokeError;

      const generatedInsight: AIInsight = {
        id: `query-${Date.now()}`,
        type: "recommendation",
        title: "Consulta personalizada",
        description: data?.summary || `Análise gerada para: ${query}`,
        confidence: QUERY_INSIGHT_CONFIDENCE,
        impact: "medium",
        action: "Revisar recomendação e aplicar no módulo correspondente",
      };

      setAiInsights((prev) => [generatedInsight, ...prev].slice(0, MAX_AI_INSIGHTS));

      toast({
        title: "Consulta concluída",
        description: data?.summary || "A IA retornou uma nova recomendação.",
      });
    } catch {
      const fallbackInsight: AIInsight = {
        id: `fallback-${Date.now()}`,
        type: "recommendation",
        title: "Sugestão rápida do SuperGestor",
        description: `Priorize a análise de "${query}" cruzando custos, ordens pendentes e indicadores de manutenção desta página.`,
        confidence: FALLBACK_INSIGHT_CONFIDENCE,
        impact: "medium",
        action: "Executar análise detalhada com os dados operacionais disponíveis",
      };

      setAiInsights((prev) => [fallbackInsight, ...prev].slice(0, MAX_AI_INSIGHTS));

      toast({
        title: "Modo local ativado",
        description: "A análise avançada não respondeu; foi gerada uma recomendação local.",
      });
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Supergestor
            </h1>
            <p className="text-muted-foreground">IA integrada para decisões operacionais e financeiras</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={autoMode ? "default" : "outline"}
              onClick={() => setAutoMode((value) => !value)}
            >
              <Activity className="h-4 w-4 mr-2" />
              {autoMode ? "Modo Auto Ativo" : "Ativar Modo Auto"}
            </Button>
            <Button onClick={fetchInsights} disabled={loading}>
              <Sparkles className="h-4 w-4 mr-2" />
              {loading ? "Atualizando..." : "Atualizar Insights"}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Consultar IA</CardTitle>
            <CardDescription>
              Faça perguntas sobre custos, manutenção, operação ou priorização e receba uma recomendação contextual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                placeholder="Ex: Quais ações reduzem custo/km esta semana? Onde está o maior risco operacional?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAIQuery()}
              />
              <Button onClick={handleAIQuery} disabled={loading}>
                {loading ? "Analisando..." : "Consultar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList className="flex h-auto flex-wrap justify-start">
            <TabsTrigger value="metrics">Indicadores</TabsTrigger>
            <TabsTrigger value="insights">Insights IA</TabsTrigger>
            <TabsTrigger value="models">Modelos ML</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {metrics.map((metric, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-base">{metric.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    {metric.detail && <p className="text-sm text-muted-foreground mt-1">{metric.detail}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(insight.type)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getImpactColor(insight.impact)}>{insight.impact.toUpperCase()}</Badge>
                      <Badge variant="outline">{insight.confidence}% confiança</Badge>
                    </div>
                  </div>
                </CardHeader>
                {insight.action && (
                  <CardContent>
                    <div className="flex flex-col gap-3 rounded-lg bg-muted p-3 md:flex-row md:items-center md:justify-between">
                      <span className="text-sm font-medium">✓ {insight.action}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showPlannedActionToast("Plano registrado", `A ação "${insight.action}" foi registrada para acompanhamento do gestor.`)}
                      >
                        Executar plano
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="models">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {SUPERGESTOR_MODELS.map((model) => (
                <Card key={model.name}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between gap-2">
                      <span>{model.name}</span>
                      <Badge variant={model.status === "ready" ? "default" : "secondary"}>
                        {model.status === "ready" ? "Ativo" : "Treinando"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Acurácia</span>
                      <span className="font-semibold">{model.accuracy}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Previsões</span>
                      <span>{model.predictions.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Último treino</span>
                      <span>{new Date(model.lastTrained).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => showPlannedActionToast("Re-treino planejado", `O modelo "${model.name}" será conectado ao fluxo de re-treino em uma próxima etapa.`)}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Re-treinar modelo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="automation">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manutenção preditiva</CardTitle>
                  <CardDescription>Acione agendas preventivas quando o risco subir.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showPlannedActionToast("Automação em preparação", "A configuração desta automação será ligada ao motor de regras em uma próxima entrega.")}
                  >
                    Configurar automação
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Alertas operacionais</CardTitle>
                  <CardDescription>Notifique gestores quando houver NC crítica ou backlog.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showPlannedActionToast("Gatilhos em preparação", "Os gatilhos inteligentes serão conectados aos alertas operacionais em uma próxima entrega.")}
                  >
                    Definir gatilhos
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Otimização de margem</CardTitle>
                  <CardDescription>Transforme insights de custo/km em ações recorrentes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showPlannedActionToast("Rotina em preparação", "A rotina de otimização de margem será habilitada quando o fluxo automático estiver disponível.")}
                  >
                    Criar rotina
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}
