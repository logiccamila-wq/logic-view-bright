import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, TrendingUp, AlertTriangle, Zap, Target, Activity, Database, Bot, ArrowUpRight, MonitorSmartphone, Video, Rocket, Workflow, Boxes, ShieldCheck, Truck, Wallet, Wrench, Users, FileText, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { modules } from "@/modules/registry";

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

interface LiveMetrics {
  revenue30d: number;
  vehiclesActive: number;
  tripsRunning: number;
  ordersPending: number;
  criticalNC: number;
  avgCostKm: number | null;
  lastUpdated: string;
  source: "live" | "fallback";
}

const initialLiveMetrics: LiveMetrics = {
  revenue30d: 0,
  vehiclesActive: 0,
  tripsRunning: 0,
  ordersPending: 0,
  criticalNC: 0,
  avgCostKm: null,
  lastUpdated: "",
  source: "fallback",
};

const operationalModules = [
  {
    title: "Operação e controles",
    description: "Acesso rápido às rotinas administrativas, parâmetros e visão do mapa do sistema.",
    links: [
      { label: "Admin Dados", href: "/admin" },
      { label: "Configurações", href: "/settings" },
      { label: "Mapa do Sistema", href: "/sitemap" },
    ],
  },
  {
    title: "IA e comando",
    description: "O SuperGestor assume o papel de orquestrador dos módulos, diagnósticos e automações inteligentes.",
    links: [
      { label: "SuperGestor Operacional", href: "/supergestor" },
      { label: "Painel do Desenvolvedor", href: "/developer" },
      { label: "Control Tower", href: "/control-tower" },
    ],
  },
  {
    title: "Runtime Azure e entrega",
    description: "Atalhos para validar saúde da API e acompanhar a esteira principal de deploy.",
    links: [
      { label: "Health Check Azure", href: "/api/runtime/health", external: true },
      { label: "GitHub Actions", href: "https://github.com/logiccamila-wq/logic-view-bright/actions", external: true },
      { label: "Workflow Azure SWA", href: "https://github.com/logiccamila-wq/logic-view-bright/blob/main/.github/workflows/azure-static-web-apps.yml", external: true },
    ],
  },
] as const;

const avatarRoadmap = [
  {
    title: "Avatar virtual do SuperGestor",
    description: "Camada conversacional com presença visual para atendimento executivo, operações e suporte aos módulos.",
    icon: Bot,
  },
  {
    title: "Participação em reuniões",
    description: "Integração futura com vídeo, transcrição, resumos e tomada de decisão assistida pela IA interna.",
    icon: Video,
  },
  {
    title: "Sala virtual de personagens",
    description: "Ambiente com agentes especializados por área: financeiro, manutenção, logística, compliance e inovação.",
    icon: MonitorSmartphone,
  },
  {
    title: "Kits e automações por módulo",
    description: "Biblioteca reutilizável de prompts, playbooks, conectores e experiências assistidas pelo SuperGestor.",
    icon: Boxes,
  },
] as const;

const azureStarterStack = [
  "Azure OpenAI para o núcleo conversacional e copilotos internos.",
  "Azure Static Web Apps + Functions para operar com custo enxuto e escalar por demanda.",
  "Azure AI Speech/Avatar como trilha de evolução para voz, presença virtual e reuniões.",
  "GitHub + Student/planos gratuitos para acelerar prototipação, CI/CD e experimentação inicial.",
] as const;

const specialtyActions = [
  {
    title: "Operações",
    description: "Centraliza torre de controle, viagens, roteirização e ações imediatas por SLA operacional.",
    icon: Truck,
    actions: ["Priorizar viagens em andamento", "Reduzir gargalos de roteirização", "Disparar plano de contingência"],
    route: "/control-tower",
  },
  {
    title: "Financeiro IA/ML",
    description: "Traz para o SuperGestor as frentes de margem, custo/km, tributário e consultoria financeira inteligente.",
    icon: Wallet,
    actions: ["Abrir consultoria financeira IA", "Comparar cenários tributários", "Ativar plano de economia"],
    route: "/consultoria-financeira-ia",
  },
  {
    title: "Manutenção & Compliance",
    description: "Combina manutenção preditiva, auditoria, NCs críticas e priorização por risco operacional.",
    icon: Wrench,
    actions: ["Escalar veículos com risco alto", "Priorizar ordens pendentes", "Revisar não conformidades"],
    route: "/predictive-maintenance",
  },
  {
    title: "Inovação & IA Interna",
    description: "Concentra avatar virtual, copilotos especializados, analytics avançado e evolução de produto premium.",
    icon: Brain,
    actions: ["Abrir analytics avançado", "Planejar modo reunião", "Publicar kit premium por módulo"],
    route: "/advanced-analytics",
  },
] as const;

