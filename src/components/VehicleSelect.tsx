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
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .in("status", ["ativo", "Ativo"]);

        if (error) {
          console.error("Erro ao carregar veículos:", error);
          setVehicles([]);
          return;
        }

        const mapped = (data || [])
          .map((v: any) => ({ placa: v.placa || v.plate }))
          .filter((v) => !!v.placa)
          .sort((a, b) => a.placa.localeCompare(b.placa));

        setVehicles(mapped);
      } catch (e) {
        console.error("Falha ao carregar veículos:", e);
        setVehicles([]);
      }
    }
    fetchVehicles();
  }, []);

  return (
    <select
      value={value || ""}
      onChange={onChange}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">Selecione uma placa</option>
      {vehicles.length === 0 && (
        <option value="" disabled>
          Nenhum veículo encontrado
        </option>
      )}
      {vehicles.map((v) => (
        <option key={v.placa} value={v.placa}>
          {v.placa}
        </option>
      ))}
    </select>
  );
}