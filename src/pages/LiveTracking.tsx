import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Truck, 
  CheckCircle,
  Search,
  Tv,
  RefreshCw,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useVehicleTracking } from "@/hooks/useVehicleTracking";
import { LiveMap } from "@/components/maps/LiveMap";

const LiveTracking = () => {
  const { vehicles: trackedVehicles, loading } = useVehicleTracking();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTvMode, setIsTvMode] = useState(false);

  // Filtrar veículos baseado no termo de busca
  const filteredVehicles = trackedVehicles.filter(
    v => 
      v.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedVehicle = trackedVehicles.find(v => v.id === selectedVehicleId);

  // KPIs calculados
  const traveling = trackedVehicles.filter(v => v.status === 'em_transito').length;
  const paused = trackedVehicles.filter(v => v.status === 'parado').length;
  const delayed = trackedVehicles.filter(v => v.status === 'atrasado').length;
  const completed = trackedVehicles.filter(v => v.status === 'finalizado').length;

  useEffect(() => {
    if (trackedVehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(trackedVehicles[0].id);
    }
  }, [trackedVehicles, selectedVehicleId]);

  const getStatusColor = (status: string): 'green' | 'yellow' | 'red' | 'gray' => {
    switch (status) {
      case 'em_transito': return 'green';
      case 'parado': return 'yellow';
      case 'atrasado': return 'red';
      default: return 'gray';
    }
  };

  const getStatusDotClass = (color: 'green' | 'yellow' | 'red' | 'gray') => {
    const colors = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      gray: 'bg-gray-500',
    };
    return colors[color];
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'em_transito': 'Em Viagem',
      'parado': 'Parado (Pausa)',
      'atrasado': 'Em Atraso',
      'finalizado': 'Finalizado',
      'garagem': 'Na Garagem'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando rastreamento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Sidebar Esquerda - Lista de Veículos */}
        {!isTvMode && (
          <aside className="w-80 bg-card shadow-lg flex flex-col rounded-lg border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Frota Ativa</h2>
              <Badge variant="secondary">{trackedVehicles.length}</Badge>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por placa ou motorista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto">
              {filteredVehicles.map((vehicle) => {
                const statusColor = getStatusColor(vehicle.status);
                return (
                  <div
                    key={vehicle.id}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedVehicleId === vehicle.id ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-sm">{vehicle.vehicle_plate}</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusDotClass(statusColor)}`} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Motorista: {vehicle.driver_id}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{getStatusLabel(vehicle.status)}</span>
                      <span className="font-medium">{vehicle.speed} km/h</span>
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="p-4 border-t text-xs text-muted-foreground">
              <p>&copy; 2025 EJG Evolução em Transporte</p>
              <p>Status: <span className="text-green-500 font-semibold">Online</span></p>
            </div>
          </aside>
        )}

        {/* Conteúdo Principal */}
        <main className="flex-1 flex flex-col">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-full mr-3">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total em Viagem</p>
                  <p className="text-3xl font-bold">{traveling}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="p-2 bg-yellow-100 text-yellow-700 rounded-full mr-3">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parados (Pausa)</p>
                  <p className="text-3xl font-bold">{paused}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="p-2 bg-red-100 text-red-700 rounded-full mr-3">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Atraso</p>
                  <p className="text-3xl font-bold">{delayed}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="p-2 bg-green-100 text-green-700 rounded-full mr-3">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entregas Concluídas</p>
                  <p className="text-3xl font-bold">{completed}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mapa */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex-1 overflow-hidden">
            <Button
              variant={isTvMode ? "default" : "secondary"}
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setIsTvMode(!isTvMode)}
            >
              <Tv className="h-4 w-4 mr-2" />
              {isTvMode ? 'Sair do Modo TV' : 'Modo TV'}
            </Button>

            {/* LiveMap Component */}
            <LiveMap 
              vehicles={trackedVehicles.map(v => ({
                id: v.id,
                vehicle_plate: v.vehicle_plate,
                latitude: v.latitude,
                longitude: v.longitude,
                speed: v.speed,
                heading: v.heading,
                status: v.status
              }))} 
              selectedVehicle={selectedVehicleId}
              onVehicleClick={setSelectedVehicleId}
            />
          </div>
        </main>

        {/* Sidebar Direita - Detalhes do Veículo */}
        {!isTvMode && selectedVehicle && (
          <aside className="w-96 bg-card shadow-lg flex flex-col rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="text-xl font-bold">{selectedVehicle.vehicle_plate}</h3>
              <p className="text-sm text-muted-foreground">Motorista: {selectedVehicle.driver_id}</p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Status e Velocidade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <p className="text-lg font-medium">{getStatusLabel(selectedVehicle.status)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Velocidade</label>
                  <p className="text-lg font-medium">{selectedVehicle.speed} km/h</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Direção</label>
                  <p className="text-lg font-medium">{selectedVehicle.heading}°</p>
                </div>
              </div>

              {/* Localização */}
              <Card className="bg-muted/30">
                <CardContent className="p-3 space-y-2">
                  <h4 className="font-semibold text-sm mb-2">Localização</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Latitude</p>
                        <p className="font-medium">{selectedVehicle.latitude.toFixed(6)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Longitude</p>
                        <p className="font-medium">{selectedVehicle.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedVehicle.trip_id && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Viagem</label>
                  <p className="text-sm font-mono">{selectedVehicle.trip_id}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Última atualização</label>
                <p className="text-sm">
                  {selectedVehicle?.timestamp 
                    ? new Date(selectedVehicle.timestamp).toLocaleString('pt-BR') 
                    : '-'}
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </Layout>
  );
};

export default LiveTracking;