const premiumKitSlugs = [
  "supergestor-ai",
  "supergestor",
  "consultoria-financeira-ia",
  "analise-tributaria",
  "cost-monitoring",
  "predictive-maintenance",
  "advanced-analytics",
  "ai-route-optimization",
  "reports",
  "developer",
] as const;

const premiumModuleKits = modules
  .filter((module) => premiumKitSlugs.includes(module.slug as typeof premiumKitSlugs[number]))
  .map((module) => ({
    ...module,
    kitLabel:
      module.category === "finance"
        ? "kit financeiro IA/ML"
        : module.category === "maintenance"
          ? "kit risco e manutenção"
          : module.category === "dev"
            ? "kit observabilidade"
            : "kit comando premium",
  }));

export default function SuperGestorAI() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [models, setModels] = useState<MLModel[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>(initialLiveMetrics);
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState("");

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

  const fetchLiveMetrics = useCallback(async () => {
    setLiveLoading(true);
    setLiveError("");

    const [revenueResult, vehiclesResult, ordersResult, tripsResult, nonConformitiesResult, refuelingsResult] =
      await Promise.allSettled([
        supabase
          .from("revenue_records")
          .select("valor_frete, data_emissao")
          .order("data_emissao", { ascending: false })
          .limit(500),
        supabase.from("vehicles").select("id, status"),
        supabase.from("service_orders").select("status"),
        (supabase as any).from("trips").select("status").limit(500),
        (supabase as any).from("non_conformities").select("severity, status").limit(500),
        supabase
          .from("refuelings")
          .select("cost_per_km, timestamp")
          .order("timestamp", { ascending: false })
          .limit(500),
      ]);

    const revenueRows =
      revenueResult.status === "fulfilled" && !revenueResult.value.error ? revenueResult.value.data || [] : [];
    const vehicleRows =
      vehiclesResult.status === "fulfilled" && !vehiclesResult.value.error ? vehiclesResult.value.data || [] : [];
    const orderRows =
      ordersResult.status === "fulfilled" && !ordersResult.value.error ? ordersResult.value.data || [] : [];
    const tripRows =
      tripsResult.status === "fulfilled" && !tripsResult.value.error ? tripsResult.value.data || [] : [];
    const ncRows =
      nonConformitiesResult.status === "fulfilled" && !nonConformitiesResult.value.error
        ? nonConformitiesResult.value.data || []
        : [];
    const refuelingRows =
      refuelingsResult.status === "fulfilled" && !refuelingsResult.value.error ? refuelingsResult.value.data || [] : [];

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const revenue30d = revenueRows
      .filter((row: any) => new Date(row.data_emissao).getTime() >= since.getTime())
      .reduce((sum: number, row: any) => sum + (row.valor_frete || 0), 0);

    const vehiclesActive =
      vehicleRows.filter((vehicle: any) => String(vehicle.status || "").toUpperCase().includes("ATIV")).length ||
      vehicleRows.length;
    const ordersPending = orderRows.filter((order: any) =>
      (order.status || "").toLowerCase().match(/abert|pend/)
    ).length;
    const tripsRunning = tripRows.filter((trip: any) =>
      (trip.status || "").toLowerCase().match(/andamento|ativa|em andamento/)
    ).length;
    const criticalNC = ncRows.filter((nc: any) =>
      (nc.status || "").toLowerCase().includes("open") || (nc.severity || 0) >= 7
    ).length;
    const averageCostKm =
      refuelingRows.length > 0
        ? refuelingRows.reduce((sum: number, row: any) => sum + Number(row.cost_per_km || 0), 0) / refuelingRows.length
        : null;

    const fulfilledCount = [
      revenueResult,
      vehiclesResult,
      ordersResult,
      tripsResult,
      nonConformitiesResult,
      refuelingsResult,
    ].filter((result) => result.status === "fulfilled").length;

    if (fulfilledCount === 0) {
      setLiveError("Runtime indisponível no momento. Exibindo a estrutura premium pronta para operar.");
      setLiveMetrics((current) => ({
        ...current,
        lastUpdated: new Date().toISOString(),
        source: "fallback",
      }));
      setLiveLoading(false);
      return;
    }

    setLiveMetrics({
      revenue30d,
      vehiclesActive,
      tripsRunning,
      ordersPending,
      criticalNC,
      avgCostKm: averageCostKm,
      lastUpdated: new Date().toISOString(),
      source: fulfilledCount === 6 ? "live" : "fallback",
    });
    setLiveLoading(false);
  }, []);

  const runAutomatedAnalysis = useCallback(async () => {
    toast({
      title: "Análise Automática",
      description: "IA executando varredura completa do sistema..."
    });

    // Simular análise com IA
    setTimeout(() => {
      generateInsights();
      fetchLiveMetrics();
      toast({
        title: "Análise Concluída",
        description: "Novos insights e recomendações disponíveis"
      });
    }, 2000);
  }, [fetchLiveMetrics, toast]);

  useEffect(() => {
    loadInitialData();
    fetchLiveMetrics();
  }, [fetchLiveMetrics, loadInitialData]);

  useEffect(() => {
    const interval = setInterval(fetchLiveMetrics, autoMode ? 60000 : 180000);
    return () => clearInterval(interval);
  }, [autoMode, fetchLiveMetrics]);

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

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  const liveKpiCards = [
    {
      title: "Receita 30d",
      value: currencyFormatter.format(liveMetrics.revenue30d),
      icon: Wallet,
      trend: {
        value: liveMetrics.source === "live" ? "snapshot do runtime Azure" : "snapshot parcial / fallback elegante",
        positive: true,
      },
    },
    {
      title: "Viagens em Andamento",
      value: liveMetrics.tripsRunning,
      icon: Truck,
      trend: {
        value: liveMetrics.tripsRunning > 0 ? "operação viva sob monitoramento" : "sem viagens críticas agora",
        positive: true,
      },
    },
    {
      title: "Veículos Ativos",
      value: liveMetrics.vehiclesActive,
      icon: Activity,
      trend: {
        value: "base pronta para despacho",
        positive: true,
      },
    },
    {
      title: "Ordens Pendentes",
      value: liveMetrics.ordersPending,
      icon: Wrench,
      trend: {
        value: "quanto menor, melhor",
        positive: liveMetrics.ordersPending <= 5,
      },
    },
    {
      title: "NCs Críticas",
      value: liveMetrics.criticalNC,
      icon: AlertTriangle,
      trend: {
        value: "compliance e risco operacional",
        positive: liveMetrics.criticalNC === 0,
      },
    },
    {
      title: "Custo/KM Médio",
      value: liveMetrics.avgCostKm !== null ? `R$ ${liveMetrics.avgCostKm.toFixed(2)}` : "--",
      icon: TrendingUp,
      trend: {
        value: "referência financeira integrada",
        positive: true,
      },
    },
  ];

  const meetingSummary = [
    `Operação em foco com ${liveMetrics.tripsRunning} viagens em andamento e ${liveMetrics.vehiclesActive} veículos ativos disponíveis para reação rápida.`,
    `A frente financeira premium está consolidada no SuperGestor com receita estimada de ${currencyFormatter.format(liveMetrics.revenue30d)} nos últimos 30 dias.`,
    `Manutenção e compliance exigem atenção em ${liveMetrics.ordersPending} ordens pendentes e ${liveMetrics.criticalNC} não conformidades críticas.`,
    "A recomendação executiva é concentrar inovação, IA/ML e kits avançados dentro do SuperGestor, preservando os demais módulos como camadas operacionais e normativas.",
  ];

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
          <div className="flex flex-wrap gap-2">
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
            <Button asChild variant="modern">
              <Link to="/supergestor">
                <Rocket className="h-4 w-4 mr-2" />
                Abrir Centro Operacional
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Dashboard premium com KPIs operacionais em tempo quase real
                </CardTitle>
                <CardDescription className="mt-2">
                  O SuperGestor passa a receber os sinais críticos da operação, financeiro, manutenção e inovação em uma única camada executiva.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={liveMetrics.source === "live" ? "default" : "secondary"}>
                  {liveMetrics.source === "live" ? "dados vivos do runtime" : "fallback operacional"}
                </Badge>
                <Badge variant="outline">
                  {liveMetrics.lastUpdated
                    ? `atualizado às ${new Date(liveMetrics.lastUpdated).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "aguardando leitura"}
                </Badge>
                <Button variant="outline" size="sm" onClick={fetchLiveMetrics} disabled={liveLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${liveLoading ? "animate-spin" : ""}`} />
                  Atualizar KPIs
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveError && (
              <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                {liveError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {liveKpiCards.map((kpi) => (
                <StatCard
                  key={kpi.title}
                  title={kpi.title}
                  value={kpi.value}
                  icon={kpi.icon}
                  trend={kpi.trend}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 via-background to-fuchsia-50">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  SuperGestor como IA central da empresa
                </CardTitle>
                <CardDescription className="mt-2 max-w-3xl">
                  Este módulo passa a concentrar a visão operacional, estratégica e de inovação: orquestra módulos,
                  conecta o runtime Azure, prepara a evolução para avatar virtual e cria uma camada única de IA interna
                  de alto valor para logística, manutenção, financeiro, compliance e reuniões executivas.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-purple-300 text-purple-700">
                módulo premium de inovação
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {operationalModules.map((group) => (
              <Card key={group.title} className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">{group.title}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.links.map((link) => (
                    <Button
                      key={link.label}
                      asChild
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {link.external ? (
                        <a href={link.href} target="_blank" rel="noreferrer">
                          {link.label}
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link to={link.href}>
                          {link.label}
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      )}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-purple-600" />
                Roadmap operacional do SuperGestor
              </CardTitle>
              <CardDescription>
                Próximas capacidades para transformar o módulo no principal cérebro operacional e de especialidades da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avatarRoadmap.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <Icon className="h-4 w-4 text-purple-600" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Stack Azure de baixo custo
              </CardTitle>
              <CardDescription>
                Direção recomendada para prototipar e crescer usando o que Azure + Student + oferta gratuita costumam viabilizar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {azureStarterStack.map((item) => (
                <div key={item} className="rounded-lg border p-3 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Ações por especialidade dentro do SuperGestor
            </CardTitle>
            <CardDescription>
              Toda frente premium de IA, ML e inovação passa a ser coordenada aqui, enquanto o restante do sistema segue normativo e operacional.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {specialtyActions.map((specialty) => {
              const Icon = specialty.icon;

              return (
                <Card key={specialty.title} className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {specialty.title}
                    </CardTitle>
                    <CardDescription>{specialty.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {specialty.actions.map((action) => (
                        <li key={action}>• {action}</li>
                      ))}
                    </ul>
                    <Button asChild className="w-full" variant="outline">
                      <Link to={specialty.route}>Abrir frente</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

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
          <TabsList
            className="flex h-auto flex-wrap gap-2"
            aria-label="Navegação das áreas operacionais e analíticas do SuperGestor AI"
          >
            <TabsTrigger value="insights">Insights IA</TabsTrigger>
            <TabsTrigger value="models">Modelos ML</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
            <TabsTrigger value="operations">Operação</TabsTrigger>
            <TabsTrigger value="meeting">Modo Reunião</TabsTrigger>
            <TabsTrigger value="kits">Kits por módulo</TabsTrigger>
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

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Orquestração operacional e especialidades</CardTitle>
                <CardDescription>
                  O SuperGestor evolui para coordenar módulos, ritos operacionais e especialidades internas em uma só camada de IA.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold">Especialidades que convergem para o SuperGestor</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Logística, TMS, Control Tower e roteirização com tomada de decisão assistida.</li>
                    <li>• Financeiro, DRE, payroll e aprovações com copiloto analítico e alertas.</li>
                    <li>• Manutenção, compliance, ESG e auditorias com visão consolidada de risco.</li>
                    <li>• Developer, CI/CD e runtime Azure como base para observabilidade e automação.</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold">Próximos conectores operacionais</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Resumo executivo automático antes de reuniões e handoffs.</li>
                    <li>• Presença virtual com voz/avatar para acompanhamento e demonstrações.</li>
                    <li>• Kits por módulo com prompts, checklists e ações sugeridas pela IA.</li>
                    <li>• Acesso rápido a runtime health, workflows e módulos críticos do negócio.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meeting" className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      Modo reunião
                    </CardTitle>
                    <CardDescription>
                      Resumo executivo pronto para abertura de reunião, handoff entre áreas e participação futura do avatar do SuperGestor.
                    </CardDescription>
                  </div>
                  <Button
                    variant="modern"
                    onClick={() =>
                      toast({
                        title: "Resumo executivo pronto",
                        description: "O SuperGestor já organizou os principais pontos para a reunião executiva.",
                      })
                    }
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar resumo executivo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold">Resumo para abrir a reunião</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {meetingSummary.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold">Roteiro sugerido</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 1. Situação operacional e rotas críticas</li>
                    <li>• 2. Receita, custo/km e eficiência financeira</li>
                    <li>• 3. Manutenção, compliance e riscos prioritários</li>
                    <li>• 4. Inovações premium que devem ficar dentro do SuperGestor</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-primary" />
                  Biblioteca premium de kits por módulo
                </CardTitle>
                <CardDescription>
                  A inteligência aplicada fica centralizada no SuperGestor e distribuída como kits reutilizáveis para cada frente crítica do negócio.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {premiumModuleKits.map((kit) => (
                  <Card key={kit.slug} className="border-dashed">
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{kit.name}</CardTitle>
                          <CardDescription>{kit.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{kit.kitLabel}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Categoria origem: <span className="font-medium text-foreground">{kit.category || "geral"}</span>
                      </div>
                      <Button asChild variant="outline" className="w-full justify-between">
                        <Link to={kit.route || "/supergestor-ai"}>
                          Abrir kit no SuperGestor
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
