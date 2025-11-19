import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function VehicleList() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVehicles() {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*") // SEM FILTRO
        .order("placa", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setVehicles(data || []);
      }

      setLoading(false);
    }

    loadVehicles();
  }, []);

  if (loading) {
    return <p>Carregando veículos...</p>;
  }

  if (error) {
    return <p>Erro ao carregar: {error}</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Veículos</h2>

      {vehicles.length === 0 ? (
        <p>Nenhum veículo encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {vehicles.map((v) => (
            <li key={v.id} className="border p-3 rounded">
              <div>
                <strong>Placa:</strong> {v.placa}
              </div>
              <div>
                <strong>Tipo:</strong> {v.tipo}
              </div>
              <div>
                <strong>Modelo:</strong> {v.modelo}
              </div>
              <div>
                <strong>Ano:</strong> {v.ano}
              </div>
              <div>
                <strong>Status:</strong> {v.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
