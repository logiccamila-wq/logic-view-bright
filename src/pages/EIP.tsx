import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Server, MessageSquare, Shield, PlugZap, Network } from "lucide-react";

const EIP = () => {
  const connectors = [
    { name: "WhatsApp Bot", type: "Edge Function", status: "ativo" },
    { name: "OpenRouteService", type: "API Externa", status: "ativo" },
    { name: "TomTom Routing", type: "SDK/API", status: "ativo" },
    { name: "OCR Documentos", type: "Edge Function", status: "planejado" },
    { name: "Webhooks TMS", type: "Webhook", status: "ativo" },
  ];

  const patterns = [
    { name: "Message Router", desc: "Roteamento baseado em tipo de evento", icon: GitBranch },
    { name: "Content Enricher", desc: "Enriquece eventos com dados internos", icon: PlugZap },
    { name: "Event Aggregator", desc: "Agrega eventos para decisões", icon: Network },
    { name: "Circuit Breaker", desc: "Resiliência a falhas externas", icon: Shield },
  ];

  const getStatusBadge = (status: string) => (
    <Badge className={status === 'ativo' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-blue-500/20 text-blue-600'}>
      {status.toUpperCase()}
    </Badge>
  );

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">EIP - Enterprise Integration Patterns</h1>
          </div>
          <Badge variant="outline" className="gap-1">
            <Server className="w-4 h-4" />
            Event Bus
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="connectors">Conectores</TabsTrigger>
            <TabsTrigger value="patterns">Padrões</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Fluxos e Eventos
                </CardTitle>
                <CardDescription>Orquestração de integrações entre módulos (WMS, TMS, OMS, SCM, CRM, ERP)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-sm">TMS → ERP</CardTitle>
                      <CardDescription>Faturamento e custos por viagem</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-sm">WMS → TMS</CardTitle>
                      <CardDescription>Disponibilidade de itens e expedição</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-sm">CRM → OMS</CardTitle>
                      <CardDescription>Pedidos, clientes e SLA</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conectores</CardTitle>
                <CardDescription>Serviços externos e funções internas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connectors.map((c) => (
                    <Card key={c.name}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-sm">
                          {c.name}
                          {getStatusBadge(c.status)}
                        </CardTitle>
                        <CardDescription>{c.type}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Padrões de Integração</CardTitle>
                <CardDescription>Aplicação de EIP para resiliência e escalabilidade</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patterns.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Card key={p.name}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Icon className="w-4 h-4" />
                          {p.name}
                        </CardTitle>
                        <CardDescription>{p.desc}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default EIP;
