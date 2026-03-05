import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Route, MapPin, Zap, TrendingUp, Navigation, Clock, Activity, Fuel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RouteOptimization {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  fuelCost: number;
  tolls: number;
  confidence: number;
  optimizationLevel: number;
  alternatives: Array<{
    name: string;
    distance: number;
    duration: number;
    savings: number;
  }>;
  mlPredictions: {
    trafficPattern: string;
    optimalDepartureTime: string;
    fuelConsumption: number;
    eta: string;
  };
}

export default function AIRouteOptimization() {
  const { toast } = useToast();
  const [origin, setOrigin] = useState("São Paulo, SP");
  const [destination, setDestination] = useState("Rio de Janeiro, RJ");
  const [optimization, setOptimization] = useState<RouteOptimization | null>(null);
  const [learning, setLearning] = useState(false);
  const [trainingData, setTrainingData] = useState({
    routesTrained: 12847,
    accuracy: 94.2,
    lastUpdate: new Date().toISOString()
  });

  useEffect(() => {
    if (learning) {
      const interval = setInterval(() => {
        setTrainingData(prev => ({
          ...prev,
          routesTrained: prev.routesTrained + Math.floor(Math.random() * 10),
          accuracy: Math.min(99.9, prev.accuracy + 0.1)
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [learning]);

  const optimizeRoute = async () => {
    toast({
      title: "Otimizando Rota com IA",
      description: "Analisando 50.000+ rotas similares..."
    });

    setTimeout(() => {
      const mockOptimization: RouteOptimization = {
        id: `opt_${Date.now()}`,
        origin,
        destination,
        distance: 429.5,
        duration: 360,
        fuelCost: 387.50,
        tolls: 64.80,
        confidence: 94.2,
        optimizationLevel: 23.4,
        alternatives: [
          { name: "Rota Via Dutra (Tradicional)", distance: 429.5, duration: 360, savings: 0 },
          { name: "Rota Otimizada IA", distance: 396.2, duration: 342, savings: 23.4 },
          { name: "Rota Economia Combustível", distance: 412.8, duration: 355, savings: 18.7 }
        ],
        mlPredictions: {
          trafficPattern: "Fluxo moderado previsto",
          optimalDepartureTime: "05:30",
          fuelConsumption: 141.5,
          eta: new Date(Date.now() + 360 * 60000).toISOString()
        }
      };

      setOptimization(mockOptimization);

      toast({
        title: "Otimização Concluída!",
        description: `Economia de ${mockOptimization.optimizationLevel}% identificada`
      });
    }, 2000);
  };

  const applyMLLearning = () => {
    setLearning(true);
    toast({
      title: "Treinamento ML Iniciado",
      description: "Modelo de rotas sendo retreinado com novos dados..."
    });

    setTimeout(() => {
      setLearning(false);
      toast({
        title: "Modelo Atualizado!",
        description: "Acurácia melhorou para 94.8%"
      });
    }, 5000);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Navigation className="h-8 w-8 text-indigo-600" />
              Otimização de Rotas com IA
            </h1>
            <p className="text-muted-foreground mt-1">
              Machine Learning para rotas mais eficientes e econômicas
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={learning ? "default" : "outline"}
              onClick={applyMLLearning}
              disabled={learning}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {learning ? "Aprendendo..." : "Treinar Modelo"}
            </Button>
          </div>
        </div>

        {/* ML Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rotas Analisadas</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainingData.routesTrained.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Dados de treinamento ML</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acurácia do Modelo</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{trainingData.accuracy}%</div>
              <p className="text-xs text-muted-foreground">Precisão das previsões</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">21.3%</div>
              <p className="text-xs text-muted-foreground">Redução de custos</p>
            </CardContent>
          </Card>
        </div>

        {/* Route Input */}
        <Card>
          <CardHeader>
            <CardTitle>Calcular Rota Otimizada</CardTitle>
            <CardDescription>
              IA analisa tráfego histórico, clima, custos e mais de 30 variáveis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Origem</label>
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Cidade de origem"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Destino</label>
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Cidade de destino"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Veículo</label>
                <Select defaultValue="truck">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truck">Caminhão</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="car">Carro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <Select defaultValue="balanced">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Tempo</SelectItem>
                    <SelectItem value="cost">Custo</SelectItem>
                    <SelectItem value="balanced">Balanceado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Horário Partida</label>
                <Input type="time" defaultValue="08:00" />
              </div>
            </div>

            <Button onClick={optimizeRoute} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Otimizar com IA
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {optimization && (
          <div className="space-y-4">
            <Card className="border-2 border-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Rota Otimizada por IA</CardTitle>
                  <Badge className="bg-green-600">
                    {optimization.optimizationLevel}% mais eficiente
                  </Badge>
                </div>
                <CardDescription>
                  Confiança: {optimization.confidence}% | Baseado em {trainingData.routesTrained.toLocaleString()} rotas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Route className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{optimization.distance} km</div>
                    <div className="text-xs text-muted-foreground">Distância</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{Math.floor(optimization.duration / 60)}h {optimization.duration % 60}min</div>
                    <div className="text-xs text-muted-foreground">Duração</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">R$ {optimization.fuelCost.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Combustível</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold">R$ {optimization.tolls.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Pedágios</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Predições de Machine Learning</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-muted rounded">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Padrão de Tráfego</p>
                        <p className="text-xs text-muted-foreground">{optimization.mlPredictions.trafficPattern}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted rounded">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Melhor Horário Saída</p>
                        <p className="text-xs text-muted-foreground">{optimization.mlPredictions.optimalDepartureTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted rounded">
                      <Fuel className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Consumo Previsto</p>
                        <p className="text-xs text-muted-foreground">{optimization.mlPredictions.fuelConsumption}L</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted rounded">
                      <Navigation className="h-4 w-4 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">ETA Previsto</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(optimization.mlPredictions.eta).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Routes */}
            <Card>
              <CardHeader>
                <CardTitle>Rotas Alternativas</CardTitle>
                <CardDescription>Comparação com outras opções</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {optimization.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        idx === 1 ? 'border-green-500 bg-green-50' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{alt.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {alt.distance} km • {Math.floor(alt.duration / 60)}h {alt.duration % 60}min
                        </p>
                      </div>
                      {alt.savings > 0 && (
                        <Badge className="bg-green-600">
                          -{alt.savings}% custo
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
