import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Truck, 
  CheckCircle,
  Search,
  Tv,
  TrendingUp,
  Fuel,
  Package,
  Scale,
  DollarSign,
  Navigation,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useVehicleTracking } from "@/hooks/useVehicleTracking";
import { LiveMap } from "@/components/maps/LiveMap";
import { MapNavigation } from "@/components/maps/MapNavigation";

interface VehicleData {
  id: string;
  placa: string;
  motorista: string;
  status: 'Em Viagem' | 'Parado (Pausa)' | 'Em Atraso' | 'Na Garagem';
  statusColor: 'green' | 'yellow' | 'red' | 'gray';
  velocidade: number;
  origem: string;
  destino: string;
  progresso: number;
  posicao: { lat: number; lng: number };
  
  // Dados Operacionais
  peso: number; // kg
  cubagem: number; // m³
  valorFrete: number;
  distanciaTotal: number; // km
  distanciaPercorrida: number; // km
  
  // Dados Preditivos ML
  custoKmPreditivo: number;
  riscoJornada: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  previsaoChegada: string;
  consumoCombustivelPrevisto: number; // litros
  custoTotalPrevisto: number;
  
  // Alertas
  alertaPreditivo?: {
    tipo: string;
    mensagem: string;
    acao: string;
    severidade: 'info' | 'warning' | 'critical';
  } | null;
  
  macros: Array<{ time: string; event: string }>;
}

const mockVehicles: VehicleData[] = [
  {
    id: '1',
    placa: 'RST-1A23',
    motorista: 'Carlos Pereira',
    status: 'Em Viagem',
    statusColor: 'green',
    velocidade: 82,
    origem: 'CDD Jaboatão dos Guararapes, PE',
    destino: 'Cliente A - Recife, PE',
    progresso: 75,
    posicao: { lat: -8.1137, lng: -34.9005 },
    peso: 8500,
    cubagem: 42.5,
    valorFrete: 1850.00,
    distanciaTotal: 450,
    distanciaPercorrida: 337,
    custoKmPreditivo: 6.85,
    riscoJornada: 'C',
    previsaoChegada: '14:30',
    consumoCombustivelPrevisto: 135,
    custoTotalPrevisto: 3082.50,
    alertaPreditivo: {
      tipo: 'Atraso Operacional',
      mensagem: 'Risco de 80% de atraso de 30min no Cliente A (histórico de descarga lento).',
      acao: 'Notificar cliente sobre possível espera.',
      severidade: 'warning'
    },
    macros: [
      { time: '09:15', event: 'Início do Descarrego' },
      { time: '08:02', event: 'Chegada ao Cliente' },
      { time: '06:30', event: 'Início da Viagem' }
    ]
  },
  {
    id: '2',
    placa: 'QWE-4B56',
    motorista: 'Ana Julia Lima',
    status: 'Parado (Pausa)',
    statusColor: 'yellow',
    velocidade: 0,
    origem: 'CDD Jaboatão dos Guararapes, PE',
    destino: 'Cliente B - Caruaru, PE',
    progresso: 42,
    posicao: { lat: -8.2833, lng: -35.9758 },
    peso: 12300,
    cubagem: 65.0,
    valorFrete: 2450.00,
    distanciaTotal: 580,
    distanciaPercorrida: 244,
    custoKmPreditivo: 7.10,
    riscoJornada: 'B',
    previsaoChegada: '16:15',
    consumoCombustivelPrevisto: 174,
    custoTotalPrevisto: 4118.00,
    alertaPreditivo: null,
    macros: [
      { time: '12:05', event: 'Início de Pausa (Almoço)' },
      { time: '08:15', event: 'Início da Viagem' }
    ]
  },
  {
    id: '3',
    placa: 'XYZ-7C89',
    motorista: 'Marcos Andrade',
    status: 'Em Atraso',
    statusColor: 'red',
    velocidade: 65,
    origem: 'CDD Jaboatão dos Guararapes, PE',
    destino: 'Cliente C - João Pessoa, PB',
    progresso: 30,
    posicao: { lat: -7.1195, lng: -34.8450 },
    peso: 15800,
    cubagem: 78.5,
    valorFrete: 3200.00,
    distanciaTotal: 720,
    distanciaPercorrida: 216,
    custoKmPreditivo: 8.20,
    riscoJornada: 'D',
    previsaoChegada: '19:45',
    consumoCombustivelPrevisto: 216,
    custoTotalPrevisto: 5904.00,
    alertaPreditivo: {
      tipo: 'Risco (Sindicato/Fadiga)',
      mensagem: 'Motorista se aproxima de 10h de jornada. Padrão de frenagem aumentou 15%. Risco de incidente.',
      acao: 'Instruir parada obrigatória no Posto X (a 20km).',
      severidade: 'critical'
    },
    macros: [
      { time: '10:30', event: 'Parada Inesperada (Trânsito)' },
      { time: '09:00', event: 'Início da Viagem' }
    ]
  }
];

// Helper functions
const getStatusColor = (status: string): 'green' | 'yellow' | 'red' | 'gray' => {
  switch (status) {
    case 'em_transito': return 'green';
    case 'parado': return 'yellow';
    case 'atraso': return 'red';
    default: return 'gray';
  }
};

const getStatusDotClass = (color: 'green' | 'yellow' | 'red' | 'gray') => {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  };
  return colors[color];
};

const LiveTracking = () => {
  const { vehicles: trackedVehicles, loading } = useVehicleTracking();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTvMode, setIsTvMode] = useState(false);

  const filteredVehicles = trackedVehicles.filter(v =>
    v.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const traveling = trackedVehicles.filter(v => v.status === 'em_transito').length;
  const paused = trackedVehicles.filter(v => v.status === 'parado').length;
  const delayed = trackedVehicles.filter(v => v.status === 'atraso').length;
  const completed = 0; // Will be calculated from completed trips

  const selectedVehicle = selectedVehicleId 
    ? trackedVehicles.find(v => v.id === selectedVehicleId)
    : null;

  useEffect(() => {
    if (filteredVehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(filteredVehicles[0].id);
    }
  }, [filteredVehicles, selectedVehicleId]);

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
                      <span className="text-muted-foreground">{vehicle.status}</span>
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
          <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border overflow-hidden">
            <Button
              onClick={() => setIsTvMode(!isTvMode)}
              className="absolute top-4 right-4 z-10"
              variant="outline"
            >
              <Tv className="mr-2 h-4 w-4" />
              {isTvMode ? 'Modo Dashboard' : 'Modo TV'}
            </Button>

            {/* Placeholder para Mapa - Será substituído por Google Maps ou Mapbox */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-32 w-32 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500">Mapa Interativo</p>
                <p className="text-sm text-gray-400 mt-2">Integração com Google Maps ou Mapbox</p>
              </div>
            </div>

            {/* Vehicle markers will be shown on the LiveMap component */}
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
                  <p className="text-lg font-medium">{selectedVehicle.status}</p>
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
                <p className="text-sm">{new Date(selectedVehicle.timestamp).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </Layout>
  );
};

export default LiveTracking;
