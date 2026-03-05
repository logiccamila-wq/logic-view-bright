import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Package, Truck, MapPin, Clock, CheckCircle, AlertCircle, Navigation } from "lucide-react";
import { TripCreationDialog } from "./TripCreationDialog";
import { toast } from "sonner";

interface CTEData {
  id: string;
  numero_cte: string;
  remetente_nome: string;
  remetente_cidade: string;
  remetente_uf: string;
  destinatario_nome: string;
  destinatario_cidade: string;
  destinatario_uf: string;
  produto_predominante: string;
  peso_bruto: number;
  valor_total: number;
  placa_veiculo: string;
  status: string;
  trip_id: string | null;
}

interface TripData {
  id: string;
  origin: string;
  destination: string;
  driver_id: string;
  vehicle_plate: string;
  status: string;
  estimated_departure: string;
  estimated_arrival: string;
  notes: string | null;
  created_at: string;
  driver?: {
    full_name: string;
    email: string;
  };
  ctes?: CTEData[];
}

export const TripManagement = () => {
  const [availableCTEs, setAvailableCTEs] = useState<CTEData[]>([]);
  const [activeTrips, setActiveTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCTE, setSelectedCTE] = useState<CTEData | null>(null);
  const [showTripDialog, setShowTripDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadAvailableCTEs(), loadActiveTrips()]);
    setLoading(false);
  };

  const loadAvailableCTEs = async () => {
    const { data, error } = await supabase
      .from('cte')
      .select('*')
      .is('trip_id', null)
      .in('status', ['emitido', 'autorizado'])
      .order('data_emissao', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar CT-es disponíveis');
      return;
    }

    setAvailableCTEs(data || []);
  };

  const loadActiveTrips = async () => {
    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        *,
        profiles:driver_id (full_name, email)
      `)
      .in('status', ['aprovada', 'em_andamento', 'planejada'])
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar viagens');
      return;
    }

    // Carregar CT-es de cada viagem
    const tripsWithCTEs = await Promise.all(
      (trips || []).map(async (trip) => {
        const { data: ctes } = await supabase
          .from('cte')
          .select('*')
          .eq('trip_id', trip.id);

        return {
          ...trip,
          driver: Array.isArray(trip.profiles) ? trip.profiles[0] : trip.profiles,
          ctes: ctes || []
        };
      })
    );

    setActiveTrips(tripsWithCTEs);
  };

  const handleCreateTrip = (cte: CTEData) => {
    setSelectedCTE(cte);
    setShowTripDialog(true);
  };

  const handleTripCreated = () => {
    setShowTripDialog(false);
    setSelectedCTE(null);
    loadData();
    toast.success('Viagem criada! O motorista já pode visualizar no app.');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planejada: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      aprovada: 'bg-green-500/20 text-green-600 border-green-500/30',
      em_andamento: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
      concluida: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-600';
  };

  const calculateDistance = (origin: string, destination: string) => {
    // Simulação - em produção usar API de mapas
    return Math.floor(Math.random() * 800) + 200;
  };

  return (
    <>
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="gap-2">
            <Package className="h-4 w-4" />
            CT-es Disponíveis
            {availableCTEs.length > 0 && (
              <Badge variant="secondary" className="ml-2">{availableCTEs.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <Truck className="h-4 w-4" />
            Viagens Ativas
            {activeTrips.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeTrips.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">CT-es Aguardando Alocação</h3>
              <p className="text-sm text-muted-foreground">
                Selecione um CT-e para criar uma viagem
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando CT-es...
            </div>
          ) : availableCTEs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="font-semibold text-lg mb-2">Nenhum CT-e disponível</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Todos os CT-es emitidos já foram alocados para viagens ou não há CT-es cadastrados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {availableCTEs.map((cte) => (
                <Card key={cte.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          CT-e {cte.numero_cte}
                        </CardTitle>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                          {cte.status === 'emitido' ? 'Emitido' : 'Autorizado'}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => handleCreateTrip(cte)}
                        className="bg-gradient-to-r from-primary to-primary/80"
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Criar Viagem
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Rota */}
                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{cte.remetente_nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {cte.remetente_cidade}/{cte.remetente_uf}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pl-2">
                        <div className="h-8 w-px bg-gradient-to-b from-green-600 to-red-600" />
                        <span className="text-xs text-muted-foreground">
                          ~{calculateDistance(cte.remetente_cidade, cte.destinatario_cidade)} km
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{cte.destinatario_nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {cte.destinatario_cidade}/{cte.destinatario_uf}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes da Carga */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-primary/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">Produto</p>
                        <p className="font-semibold text-sm truncate">{cte.produto_predominante}</p>
                      </div>
                      <div className="p-2 bg-primary/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">Veículo Sugerido</p>
                        <p className="font-semibold text-sm font-mono">{cte.placa_veiculo}</p>
                      </div>
                      <div className="p-2 bg-primary/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">Peso</p>
                        <p className="font-semibold text-sm">{cte.peso_bruto.toLocaleString('pt-BR')} kg</p>
                      </div>
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Valor</p>
                        <p className="font-semibold text-sm text-green-600">
                          R$ {cte.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Viagens em Operação</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe todas as viagens planejadas e em andamento
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando viagens...
            </div>
          ) : activeTrips.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Truck className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="font-semibold text-lg mb-2">Nenhuma viagem ativa</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Crie viagens a partir dos CT-es disponíveis para começar o acompanhamento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeTrips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" />
                            {trip.origin} → {trip.destination}
                          </CardTitle>
                          <Badge className={getStatusColor(trip.status)}>
                            {trip.status === 'planejada' ? 'Planejada' :
                             trip.status === 'aprovada' ? 'Aprovada' :
                             trip.status === 'em_andamento' ? 'Em Andamento' : 'Concluída'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            {trip.vehicle_plate}
                          </span>
                          {trip.driver && (
                            <span className="flex items-center gap-1">
                              👤 {trip.driver.full_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Partida Prevista</p>
                        <p className="font-semibold text-sm flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(trip.estimated_departure).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Chegada Prevista</p>
                        <p className="font-semibold text-sm flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(trip.estimated_arrival).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* CT-es Vinculados */}
                    {trip.ctes && trip.ctes.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          CT-es Vinculados ({trip.ctes.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {trip.ctes.map((cte) => (
                            <div key={cte.id} className="p-2 bg-primary/5 rounded border border-primary/20">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-semibold">{cte.numero_cte}</span>
                                <Badge variant="outline" className="text-xs">
                                  R$ {cte.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {cte.produto_predominante}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {trip.notes && (
                      <div className="p-2 bg-blue-500/5 rounded border border-blue-500/20">
                        <p className="text-xs text-muted-foreground">Observações</p>
                        <p className="text-sm">{trip.notes}</p>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        <Navigation className="mr-2 h-4 w-4" />
                        Ver Rastreamento
                      </Button>
                      {trip.status === 'planejada' && (
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700" 
                          size="sm"
                          onClick={async () => {
                            await supabase
                              .from('trips')
                              .update({ status: 'aprovada' })
                              .eq('id', trip.id);
                            loadData();
                            toast.success('Viagem aprovada!');
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TripCreationDialog
        open={showTripDialog}
        onOpenChange={setShowTripDialog}
        cte={selectedCTE}
        onTripCreated={handleTripCreated}
      />
    </>
  );
};
