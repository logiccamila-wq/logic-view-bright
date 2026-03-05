import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTomTom } from '@/hooks/useTomTom';
import { MapPin, Navigation, Loader2, Plus, Trash2, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryPoint {
  address: string;
  lat?: number;
  lng?: number;
}

export function DeliveryRouting() {
  const { geocode, calculateRoute, loading } = useTomTom();
  const [origin, setOrigin] = useState<DeliveryPoint>({ address: '' });
  const [deliveries, setDeliveries] = useState<DeliveryPoint[]>([{ address: '' }]);
  const [routeInfo, setRouteInfo] = useState<{
    totalDistance: number;
    totalDuration: number;
    segments: Array<{ from: string; to: string; distance: number; duration: number }>;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const addDelivery = () => {
    setDeliveries([...deliveries, { address: '' }]);
  };

  const removeDelivery = (index: number) => {
    if (deliveries.length > 1) {
      setDeliveries(deliveries.filter((_, i) => i !== index));
    }
  };

  const updateDeliveryAddress = (index: number, address: string) => {
    const updated = [...deliveries];
    updated[index].address = address;
    setDeliveries(updated);
  };

  const handleCalculateRoute = async () => {
    // Validar origem
    if (!origin.address.trim()) {
      toast.error('Informe o endereço de origem');
      return;
    }

    // Validar entregas
    const validDeliveries = deliveries.filter(d => d.address.trim());
    if (validDeliveries.length === 0) {
      toast.error('Informe pelo menos um endereço de entrega');
      return;
    }

    setIsCalculating(true);
    setRouteInfo(null);

    try {
      // Geocodificar origem
      toast.info('Buscando endereço de origem...');
      const originResult = await geocode(origin.address);
      if (!originResult) {
        toast.error('Endereço de origem não encontrado');
        setIsCalculating(false);
        return;
      }

      const originCoords = {
        lat: originResult.position.lat,
        lng: originResult.position.lon,
        address: originResult.address.freeformAddress
      };

      setOrigin(prev => ({ ...prev, lat: originCoords.lat, lng: originCoords.lng }));

      // Geocodificar entregas
      toast.info('Buscando endereços de entrega...');
      const deliveryCoords = [];
      
      for (let i = 0; i < validDeliveries.length; i++) {
        const result = await geocode(validDeliveries[i].address);
        if (!result) {
          toast.warning(`Entrega ${i + 1}: endereço não encontrado, pulando...`);
          continue;
        }

        deliveryCoords.push({
          lat: result.position.lat,
          lng: result.position.lon,
          address: result.address.freeformAddress,
          originalIndex: deliveries.indexOf(validDeliveries[i])
        });
      }

      if (deliveryCoords.length === 0) {
        toast.error('Nenhum endereço de entrega válido encontrado');
        setIsCalculating(false);
        return;
      }

      // Atualizar coordenadas das entregas
      const updatedDeliveries = [...deliveries];
      deliveryCoords.forEach(coord => {
        updatedDeliveries[coord.originalIndex] = {
          address: coord.address,
          lat: coord.lat,
          lng: coord.lng
        };
      });
      setDeliveries(updatedDeliveries);

      // Calcular rotas segmento por segmento
      toast.info('Calculando rota otimizada...');
      const allPoints = [originCoords, ...deliveryCoords];
      const segments = [];
      let totalDistance = 0;
      let totalDuration = 0;

      for (let i = 0; i < allPoints.length - 1; i++) {
        const segment = await calculateRoute(
          { lat: allPoints[i].lat, lng: allPoints[i].lng },
          { lat: allPoints[i + 1].lat, lng: allPoints[i + 1].lng },
          'truck'
        );

        if (segment) {
          totalDistance += segment.distance;
          totalDuration += segment.duration;
          
          segments.push({
            from: allPoints[i].address,
            to: allPoints[i + 1].address,
            distance: segment.distance,
            duration: segment.duration
          });
        }
      }

      setRouteInfo({
        totalDistance,
        totalDuration,
        segments
      });

      toast.success('Rota calculada com sucesso!');
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      toast.error('Erro ao calcular rota');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-500" />
            Origem da Viagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label htmlFor="origin">Endereço de Origem</Label>
              <Input
                id="origin"
                value={origin.address}
                onChange={(e) => setOrigin({ address: e.target.value })}
                placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
                disabled={isCalculating}
              />
            </div>
            {origin.lat && origin.lng && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                📍 Coordenadas: {origin.lat.toFixed(6)}, {origin.lng.toFixed(6)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Entregas
            </span>
            <Button size="sm" onClick={addDelivery} disabled={isCalculating}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deliveries.map((delivery, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label>Entrega {index + 1}</Label>
                {deliveries.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeDelivery(index)}
                    disabled={isCalculating}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <Input
                value={delivery.address}
                onChange={(e) => updateDeliveryAddress(index, e.target.value)}
                placeholder="Ex: Rua Augusta, 500 - São Paulo, SP"
                disabled={isCalculating}
              />
              {delivery.lat && delivery.lng && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  📍 Coordenadas: {delivery.lat.toFixed(6)}, {delivery.lng.toFixed(6)}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={handleCalculateRoute}
        disabled={isCalculating || loading}
      >
        {isCalculating || loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Calculando rota...
          </>
        ) : (
          <>
            <Navigation className="h-5 w-5 mr-2" />
            Calcular Rota Otimizada
          </>
        )}
      </Button>

      {routeInfo && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Resumo da Rota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Distância Total
                </div>
                <div className="text-2xl font-bold">
                  {(routeInfo.totalDistance / 1000).toFixed(1)} km
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Tempo Estimado
                </div>
                <div className="text-2xl font-bold">
                  {Math.floor(routeInfo.totalDuration / 3600)}h{' '}
                  {Math.floor((routeInfo.totalDuration % 3600) / 60)}min
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Segmentos da Rota</h4>
              <div className="space-y-2">
                {routeInfo.segments.map((segment, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg text-sm"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">
                        {segment.from} → {segment.to}
                      </div>
                      <div className="text-muted-foreground flex gap-4">
                        <span>{(segment.distance / 1000).toFixed(1)} km</span>
                        <span>
                          {Math.floor(segment.duration / 60)} min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
