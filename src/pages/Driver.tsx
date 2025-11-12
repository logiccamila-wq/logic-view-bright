import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Navigation, 
  Camera, 
  MessageSquare, 
  Wallet,
  AlertCircle,
  TrendingUp,
  Award,
  Zap
} from "lucide-react";

const Driver = () => {
  const features = [
    {
      icon: Navigation,
      title: "GPS Inteligente Offline",
      description: "Funciona sem internet. Alertas de radares, fiscalização e melhores postos.",
      badge: "Mais popular",
      badgeColor: "bg-orange",
    },
    {
      icon: Camera,
      title: "Check-in Automático por Foto",
      description: "Basta tirar foto da carga/documento. IA valida e registra automaticamente.",
      badge: "IA Powered",
      badgeColor: "bg-purple",
    },
    {
      icon: MessageSquare,
      title: "Chat Direto com Operações",
      description: "Suporte em tempo real. Compartilhe localização, fotos e documentos.",
      badge: "Instantâneo",
      badgeColor: "bg-green",
    },
    {
      icon: Wallet,
      title: "Wallet Digital + Cashback",
      description: "Receba adiantamentos, pague pedágios/abastecimento e ganhe até 5% de volta.",
      badge: "Economia",
      badgeColor: "bg-orange",
    },
    {
      icon: AlertCircle,
      title: "Alertas Proativos",
      description: "Previsão de trânsito, clima, pontos de atenção e sugestões de paradas.",
      badge: "Preditivo",
      badgeColor: "bg-primary",
    },
    {
      icon: Award,
      title: "Gamificação e Recompensas",
      description: "Ganhe pontos por performance: direção segura, entregas no prazo, economia.",
      badge: "Engajamento",
      badgeColor: "bg-purple",
    },
  ];

  const stats = [
    { value: "87%", label: "Adoção Motoristas", color: "bg-purple" },
    { value: "4.8★", label: "Avaliação Play Store", color: "bg-green" },
    { value: "+R$420", label: "Economia Média/Mês", color: "bg-orange" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            📱 Super App Motorista<Badge className="ml-3 bg-purple">PRO</Badge>
          </h1>
          <p className="text-xl text-muted-foreground">
            Tudo que o motorista precisa em um único aplicativo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className={stat.color}>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/90">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/50">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple flex items-center justify-center text-white font-bold">
                    JM
                  </div>
                  <div>
                    <div className="font-semibold">João Motorista</div>
                    <div className="text-sm text-muted-foreground">Placa: ABC-1234</div>
                  </div>
                </div>
              </div>
              
              <Card className="border-green bg-green/10">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-green font-semibold">
                    <Zap className="w-4 h-4" />
                    VIAGEM ATIVA
                  </div>
                  <div className="text-xl font-bold">SP → RJ • 428 km</div>
                  <div className="text-sm text-muted-foreground">
                    ETA: 5h 20min • Chegada: 15:30
                  </div>
                  <Progress value={67} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    287 km concluídos (67%)
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button variant="secondary" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Registrar Ocorrência
                </Button>
                <Button variant="secondary" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat Suporte
                </Button>
              </div>

              <Card className="bg-orange/10 border-orange/20 mt-4">
                <CardContent className="pt-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-orange flex-shrink-0" />
                    <div className="text-sm">
                      <strong className="text-orange">ALERTA</strong>
                      <p className="text-muted-foreground">
                        Trânsito intenso em 15km. Sugestão: parar para descanso obrigatório.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              ✨ Recursos Premium
            </h2>
            
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${feature.badgeColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">{feature.title}</CardTitle>
                          <Badge variant="secondary" className={`${feature.badgeColor} text-white text-xs`}>
                            {feature.badge}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="bg-gradient-to-r from-purple/20 to-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">🎯 Por que os Motoristas Amam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-purple mb-1">3x mais rápido</div>
                <div className="text-sm text-muted-foreground">
                  Check-ins e registros comparado a papel/WhatsApp
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green mb-1">R$ 420/mês</div>
                <div className="text-sm text-muted-foreground">
                  Economia média com cashback e melhores rotas
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange mb-1">87% adoção</div>
                <div className="text-sm text-muted-foreground">
                  Motoristas preferem usar vs. apps tradicionais
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Driver;
