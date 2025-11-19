import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      setLoading(true);

      const { data, error } = await supabase
        .from("vehicles")
        .select("*") // ← FIX AQUI — removeu o filtro errado
        .order("placa", { ascending: true });

      if (error) {
        console.error("Erro ao carregar veículos:", error);
        setLoading(false);
        return;
      }

      setVehicles(data || []);
      setLoading(false);
    }

    loadVehicles();
  }, []);

  if (loading) {
    return <p>Carregando veículos...</p>;
  }

  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Lista de Veículos</h2>

      {vehicles.length === 0 && <p>Nenhum veículo encontrado.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {vehicles.map((v) => (
          <li
            key={v.id}
            style={{
              padding: "12px",
              marginBottom: "10px",
              background: "#f5f5f5",
              borderRadius: "6px",
            }}
          >
            <strong>Placa:</strong> {v.placa} <br />
            <strong>Tipo:</strong> {v.tipo} <br />
            <strong>Modelo:</strong> {v.modelo} <br />
            <strong>Proprietário:</strong> {v.proprietario || "—"}
          </li>
        ))}
      </ul>
    </div>
  );
}
