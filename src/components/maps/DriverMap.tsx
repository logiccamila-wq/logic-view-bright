import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useOpenRouteService } from '@/hooks/useOpenRouteService';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation, MapPin, Clock, Route } from 'lucide-react';

interface DriverMapProps {
  currentLocation?: { lat: number; lng: number };
  destination?: { lat: number; lng: number; label: string };
  showRoute?: boolean;
}

export function DriverMap({ currentLocation, destination, showRoute = true }: DriverMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const { calculateRoute, loading } = useOpenRouteService();
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      const { data } = await supabase.functions.invoke('get-secret', {
        body: { name: 'OPENROUTESERVICE_API_KEY' }
      });
      if (data?.OPENROUTESERVICE_API_KEY) {
        setApiKey(data.OPENROUTESERVICE_API_KEY);
      }
    };
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || !apiKey) return;

    // Inicializar mapa se não existir
    if (!mapRef.current) {
      const defaultCenter = currentLocation || destination || { lat: -23.5505, lng: -46.6333 };
      mapRef.current = L.map(mapContainerRef.current).setView(
        [defaultCenter.lat, defaultCenter.lng], 
        13
      );

      // Adicionar tiles do OpenRouteService (Raster Map Tiles API)
      L.tileLayer(
        `https://api.openrouteservice.org/mapsurfer/{z}/{x}/{y}.png?api_key=${apiKey}`,
        {
          attribution: '&copy; <a href="https://openrouteservice.org">OpenRouteService</a>',
          maxZoom: 18
        }
      ).addTo(mapRef.current);
    }

    // Limpar marcadores e rotas anteriores
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapRef.current?.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);

    // Adicionar marcador de localização atual
    if (currentLocation) {
      const currentIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="8"/>
              </svg>
            </div>
            <div class="bg-white px-2 py-1 rounded shadow-md text-xs font-semibold mt-1">
              Você está aqui
            </div>
          </div>
        `,
        iconSize: [40, 60],
        iconAnchor: [20, 60]
      });

      L.marker([currentLocation.lat, currentLocation.lng], { icon: currentIcon })
        .addTo(mapRef.current);
      bounds.extend([currentLocation.lat, currentLocation.lng]);
    }

    // Adicionar marcador de destino
    if (destination) {
      const destIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="bg-white px-2 py-1 rounded shadow-md text-xs font-semibold mt-1 max-w-[150px] text-center">
              ${destination.label}
            </div>
          </div>
        `,
        iconSize: [40, 80],
        iconAnchor: [20, 80]
      });

      L.marker([destination.lat, destination.lng], { icon: destIcon })
        .addTo(mapRef.current);
      bounds.extend([destination.lat, destination.lng]);
    }

    // Calcular e desenhar rota
    if (showRoute && currentLocation && destination) {
      calculateRoute(currentLocation, destination, 'driving-hgv').then(route => {
        if (route && mapRef.current) {
          setRouteInfo({
            distance: route.distance,
            duration: route.duration
          });

          const latLngs = route.geometry.coordinates.map(coord => 
            L.latLng(coord[1], coord[0])
          );
          L.polyline(latLngs, {
            color: '#3b82f6',
            weight: 5,
            opacity: 0.8
          }).addTo(mapRef.current);
        }
      });
    }

    // Ajustar visualização para mostrar todos os pontos
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [currentLocation, destination, showRoute, apiKey]);

  if (!apiKey) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
            <p className="text-muted-foreground">Carregando mapa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        ref={mapContainerRef} 
        className="w-full h-[400px] rounded-lg shadow-lg border"
      />
      
      {routeInfo && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Distância</p>
                  <p className="font-bold text-lg">
                    {(routeInfo.distance / 1000).toFixed(1)} km
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Tempo Estimado</p>
                  <p className="font-bold text-lg">
                    {Math.floor(routeInfo.duration / 60)}h {Math.floor(routeInfo.duration % 60)}min
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="h-4 w-4 animate-spin" />
              <span>Calculando melhor rota...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
