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
  Navigation
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const LiveTracking = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>(mockVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTvMode, setIsTvMode] = useState(false);

  const filteredVehicles = vehicles.filter(v =>
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.motorista.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const traveling = vehicles.filter(v => v.status === 'Em Viagem').length;
  const paused = vehicles.filter(v => v.status === 'Parado (Pausa)').length;
  const delayed = vehicles.filter(v => v.status === 'Em Atraso').length;
  const completed = 42;

  const getStatusDotClass = (color: string) => {
    const colors = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      gray: 'bg-gray-400'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-400';
  };

  const getRiscoColor = (risco: string) => {
    const riskMap: Record<string, string> = {
      'A+': 'bg-green-100 text-green-800 border-green-300',
      'A': 'bg-green-100 text-green-800 border-green-300',
      'B': 'bg-blue-100 text-blue-800 border-blue-300',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'D': 'bg-orange-100 text-orange-800 border-orange-300',
      'F': 'bg-red-100 text-red-800 border-red-300'
    };
    return riskMap[risco] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getAlertColor = (severidade?: 'info' | 'warning' | 'critical') => {
    if (!severidade) return '';
    const colors = {
      info: 'border-blue-500 bg-blue-50',
      warning: 'border-yellow-500 bg-yellow-50',
      critical: 'border-red-500 bg-red-50'
    };
    return colors[severidade];
  };

  const openGoogleMaps = (vehicle: VehicleData) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${vehicle.posicao.lat},${vehicle.posicao.lng}&destination=${encodeURIComponent(vehicle.destino)}`;
    window.open(url, '_blank');
    toast.success('Abrindo Google Maps...');
  };

  useEffect(() => {
    if (filteredVehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(filteredVehicles[0]);
    }
  }, []);

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Sidebar Esquerda - Lista de Veículos */}
        {!isTvMode && (
          <aside className="w-80 bg-card shadow-lg flex flex-col rounded-lg border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Frota Ativa</h2>
              <Badge variant="secondary">{vehicles.length}</Badge>
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
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedVehicle?.id === vehicle.id ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-sm">{vehicle.placa}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getRiscoColor(vehicle.riscoJornada)} border`}>
                        {vehicle.riscoJornada}
                      </Badge>
                      <span className={`w-2 h-2 rounded-full ${getStatusDotClass(vehicle.statusColor)}`} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{vehicle.motorista}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{vehicle.status}</span>
                    <span className="font-medium">{vehicle.velocidade} km/h</span>
                  </div>
                </div>
              ))}
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

            {/* Marcadores de Veículos */}
            {filteredVehicles
              .filter(v => v.status !== 'Na Garagem')
              .map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`absolute p-2 rounded-full shadow-lg cursor-pointer transition-transform ${getStatusDotClass(vehicle.statusColor)} ${
                    selectedVehicle?.id === vehicle.id ? 'scale-125 z-20' : 'scale-100 z-10'
                  }`}
                  style={{ 
                    top: `${35 + Math.random() * 30}%`, 
                    left: `${30 + Math.random() * 40}%` 
                  }}
                  onClick={() => setSelectedVehicle(vehicle)}
                  title={`${vehicle.placa} - ${vehicle.motorista}`}
                >
                  <Truck className="text-white h-5 w-5" style={{ transform: 'rotate(270deg)' }} />
                </div>
              ))}
          </div>
        </main>

        {/* Sidebar Direita - Detalhes do Veículo */}
        {!isTvMode && selectedVehicle && (
          <aside className="w-96 bg-card shadow-lg flex flex-col rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="text-xl font-bold">{selectedVehicle.placa}</h3>
              <p className="text-sm text-muted-foreground">{selectedVehicle.motorista}</p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Alerta Preditivo */}
              {selectedVehicle.alertaPreditivo && (
                <div className={`p-3 border-l-4 rounded-r-lg ${getAlertColor(selectedVehicle.alertaPreditivo.severidade)}`}>
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <h4 className="font-bold text-sm">{selectedVehicle.alertaPreditivo.tipo}</h4>
                  </div>
                  <p className="text-sm mb-2">{selectedVehicle.alertaPreditivo.mensagem}</p>
                  <p className="text-sm font-semibold">
                    Ação: <span className="font-normal">{selectedVehicle.alertaPreditivo.acao}</span>
                  </p>
                </div>
              )}

              {/* Status e Velocidade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <p className="text-lg font-medium">{selectedVehicle.status}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Velocidade</label>
                  <p className="text-lg font-medium">{selectedVehicle.velocidade} km/h</p>
                </div>
              </div>

              {/* Dados Operacionais */}
              <Card className="bg-muted/30">
                <CardContent className="p-3 space-y-2">
                  <h4 className="font-semibold text-sm mb-2">Dados da Carga</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Peso</p>
                        <p className="font-medium">{selectedVehicle.peso.toLocaleString('pt-BR')} kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cubagem</p>
                        <p className="font-medium">{selectedVehicle.cubagem} m³</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Valor Frete</p>
                        <p className="font-medium">R$ {selectedVehicle.valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Distância</p>
                        <p className="font-medium">{selectedVehicle.distanciaPercorrida}/{selectedVehicle.distanciaTotal} km</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados Preditivos ML */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Análise Preditiva (ML)</h4>
                    <Badge className={getRiscoColor(selectedVehicle.riscoJornada)}>
                      Risco: {selectedVehicle.riscoJornada}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Custo/km</p>
                      <p className="text-lg font-bold text-blue-700">R$ {selectedVehicle.custoKmPreditivo.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Previsão Chegada</p>
                      <p className="text-lg font-bold text-blue-700">{selectedVehicle.previsaoChegada}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Consumo Previsto</p>
                      <p className="font-medium">{selectedVehicle.consumoCombustivelPrevisto}L</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Custo Total</p>
                      <p className="font-medium">R$ {selectedVehicle.custoTotalPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <hr />

              {/* Origem e Destino */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Origem</label>
                  <p className="text-sm">{selectedVehicle.origem}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Destino</label>
                  <p className="text-sm">{selectedVehicle.destino}</p>
                </div>

                <Button 
                  onClick={() => openGoogleMaps(selectedVehicle)}
                  className="w-full"
                  variant="outline"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Abrir no Google Maps
                </Button>
              </div>

              {/* Progresso */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Progresso da Viagem
                </label>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all" 
                    style={{ width: `${selectedVehicle.progresso}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{selectedVehicle.progresso}%</p>
              </div>
            </div>

            {/* Macros */}
            <div className="p-4 border-t bg-muted/30">
              <h4 className="text-sm font-semibold mb-3">Últimas Macros</h4>
              <div className="space-y-2">
                {selectedVehicle.macros.map((macro, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded-md bg-background">
                    <span className="text-sm">{macro.event}</span>
                    <span className="text-xs text-muted-foreground">{macro.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </Layout>
  );
};

export default LiveTracking;
