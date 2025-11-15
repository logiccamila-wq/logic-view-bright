import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Truck } from 'lucide-react';

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

// Token público do Mapbox - deve ser configurado nas secrets
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTU0ZDZ5eGkwcjd5MmtzN2w5ZGcyNGF4In0.WJ3_XLKLhVCzQv-tTKKJhw';

export function LiveMap({ vehicles, selectedVehicle, onVehicleClick }: LiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-47.9292, -15.7801], // Brasília - Centro do Brasil
      zoom: 4,
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Adicionar fog effect
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(20, 20, 30)',
        'high-color': 'rgb(40, 40, 60)',
        'horizon-blend': 0.1,
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remover marcadores antigos que não existem mais
    Object.keys(markers.current).forEach(vehicleId => {
      if (!vehicles.find(v => v.id === vehicleId)) {
        markers.current[vehicleId].remove();
        delete markers.current[vehicleId];
      }
    });

    // Adicionar/atualizar marcadores
    vehicles.forEach(vehicle => {
      if (!markers.current[vehicle.id]) {
        // Criar novo marcador
        const el = document.createElement('div');
        el.className = 'vehicle-marker';
        el.style.cssText = `
          width: 40px;
          height: 40px;
          background-color: ${getStatusColor(vehicle.status)};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        `;
        el.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`;
        
        el.addEventListener('click', () => {
          onVehicleClick?.(vehicle.id);
        });

        const marker = new mapboxgl.Marker(el, {
          rotationAlignment: 'map',
          rotation: vehicle.heading
        })
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="padding: 8px;">
                <strong>${vehicle.vehicle_plate}</strong><br/>
                <span style="font-size: 12px;">Velocidade: ${vehicle.speed} km/h</span>
              </div>`
            )
          )
          .addTo(map.current!);

        markers.current[vehicle.id] = marker;
      } else {
        // Atualizar posição e rotação
        const marker = markers.current[vehicle.id];
        marker.setLngLat([vehicle.longitude, vehicle.latitude]);
        marker.setRotation(vehicle.heading);
        
        // Atualizar cor baseada no status
        const el = marker.getElement();
        el.style.backgroundColor = getStatusColor(vehicle.status);
      }
    });

    // Destacar veículo selecionado
    if (selectedVehicle) {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      if (vehicle && map.current) {
        map.current.flyTo({
          center: [vehicle.longitude, vehicle.latitude],
          zoom: 12,
          duration: 1000
        });

        // Destacar marcador
        Object.keys(markers.current).forEach(id => {
          const el = markers.current[id].getElement();
          if (id === selectedVehicle) {
            el.style.transform = 'scale(1.3)';
            el.style.zIndex = '1000';
          } else {
            el.style.transform = 'scale(1)';
            el.style.zIndex = '1';
          }
        });
      }
    }
  }, [vehicles, selectedVehicle, onVehicleClick]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_transito':
        return '#10b981'; // green
      case 'parado':
        return '#f59e0b'; // yellow
      case 'atraso':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Legenda */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <p className="text-xs font-semibold mb-2">Status</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Em trânsito</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Parado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Atraso</span>
          </div>
        </div>
      </div>

      {/* Contador de veículos */}
      <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-lg px-4 py-2 shadow-lg font-semibold">
        {vehicles.length} veículos ativos
      </div>
    </div>
  );
}
