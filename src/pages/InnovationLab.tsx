import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Brain,
  Rocket,
  TrendingUp,
  Target,
  Zap,
  Award,
  Globe,
  DollarSign,
  Shield,
  MessageSquare,
  Camera,
  BarChart3,
  Leaf,
  Lock,
} from "lucide-react";

const InnovationLab = () => {
  const quickWins = [
    { 
      id: 1, 
      name: "WhatsApp Chatbot", 
      desc: "Assistente IA para motoristas via WhatsApp", 
      impact: "Alta", 
      effort: "Média",
      roi: "30 dias",
      status: "ready",
      icon: MessageSquare
    },
    { 
      id: 2, 
      name: "Telemetria Real-Time", 
      desc: "Dashboard de comportamento de direção ao vivo", 
      impact: "Alta", 
      effort: "Média",
      roi: "45 dias",
      status: "ready",
      icon: TrendingUp
    },
    { 
      id: 3, 
      name: "OCR Documentos", 
      desc: "Extração automática de dados fiscais por foto", 
      impact: "Alta", 
      effort: "Baixa",
      roi: "15 dias",
      status: "ready",
      icon: Camera
    },
    { 
      id: 4, 
      name: "Gamificação Motoristas", 
      desc: "Ranking e badges de performance", 
      impact: "Média", 
      effort: "Baixa",
      roi: "20 dias",
      status: "ready",
      icon: Award
    },
  ];

  const roadmapQ1 = [
    { name: "IA Conversacional", progress: 0, status: "planned", icon: Brain },
    { name: "OCR Fiscal", progress: 0, status: "planned", icon: Camera },
    { name: "Telemática Básica", progress: 0, status: "planned", icon: TrendingUp },
  ];

  const roadmapQ2 = [
    { name: "Marketplace de Fretes", progress: 0, status: "planned", icon: Globe },
    { name: "Roteamento IA", progress: 0, status: "planned", icon: Target },
    { name: "Factoring Integrado", progress: 0, status: "planned", icon: DollarSign },
  ];

  const roadmapQ3 = [
    { name: "ESG & Carbono", progress: 0, status: "planned", icon: Leaf },
    { name: "Analytics Prescritivo", progress: 0, status: "planned", icon: BarChart3 },
    { name: "Integrações API", progress: 0, status: "planned", icon: Zap },
  ];

  const roadmapQ4 = [
    { name: "Blockchain Entregas", progress: 0, status: "planned", icon: Lock },
    { name: "API Pública", progress: 0, status: "planned", icon: Globe },
    { name: "Expansão Internacional", progress: 0, status: "planned", icon: Rocket },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "planned": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "development": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "testing": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Alta": return "text-emerald-500";
      case "Média": return "text-amber-500";
      case "Baixa": return "text-muted-foreground";
      default: return "";
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Innovation Lab</h1>
            </div>
            <p className="text-muted-foreground mt-2">
              Centro de Inovação e Roadmap Estratégico 2025
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Rocket className="w-4 h-4" />
            Ver Roadmap Completo
          </Button>
        </div>

        {/* KPIs de Inovação */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quick Wins Prontos</p>
                  <p className="text-3xl font-bold mt-1">4</p>
                </div>
                <Zap className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ROI Médio</p>
                  <p className="text-3xl font-bold mt-1">27 dias</p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Features Roadmap</p>
                  <p className="text-3xl font-bold mt-1">12</p>
                </div>
                <Target className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progresso Geral</p>
                  <p className="text-3xl font-bold mt-1">8%</p>
                </div>
                <Award className="w-10 h-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="quickwins" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="quickwins">Quick Wins</TabsTrigger>
            <TabsTrigger value="q1">Q1 2025</TabsTrigger>
            <TabsTrigger value="q2">Q2 2025</TabsTrigger>
            <TabsTrigger value="q3">Q3 2025</TabsTrigger>
            <TabsTrigger value="q4">Q4 2025</TabsTrigger>
          </TabsList>

          {/* Quick Wins */}
          <TabsContent value="quickwins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Wins - Implementação Imediata (30 dias)
                </CardTitle>
                <CardDescription>
                  Features de alto impacto com implementação rápida
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickWins.map((win) => {
                  const IconComponent = win.icon;
                  return (
                    <Card key={win.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <IconComponent className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{win.name}</h3>
                                <Badge className={getStatusColor(win.status)}>
                                  Pronto
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{win.desc}</p>
                              <div className="flex gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="text-muted-foreground">Impacto:</span>
                                  <span className={getImpactColor(win.impact)}>{win.impact}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Zap className="w-4 h-4" />
                                  <span className="text-muted-foreground">Esforço:</span>
                                  <span>{win.effort}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="text-muted-foreground">ROI:</span>
                                  <span className="text-emerald-500">{win.roi}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm">
                            <Rocket className="w-4 h-4 mr-2" />
                            Ativar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Q1 */}
          <TabsContent value="q1" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Q1 2025 - Janeiro a Março</CardTitle>
                <CardDescription>Foco em IA e Automação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roadmapQ1.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline">{item.status === "planned" ? "Planejado" : "Em desenvolvimento"}</Badge>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Q2 */}
          <TabsContent value="q2" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Q2 2025 - Abril a Junho</CardTitle>
                <CardDescription>Marketplace e Fintech</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roadmapQ2.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline">Planejado</Badge>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Q3 */}
          <TabsContent value="q3" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Q3 2025 - Julho a Setembro</CardTitle>
                <CardDescription>ESG e Analytics Avançado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roadmapQ3.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline">Planejado</Badge>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Q4 */}
          <TabsContent value="q4" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Q4 2025 - Outubro a Dezembro</CardTitle>
                <CardDescription>Blockchain e Expansão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roadmapQ4.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline">Planejado</Badge>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Pronto para inovar?</h3>
                <p className="text-muted-foreground">
                  Comece ativando os Quick Wins acima e veja resultados em 30 dias
                </p>
              </div>
              <Button size="lg" className="gap-2">
                <Rocket className="w-5 h-5" />
                Ativar Todas as Inovações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default InnovationLab;
