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
  Tv
} from "lucide-react";
import { useState, useEffect } from "react";

interface Vehicle {
  id: string;
  placa: string;
  motorista: string;
  status: 'Em Viagem' | 'Parado (Pausa)' | 'Em Atraso' | 'Na Garagem';
  statusColor: 'green' | 'yellow' | 'red' | 'gray';
  velocidade: number;
  origem: string;
  destino: string;
  progresso: number;
  posicao: { top: string; left: string };
  macros: Array<{ time: string; event: string }>;
}

const mockVehicles: Vehicle[] = [
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
    posicao: { top: '35%', left: '40%' },
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
    posicao: { top: '55%', left: '25%' },
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
    posicao: { top: '20%', left: '30%' },
    macros: [
      { time: '10:30', event: 'Parada Inesperada (Trânsito)' },
      { time: '09:00', event: 'Início da Viagem' }
    ]
  },
  {
    id: '4',
    placa: 'JKL-0D12',
    motorista: 'Beatriz Costa',
    status: 'Na Garagem',
    statusColor: 'gray',
    velocidade: 0,
    origem: 'Garagem',
    destino: 'N/A',
    progresso: 0,
    posicao: { top: '70%', left: '60%' },
    macros: [
      { time: 'Ontem 18:30', event: 'Chegada à Garagem' }
    ]
  },
  {
    id: '5',
    placa: 'MNB-3E45',
    motorista: 'Ricardo Souza',
    status: 'Em Viagem',
    statusColor: 'green',
    velocidade: 90,
    origem: 'CDD Jaboatão dos Guararapes, PE',
    destino: 'Cliente D - Maceió, AL',
    progresso: 60,
    posicao: { top: '80%', left: '45%' },
    macros: [
      { time: '11:00', event: 'Início da Viagem' }
    ]
  }
];

const ControlTowerRedesign = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
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

  useEffect(() => {
    if (filteredVehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(filteredVehicles[0]);
    }
  }, []);

  return (
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
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-sm">{vehicle.placa}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{vehicle.status}</span>
                      <span className={`w-2 h-2 rounded-full ${getStatusDotClass(vehicle.statusColor)}`} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{vehicle.motorista}</p>
                </div>
              ))}
            </nav>

            <div className="p-4 border-t text-xs text-muted-foreground">
              <p>&copy; 2025 EJG Evolução em Transporte</p>
              <p>Status do Sistema: <span className="text-green-500 font-semibold">Online</span></p>
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

            {/* Simulação de Mapa */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <MapPin className="h-64 w-64 text-gray-400" />
            </div>

            {/* Ícones dos veículos no mapa */}
            {filteredVehicles
              .filter(v => v.status !== 'Na Garagem')
              .map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`absolute p-2 rounded-full shadow-lg cursor-pointer transition-transform ${getStatusDotClass(vehicle.statusColor)} ${
                    selectedVehicle?.id === vehicle.id ? 'scale-125 z-20' : 'scale-100 z-10'
                  }`}
                  style={{ top: vehicle.posicao.top, left: vehicle.posicao.left }}
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
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Motorista</label>
                <p className="text-lg font-medium">{selectedVehicle.motorista}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Status Atual</label>
                <p className="text-lg font-medium">{selectedVehicle.status}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Velocidade</label>
                <p className="text-lg font-medium">{selectedVehicle.velocidade} km/h</p>
              </div>

              <hr />

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Origem</label>
                <p className="text-sm">{selectedVehicle.origem}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Destino</label>
                <p className="text-sm">{selectedVehicle.destino}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Progresso da Viagem</label>
                <div className="w-full bg-secondary rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all" 
                    style={{ width: `${selectedVehicle.progresso}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{selectedVehicle.progresso}%</p>
              </div>
            </div>

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
  );
};

export default ControlTowerRedesign;
