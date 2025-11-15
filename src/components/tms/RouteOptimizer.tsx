import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTomTom } from '@/hooks/useTomTom';
import { RouteMap } from './RouteMap';
import { MapPin, Plus, Trash2, Navigation, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
  type: 'origin' | 'client' | 'delivery';
}

export function RouteOptimizer() {
  const { calculateRoute, loading } = useTomTom();
  const [origin, setOrigin] = useState({ lat: '', lng: '', label: 'Início' });
  const [client, setClient] = useState({ lat: '', lng: '', label: 'Cliente' });
  const [deliveries, setDeliveries] = useState<Array<{ lat: string; lng: string; label: string }>>([
    { lat: '', lng: '', label: 'Entrega 1' }
  ]);

  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<number[][]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  const addDelivery = () => {
    setDeliveries([...deliveries, { 
      lat: '', 
      lng: '', 
      label: `Entrega ${deliveries.length + 1}` 
    }]);
  };

  const removeDelivery = (index: number) => {
    setDeliveries(deliveries.filter((_, i) => i !== index));
  };

  const updateDelivery = (index: number, field: 'lat' | 'lng' | 'label', value: string) => {
    const updated = [...deliveries];
    updated[index][field] = value;
    setDeliveries(updated);
  };

  const calculateOptimizedRoute = async () => {
    // Validar entradas
    if (!origin.lat || !origin.lng) {
      toast.error('Preencha a origem da rota');
      return;
    }

    if (!client.lat || !client.lng) {
      toast.error('Preencha o endereço do cliente');
      return;
    }

    const validDeliveries = deliveries.filter(d => d.lat && d.lng);
    if (validDeliveries.length === 0) {
      toast.error('Adicione pelo menos uma entrega');
      return;
    }

    try {
      // Montar pontos da rota: Início → Cliente → Entregas
      const points: RoutePoint[] = [
        { ...origin, lat: parseFloat(origin.lat), lng: parseFloat(origin.lng), type: 'origin' },
        { ...client, lat: parseFloat(client.lat), lng: parseFloat(client.lng), type: 'client' },
        ...validDeliveries.map(d => ({
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lng),
          label: d.label,
          type: 'delivery' as const
        }))
      ];

      setRoutePoints(points);

      // Calcular rota ponto a ponto
      let totalDistance = 0;
      let totalDuration = 0;
      const allCoordinates: number[][] = [];

      for (let i = 0; i < points.length - 1; i++) {
        const result = await calculateRoute(
          { lat: points[i].lat, lng: points[i].lng },
          { lat: points[i + 1].lat, lng: points[i + 1].lng },
          'truck'
        );

        if (result) {
          totalDistance += result.distance;
          totalDuration += result.duration;
          allCoordinates.push(...result.geometry.coordinates);
        }
      }

      setRouteGeometry(allCoordinates);
      setRouteInfo({
        distance: totalDistance,
        duration: totalDuration
      });

      toast.success('Rota calculada com sucesso!');
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      toast.error('Erro ao calcular rota');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulário de pontos */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Início da Rota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input
                value={origin.label}
                onChange={(e) => setOrigin({ ...origin, label: e.target.value })}
                placeholder="Ex: Garagem Central"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={origin.lat}
                  onChange={(e) => setOrigin({ ...origin, lat: e.target.value })}
                  placeholder="-23.5505"
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={origin.lng}
                  onChange={(e) => setOrigin({ ...origin, lng: e.target.value })}
                  placeholder="-46.6333"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input
                value={client.label}
                onChange={(e) => setClient({ ...client, label: e.target.value })}
                placeholder="Ex: Cliente ABC"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={client.lat}
                  onChange={(e) => setClient({ ...client, lat: e.target.value })}
                  placeholder="-23.5505"
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={client.lng}
                  onChange={(e) => setClient({ ...client, lng: e.target.value })}
                  placeholder="-46.6333"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                Entregas
              </span>
              <Button size="sm" onClick={addDelivery}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deliveries.map((delivery, index) => (
              <div key={index} className="space-y-3 pb-4 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <Label>Entrega {index + 1}</Label>
                  {deliveries.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDelivery(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  value={delivery.label}
                  onChange={(e) => updateDelivery(index, 'label', e.target.value)}
                  placeholder={`Nome da entrega ${index + 1}`}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="any"
                    value={delivery.lat}
                    onChange={(e) => updateDelivery(index, 'lat', e.target.value)}
                    placeholder="Latitude"
                  />
                  <Input
                    type="number"
                    step="any"
                    value={delivery.lng}
                    onChange={(e) => updateDelivery(index, 'lng', e.target.value)}
                    placeholder="Longitude"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={calculateOptimizedRoute}
          disabled={loading}
        >
          <Navigation className="h-5 w-5 mr-2" />
          {loading ? 'Calculando...' : 'Calcular Rota Otimizada'}
        </Button>

        {routeInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Informações da Rota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Distância Total
                </span>
                <span className="font-bold">{(routeInfo.distance / 1000).toFixed(2)} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Tempo Estimado
                </span>
                <span className="font-bold">
                  {Math.floor(routeInfo.duration / 60)}h {Math.floor(routeInfo.duration % 60)}min
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mapa */}
      <div className="lg:col-span-2">
        <RouteMap points={routePoints} routeGeometry={routeGeometry} />
      </div>
    </div>
  );
}
