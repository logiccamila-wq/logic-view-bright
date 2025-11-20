import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function VehicleSelect({ value, onChange }: Props) {
  const [vehicles, setVehicles] = useState<{ placa: string }[]>([]);
  useEffect(() => {
    async function fetchVehicles() {
      const { data, error } = await supabase
        .from("vehicles")
        .select("placa")
        .order("created_at", { ascending: true });
      if (!error && data) setVehicles(data);
    }
    fetchVehicles();
  }, []);
  return (
    <select value={value || ""} onChange={onChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
      <option value="">Selecione uma placa</option>
      {vehicles.map((v) => (
        <option key={v.placa} value={v.placa}>
          {v.placa}
        </option>
      ))}
    </select>
  );
}