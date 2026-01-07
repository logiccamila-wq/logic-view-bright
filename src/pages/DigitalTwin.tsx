import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Activity, Zap, Thermometer, Gauge, Fuel, AlertCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VehicleTwin {
  id: string;
  plate: string;
  model: string;
  status: "operational" | "warning" | "critical";
  location: { lat: number; lng: number; address: string };
  telemetry: {
    speed: number;
    rpm: number;
    fuel: number;
    temperature: number;
    battery: number;
    odometer: number;
    pressure: { fl: number; fr: number; rl: number; rr: number };
  };
  health: {
    engine: number;
    transmission: number;
    brakes: number;
    suspension: number;
    electrical: number;
  };
  alerts: Array<{ type: string; message: string; severity: string }>;
  predictions: Array<{ component: string; remainingLife: number; nextMaintenance: string }>;
}

export default function DigitalTwin() {
  const { toast } = useToast();
  const [_selectedVehicle, _setSelectedVehicle] = useState<string>("EJG-1234");
  const [twinData, setTwinData] = useState<VehicleTwin>({
    id: "1",
    plate: "EJG-1234",
    model: "Mercedes-Benz Actros 2651",
    status: "warning",
    location: {
      lat: -23.5505,
      lng: -46.6333,
      address: "Rod. Presidente Dutra, km 215, São Paulo - SP"
    },
    telemetry: {
      speed: 85,
      rpm: 1850,
      fuel: 68,
      temperature: 89,
      battery: 12.6,
      odometer: 145678,
      pressure: { fl: 115, fr: 118, rl: 120, rr: 117 }
    },
    health: {
      engine: 87,
      transmission: 92,
      brakes: 78,
      suspension: 85,
      electrical: 94
    },
    alerts: [
      { type: "warning", message: "Pastilha de freio com 22% de desgaste", severity: "medium" },
      { type: "info", message: "Próxima troca de óleo em 3.200 km", severity: "low" }
    ],
    predictions: [
      { component: "Pastilhas de Freio", remainingLife: 22, nextMaintenance: "15 dias" },
      { component: "Filtro de Ar", remainingLife: 67, nextMaintenance: "45 dias" },
      { component: "Correias", remainingLife: 89, nextMaintenance: "120 dias" }
    ]
  });

  const [realTimeMode, setRealTimeMode] = useState(true);

  useEffect(() => {
    if (realTimeMode) {
      const interval = setInterval(() => {
        simulateRealTimeUpdate();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [realTimeMode]);

  const simulateRealTimeUpdate = () => {
    setTwinData(prev => ({
      ...prev,
      telemetry: {
        ...prev.telemetry,
        speed: Math.max(0, prev.telemetry.speed + (Math.random() - 0.5) * 10),
        rpm: Math.max(800, prev.telemetry.rpm + (Math.random() - 0.5) * 200),
        temperature: Math.max(70, Math.min(95, prev.telemetry.temperature + (Math.random() - 0.5) * 5))
      }
    }));
  };

  const runDiagnostic = () => {
    toast({
      title: "Diagnóstico Iniciado",
      description: "Analisando 2.000+ parâmetros do veículo..."
    });

    setTimeout(() => {
      toast({
        title: "Diagnóstico Concluído",
        description: "Nenhum problema crítico detectado. 2 avisos encontrados."
      });
    }, 2000);
  };

  const getHealthColor = (value: number) => {
    if (value >= 90) return "text-green-600";
    if (value >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational": return <Badge className="bg-green-600">Operacional</Badge>;
      case "warning": return <Badge className="bg-yellow-600">Atenção</Badge>;
      case "critical": return <Badge variant="destructive">Crítico</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Box className="h-8 w-8 text-cyan-600" />
              Digital Twin - Gêmeo Digital da Frota
            </h1>
            <p className="text-muted-foreground mt-1">
              Representação virtual em tempo real de cada veículo
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={realTimeMode ? "default" : "outline"}
              onClick={() => setRealTimeMode(!realTimeMode)}
            >
              <Activity className="h-4 w-4 mr-2" />
              {realTimeMode ? "Tempo Real Ativo" : "Ativar Tempo Real"}
            </Button>
            <Button onClick={runDiagnostic}>
              <Zap className="h-4 w-4 mr-2" />
              Diagnóstico Completo
            </Button>
          </div>
        </div>

        {/* Vehicle Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{twinData.plate}</CardTitle>
                <CardDescription>{twinData.model}</CardDescription>
              </div>
              {getStatusBadge(twinData.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Gauge className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{Math.round(twinData.telemetry.speed)} km/h</div>
                <div className="text-xs text-muted-foreground">Velocidade</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{Math.round(twinData.telemetry.rpm)} RPM</div>
                <div className="text-xs text-muted-foreground">Rotação</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Fuel className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{twinData.telemetry.fuel}%</div>
                <div className="text-xs text-muted-foreground">Combustível</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{Math.round(twinData.telemetry.temperature)}°C</div>
                <div className="text-xs text-muted-foreground">Temperatura</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="health" className="space-y-4">
          <TabsList>
            <TabsTrigger value="health">Saúde do Veículo</TabsTrigger>
            <TabsTrigger value="telemetry">Telemetria</TabsTrigger>
            <TabsTrigger value="predictions">Predições</TabsTrigger>
            <TabsTrigger value="3d">Visualização 3D</TabsTrigger>
          </TabsList>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Componentes</CardTitle>
                <CardDescription>Saúde em tempo real de cada sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(twinData.health).map(([component, health]) => (
                  <div key={component} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="capitalize font-medium">{component}</span>
                      <span className={`font-bold ${getHealthColor(health)}`}>{health}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          health >= 90 ? 'bg-green-600' : health >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${health}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {twinData.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Alertas Ativos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {twinData.alerts.map((alert, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground capitalize">{alert.severity}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Telemetry Tab */}
          <TabsContent value="telemetry" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parâmetros do Motor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RPM:</span>
                    <span className="font-bold">{Math.round(twinData.telemetry.rpm)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperatura:</span>
                    <span className="font-bold">{Math.round(twinData.telemetry.temperature)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bateria:</span>
                    <span className="font-bold">{twinData.telemetry.battery}V</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pressão dos Pneus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Diant. Esq.</div>
                      <div className="text-xl font-bold">{twinData.telemetry.pressure.fl} PSI</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Diant. Dir.</div>
                      <div className="text-xl font-bold">{twinData.telemetry.pressure.fr} PSI</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Tras. Esq.</div>
                      <div className="text-xl font-bold">{twinData.telemetry.pressure.rl} PSI</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Tras. Dir.</div>
                      <div className="text-xl font-bold">{twinData.telemetry.pressure.rr} PSI</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consumo e Eficiência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Combustível:</span>
                    <span className="font-bold">{twinData.telemetry.fuel}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Média km/L:</span>
                    <span className="font-bold">2.8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Odômetro:</span>
                    <span className="font-bold">{twinData.telemetry.odometer.toLocaleString()} km</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Localização</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{twinData.location.address}</p>
                  <div className="text-xs text-muted-foreground">
                    <div>Lat: {twinData.location.lat}</div>
                    <div>Lng: {twinData.location.lng}</div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Ver no Mapa
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Predições de Manutenção</CardTitle>
                <CardDescription>
                  Baseado em ML e análise de 50.000+ padrões similares
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {twinData.predictions.map((pred, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{pred.component}</h4>
                      <Badge variant={pred.remainingLife < 30 ? "destructive" : "outline"}>
                        {pred.remainingLife}% vida útil
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${
                          pred.remainingLife < 30 ? 'bg-red-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${pred.remainingLife}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Próxima manutenção em {pred.nextMaintenance}
                      </span>
                      <Button variant="ghost" size="sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Ver Tendência
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3D Visualization Tab */}
          <TabsContent value="3d" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visualização 3D do Veículo</CardTitle>
                <CardDescription>
                  Modelo tridimensional interativo com status em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Box className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">Modelo 3D Interativo</p>
                    <p className="text-sm text-gray-300">
                      Visualização em desenvolvimento
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Three.js + WebGL + Dados em Tempo Real
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
