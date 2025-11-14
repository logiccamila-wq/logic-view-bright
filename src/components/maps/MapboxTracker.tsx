import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  placa: string;
  posicao: { lat: number; lng: number };
  status: string;
  statusColor: string;
}

interface MapboxTrackerProps {
  vehicles: Vehicle[];
}

export function MapboxTracker({ vehicles }: MapboxTrackerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [mapReady, setMapReady] = useState(false);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-34.9005, -8.1137], // Recife, PE
        zoom: 10,
        pitch: 45,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setMapReady(true);
        toast.success('Mapa carregado com sucesso!');
      });

    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      toast.error('Token Mapbox inválido. Obtenha um em mapbox.com');
    }
  };

  const handleTokenSubmit = () => {
    if (!tokenInput.trim()) {
      toast.error('Por favor, insira um token Mapbox');
      return;
    }
    setMapboxToken(tokenInput);
    localStorage.setItem('mapbox_token', tokenInput);
    initializeMap(tokenInput);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
      setTokenInput(savedToken);
      initializeMap(savedToken);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Limpar marcadores antigos
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();

    // Adicionar novos marcadores
    vehicles.forEach(vehicle => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getMarkerColor(vehicle.statusColor);
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '14px';
      el.style.fontWeight = 'bold';
      el.style.color = 'white';
      el.style.cursor = 'pointer';
      el.innerHTML = '🚛';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <strong>${vehicle.placa}</strong><br/>
          Status: ${vehicle.status}
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([vehicle.posicao.lng, vehicle.posicao.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.set(vehicle.id, marker);
    });

    // Ajustar bounds para mostrar todos os veículos
    if (vehicles.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      vehicles.forEach(v => {
        bounds.extend([v.posicao.lng, v.posicao.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }, [vehicles, mapReady]);

  const getMarkerColor = (statusColor: string): string => {
    const colors: Record<string, string> = {
      green: '#22c55e',
      yellow: '#eab308',
      red: '#ef4444',
      gray: '#6b7280'
    };
    return colors[statusColor] || colors.gray;
  };

  if (!mapboxToken) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Configure o Mapbox</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Para usar o rastreamento em tempo real, você precisa de um token Mapbox (gratuito).
            </p>
            <ol className="text-sm text-muted-foreground space-y-2 mb-4 list-decimal list-inside">
              <li>Acesse <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a></li>
              <li>Crie uma conta gratuita</li>
              <li>Copie seu <strong>Public Token</strong></li>
              <li>Cole abaixo e clique em Ativar Mapa</li>
            </ol>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <div className="flex gap-2">
              <Input
                id="mapbox-token"
                type="text"
                placeholder="pk.eyJ1Ijo..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="font-mono text-sm"
              />
              <Button onClick={handleTokenSubmit}>
                Ativar Mapa
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-muted-foreground">Carregando mapa...</p>
        </div>
      )}
    </div>
  );
}
