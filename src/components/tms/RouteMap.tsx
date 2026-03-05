import { useEffect, useRef, useState } from 'react';
import { useTomTom } from '@/hooks/useTomTom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
  type: 'origin' | 'client' | 'delivery';
}

interface RouteMapProps {
  points: RoutePoint[];
  routeGeometry?: number[][];
}

export function RouteMap({ points, routeGeometry }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { getTileUrl } = useTomTom();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicializar mapa se não existir
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-23.5505, -46.6333], 13);

      // Adicionar tiles do OpenStreetMap
      L.tileLayer(getTileUrl(), {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(mapRef.current);
    }

    // Limpar marcadores e rotas anteriores
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Adicionar marcadores para cada ponto
    const bounds = L.latLngBounds([]);
    
    points.forEach((point) => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
              point.type === 'origin' ? 'bg-green-500' :
              point.type === 'client' ? 'bg-blue-500' :
              'bg-red-500'
            }">
              ${point.type === 'origin' ? 'I' : point.type === 'client' ? 'C' : 'E'}
            </div>
            <div class="bg-white px-2 py-1 rounded shadow-md text-xs font-semibold mt-1 whitespace-nowrap">
              ${point.label}
            </div>
          </div>
        `,
        iconSize: [40, 60],
        iconAnchor: [20, 60]
      });

      const marker = L.marker([point.lat, point.lng], { icon }).addTo(mapRef.current!);
      bounds.extend([point.lat, point.lng]);
    });

    // Desenhar rota se existir geometria
    if (routeGeometry && routeGeometry.length > 0) {
      const latLngs = routeGeometry.map(coord => L.latLng(coord[1], coord[0]));
      L.polyline(latLngs, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7
      }).addTo(mapRef.current!);
    }

    // Ajustar visualização para mostrar todos os pontos
    if (points.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [points, routeGeometry]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-[600px] rounded-lg shadow-lg border"
    />
  );
}
