import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
  placa: string;
  modelo: string;
  ano: number;
  status: string;
  tipo: string;
}

export const VehicleList = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('tipo', 'cavalo_mecanico')
        .order('placa');

      if (error) throw error;

      setVehicles(data || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      toast.error('Erro ao carregar lista de veículos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      disponivel: 'bg-green-500/20 text-green-600 border-green-500/30',
      em_viagem: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      manutencao: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      inativo: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      disponivel: 'Disponível',
      em_viagem: 'Em Viagem',
      manutencao: 'Manutenção',
      inativo: 'Inativo',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredVehicles = vehicles.filter(v => 
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por placa ou modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.placa}
            className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-lg">{vehicle.placa}</h4>
                <p className="text-sm text-muted-foreground">
                  {vehicle.modelo}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ano: {vehicle.ano}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={getStatusColor(vehicle.status)}
              >
                {getStatusLabel(vehicle.status)}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum cavalo mecânico cadastrado'}
        </div>
      )}
    </div>
  );
};
