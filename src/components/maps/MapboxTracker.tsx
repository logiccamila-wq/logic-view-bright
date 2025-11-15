import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);

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


  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'MAPBOX_PUBLIC_TOKEN' }
        });

        if (error) throw error;
        let token = data?.MAPBOX_PUBLIC_TOKEN as string | undefined;

        // Sanitizar casos onde o segredo foi salvo como JSON: { "token": "pk_..." }
        if (token && token.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(token);
            if (parsed && typeof parsed === 'object' && parsed.token) {
              token = String(parsed.token);
            }
          } catch (_) {
            // ignore JSON parse errors
          }
        }

        if (token && /^pk\./.test(token)) {
          initializeMap(token);
        } else {
          toast.error('Token do Mapbox inválido. Ele deve iniciar com "pk."');
        }
      } catch (error) {
        console.error('Erro ao buscar token do Mapbox:', error);
        toast.error('Erro ao carregar configuração do mapa');
      } finally {
        setLoading(false);
      }
    };

    fetchMapboxToken();

    return () => {
      if (map.current && mapReady) {
        try {
          map.current.remove();
          map.current = null;
        } catch (error) {
          console.error('Erro ao remover mapa:', error);
        }
      }
    };
  }, [mapReady]);

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

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <p className="text-muted-foreground">Carregando configuração...</p>
        </div>
      )}
      {!loading && !mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <p className="text-muted-foreground">Inicializando mapa...</p>
        </div>
      )}
      {mapReady && (
        <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
          <p className="text-xs text-muted-foreground">
            {vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''} rastreado{vehicles.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
