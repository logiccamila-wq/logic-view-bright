import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVehicles, VehicleItem } from "@/lib/hooks/useVehicles";
import { cn } from "@/lib/utils";

interface VehicleSelectProps {
  value?: string;
  onChange: (value: string) => void;
  onSelectVehicle?: (vehicle: VehicleItem) => void;
  className?: string;
  placeholder?: string;
  filter?: (vehicle: VehicleItem) => boolean;
  required?: boolean;
}

export function VehicleSelect({ value, onChange, onSelectVehicle, className, placeholder = "Selecione uma placa", filter, required }: VehicleSelectProps) {
  const { vehicles, loading } = useVehicles();

  const filteredVehicles = filter ? vehicles.filter(filter) : vehicles;

  return (
    <Select 
      value={value || ""} 
      onValueChange={(val) => {
        onChange(val);
        if (onSelectVehicle) {
          const v = vehicles.find(item => item.plate === val);
          if (v) onSelectVehicle(v);
        }
      }} 
      required={required}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={loading ? "Carregando..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredVehicles.map((vehicle) => (
          <SelectItem key={vehicle.plate} value={vehicle.plate}>
            {vehicle.plate} {vehicle.model ? `- ${vehicle.model}` : ""}
          </SelectItem>
        ))}
        {filteredVehicles.length === 0 && !loading && (
          <SelectItem value="_empty" disabled>
            Nenhum veículo encontrado
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
