import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, Smartphone, Wifi, Battery, MapPin, Navigation } from "lucide-react";
import { useState, useEffect } from "react";

export const DriverVehicleStatus = () => {
  const [speed, setSpeed] = useState(0);
  const [deviceConnected, setDeviceConnected] = useState(true);
  const [gpsSignal, setGpsSignal] = useState(100);

  // Simulação de dados em tempo real (substituir por dados reais)
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(Math.floor(Math.random() * 90) + 30);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSpeedColor = () => {
    if (speed > 80) return "text-red-500";
    if (speed > 60) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Status do Veículo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Velocidade */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Gauge className={`h-8 w-8 ${getSpeedColor()}`} />
            <div>
              <p className="text-sm text-muted-foreground">Velocidade Atual</p>
              <p className={`text-2xl font-bold ${getSpeedColor()}`}>
                {speed} km/h
              </p>
            </div>
          </div>
          {speed > 80 && (
            <Badge variant="destructive">Acima do limite</Badge>
          )}
        </div>

        {/* Status dos Dispositivos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Smartphone className={deviceConnected ? "h-5 w-5 text-green-500" : "h-5 w-5 text-red-500"} />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Dispositivo</p>
              <Badge variant={deviceConnected ? "default" : "destructive"} className="text-xs mt-1">
                {deviceConnected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Wifi className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Internet</p>
              <Badge variant="default" className="text-xs mt-1">
                4G Estável
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <MapPin className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">GPS</p>
              <Badge variant="default" className="text-xs mt-1">
                {gpsSignal}% Sinal
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Battery className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Bateria</p>
              <Badge variant="default" className="text-xs mt-1">
                85%
              </Badge>
            </div>
          </div>
        </div>

        {/* Localização Atual */}
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Localização em Tempo Real</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Rodovia BR-101, Km 324 - São Paulo, SP
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
