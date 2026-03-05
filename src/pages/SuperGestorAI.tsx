import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, TrendingUp, AlertTriangle, Zap, Target, Activity, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIInsight {
  id: string;
  type: "optimization" | "prediction" | "alert" | "recommendation";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  action?: string;
  data?: Record<string, unknown>;
}

interface MLModel {
  name: string;
  status: "training" | "ready" | "updating";
  accuracy: number;
  lastTrained: string;
  predictions: number;
}

export default function SuperGestorAI() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  const loadInitialData = useCallback(async () => {
    setModels([
      {
        name: "Previsão de Manutenção",
        status: "ready",
        accuracy: 94.5,
        lastTrained: new Date(Date.now() - 86400000).toISOString(),
        predictions: 1247
      },
      {
        name: "Otimização de Rotas",
        status: "ready",
        accuracy: 89.2,
        lastTrained: new Date(Date.now() - 172800000).toISOString(),
        predictions: 3421
      },
      {
        name: "Análise de Custos",
        status: "training",
        accuracy: 91.8,
        lastTrained: new Date(Date.now() - 259200000).toISOString(),
        predictions: 892
      },
      {
        name: "Detecção de Anomalias",
        status: "ready",
        accuracy: 96.1,
        lastTrained: new Date(Date.now() - 43200000).toISOString(),
        predictions: 2103
      },
      {
        name: "Demanda de Cargas",
        status: "ready",
        accuracy: 87.3,
        lastTrained: new Date(Date.now() - 86400000).toISOString(),
        predictions: 756
      }
    ]);

    // Gerar insights iniciais
    generateInsights();
  }, []);

  const runAutomatedAnalysis = useCallback(async () => {
    toast({
      title: "Análise Automática",
      description: "IA executando varredura completa do sistema..."
    });

    // Simular análise com IA
    setTimeout(() => {
      generateInsights();
      toast({
        title: "Análise Concluída",
        description: "Novos insights e recomendações disponíveis"
      });
    }, 2000);
  }, [toast]);

  useEffect(() => {
    loadInitialData();
    if (autoMode) {
      const interval = setInterval(runAutomatedAnalysis, 300000); // 5 min
      return () => clearInterval(interval);
    }
  }, [autoMode, loadInitialData, runAutomatedAnalysis]);

  const generateInsights = async () => {
    const mockInsights: AIInsight[] = [
      {
        id: "1",
        type: "alert",
        title: "Manutenção Preditiva Crítica",
        description: "Veículo EJG-1234 tem 87% de probabilidade de falha no motor nos próximos 7 dias",
        confidence: 87,
        impact: "high",
        action: "Agendar manutenção preventiva imediatamente",
        data: { vehicle: "EJG-1234", component: "Motor", days: 7 }
      },
      {
        id: "2",
        type: "optimization",
        title: "Otimização de Rota Identificada",
        description: "Rota SP-RJ pode ser 23% mais eficiente com ajuste de horário e trajeto",
        confidence: 92,
        impact: "high",
        action: "Aplicar nova rota sugerida",
        data: { route: "SP-RJ", saving: "23%", fuelSaved: "142L/mês" }
      },
      {
        id: "3",
        type: "prediction",
        title: "Pico de Demanda Previsto",
        description: "Aumento de 34% na demanda de cargas para a região Sul na próxima semana",
        confidence: 78,
        impact: "medium",
        action: "Alocar 3 veículos adicionais para região Sul",
        data: { region: "Sul", increase: "34%", date: "próxima semana" }
      },
      {
        id: "4",
        type: "recommendation",
        title: "Oportunidade de Economia",
        description: "Consolidação de 4 entregas em 2 rotas pode economizar R$ 2.340/mês",
        confidence: 85,
        impact: "medium",
        action: "Reorganizar rotas de distribuição",
        data: { savings: 2340, routes: "4→2" }
      },
      {
        id: "5",
        type: "alert",
        title: "Padrão Anômalo Detectado",
        description: "Consumo de combustível 18% acima da média em 3 veículos",
        confidence: 94,
        impact: "medium",
        action: "Investigar veículos: EJG-1234, ABC-5678, XYZ-9012",
        data: { vehicles: 3, increase: "18%" }
      }
    ];

    setInsights(mockInsights);
  };

  const handleAIQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-analyze", {
        body: {
          query,
          context: "supergestor",
          includeData: true
        }
      });

      if (error) throw error;

      toast({
        title: "Análise Concluída",
        description: data.summary || "IA processou sua solicitação"
      });

      // Adicionar resultado aos insights
      if (data.insights) {
        setInsights(prev => [...data.insights, ...prev].slice(0, 10));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "optimization": return <Zap className="h-4 w-4" />;
      case "prediction": return <TrendingUp className="h-4 w-4" />;
      case "alert": return <AlertTriangle className="h-4 w-4" />;
      case "recommendation": return <Target className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-600" />
              SuperGestor AI
            </h1>
            <p className="text-muted-foreground mt-1">
              Inteligência Artificial e Machine Learning para Gestão Avançada
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoMode ? "default" : "outline"}
              onClick={() => setAutoMode(!autoMode)}
            >
              <Activity className="h-4 w-4 mr-2" />
              {autoMode ? "Modo Auto Ativo" : "Ativar Modo Auto"}
            </Button>
            <Button onClick={runAutomatedAnalysis}>
              <Sparkles className="h-4 w-4 mr-2" />
              Analisar Agora
            </Button>
          </div>
        </div>

        {/* AI Query Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Consultar IA</CardTitle>
            <CardDescription>
              Faça perguntas e receba análises inteligentes sobre sua operação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Qual a melhor rota para SP-RJ? Como otimizar custos? Previsão de demanda..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAIQuery()}
              />
              <Button onClick={handleAIQuery} disabled={loading}>
                {loading ? "Analisando..." : "Consultar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="insights" className="space-y-4">
          <TabsList>
            <TabsTrigger value="insights">Insights IA</TabsTrigger>
            <TabsTrigger value="models">Modelos ML</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getImpactColor(insight.impact)}>
                        {insight.impact.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{insight.confidence}% confiança</Badge>
                    </div>
                  </div>
                  <CardDescription>{insight.description}</CardDescription>
                </CardHeader>
                {insight.action && (
                  <CardContent>
                    <div className="flex items-center justify-between bg-muted p-3 rounded">
                      <span className="text-sm font-medium">✓ {insight.action}</span>
                      <Button size="sm">Aplicar</Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* ML Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {model.name}
                      <Badge variant={model.status === "ready" ? "default" : "secondary"}>
                        {model.status === "ready" ? "Ativo" : "Treinando"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Acurácia:</span>
                      <span className="font-bold text-green-600">{model.accuracy}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Previsões:</span>
                      <span className="font-medium">{model.predictions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Último treino:</span>
                      <span className="text-xs">
                        {new Date(model.lastTrained).toLocaleDateString()}
                      </span>
                    </div>
                    <Button size="sm" className="w-full mt-2" variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Re-treinar Modelo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automações Inteligentes</CardTitle>
                <CardDescription>
                  Configure ações automáticas baseadas em IA e ML
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Manutenção Preditiva</h3>
                  <p className="text-sm text-muted-foreground">
                    Agendar automaticamente manutenções quando IA detectar risco &gt; 80%
                  </p>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Otimização de Rotas</h3>
                  <p className="text-sm text-muted-foreground">
                    Aplicar automaticamente rotas otimizadas pela IA
                  </p>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Alertas Inteligentes</h3>
                  <p className="text-sm text-muted-foreground">
                    Notificar gestores quando IA detectar anomalias ou oportunidades
                  </p>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
