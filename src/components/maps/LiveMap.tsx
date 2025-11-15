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

export function LiveMap({ vehicles, selectedVehicle, onVehicleClick }: LiveMapProps) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <Truck className="w-16 h-16 mx-auto text-primary/50" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Mapa Temporariamente Desabilitado</h3>
            <p className="text-sm text-muted-foreground mt-2">Sistema em testes sem integração Mapbox</p>
          </div>
          <div className="grid gap-2 mt-4 max-w-md mx-auto">
            {vehicles.slice(0, 3).map(vehicle => (
              <div 
                key={vehicle.id}
                className="bg-card p-3 rounded-lg text-left cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onVehicleClick?.(vehicle.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{vehicle.vehicle_plate}</span>
                  <span className="text-sm text-muted-foreground">{vehicle.speed} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
