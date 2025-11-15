import { useEffect, useRef, useState } from 'react';
import { useTomTom } from '@/hooks/useTomTom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Vehicle {
  id: string;
  vehicle_plate: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: string;
}

interface LiveMapProps {
  vehicles: Vehicle[];
  selectedVehicle?: string;
  onVehicleClick?: (vehicleId: string) => void;
}

export function LiveMap({ vehicles, selectedVehicle, onVehicleClick }: LiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [apiKey, setApiKey] = useState<string>('');
  const { getApiKey } = useTomTom();

  useEffect(() => {
    const fetchApiKey = async () => {
      const key = await getApiKey();
      if (key) {
        setApiKey(key);
      }
    };
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || !apiKey) return;

    // Inicializar mapa
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-23.5505, -46.6333], 6);

      // Adicionar tiles do TomTom
      L.tileLayer(
        `https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${apiKey}`,
        {
          attribution: '&copy; <a href="https://www.tomtom.com">TomTom</a>',
          maxZoom: 18
        }
      ).addTo(mapRef.current);
    }

    // Atualizar marcadores dos veículos
    const bounds = L.latLngBounds([]);
    
    vehicles.forEach((vehicle) => {
      if (!vehicle.latitude || !vehicle.longitude) return;

      const position: [number, number] = [vehicle.latitude, vehicle.longitude];
      bounds.extend(position);

      // Criar ou atualizar marcador
      if (markersRef.current[vehicle.id]) {
        markersRef.current[vehicle.id].setLatLng(position);
      } else {
        const statusColor = 
          vehicle.status === 'em_transito' ? '#10b981' :
          vehicle.status === 'parado' ? '#f59e0b' :
          vehicle.status === 'offline' ? '#6b7280' : '#3b82f6';

        const icon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `
            <div class="flex flex-col items-center">
              <div class="relative">
                <div style="background-color: ${statusColor}" class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg transform -rotate-${vehicle.heading || 0}">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L4 9h3v11h10V9h3L12 2z"/>
                  </svg>
                </div>
              </div>
              <div class="bg-white px-2 py-1 rounded shadow-md text-xs font-semibold mt-1 whitespace-nowrap">
                ${vehicle.vehicle_plate}
              </div>
            </div>
          `,
          iconSize: [40, 70],
          iconAnchor: [20, 70]
        });

        const marker = L.marker(position, { icon })
          .addTo(mapRef.current!)
          .on('click', () => onVehicleClick?.(vehicle.id));

        markersRef.current[vehicle.id] = marker;
      }
    });

    // Ajustar zoom para mostrar todos os veículos
    if (vehicles.length > 0 && bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Remover marcadores de veículos que não existem mais
    Object.keys(markersRef.current).forEach(vehicleId => {
      if (!vehicles.find(v => v.id === vehicleId)) {
        markersRef.current[vehicleId].remove();
        delete markersRef.current[vehicleId];
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
  }, [vehicles, apiKey]);

  // Destacar veículo selecionado
  useEffect(() => {
    if (selectedVehicle && markersRef.current[selectedVehicle] && mapRef.current) {
      const marker = markersRef.current[selectedVehicle];
      mapRef.current.setView(marker.getLatLng(), 15);
    }
  }, [selectedVehicle]);

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg shadow-lg border"
    />
  );
}
