import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Eye, Edit, MapPin, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Driver {
  id: string;
  full_name: string;
  cpf: string;
  email: string;
  telefone: string;
  cidade: string;
  tipo_vinculo: string;
  created_at: string;
}

interface TripHistory {
  id: string;
  origem: string;
  destino: string;
  status: string;
  data_inicio: string;
  data_fim: string;
}

const DriversManagement = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [searchTerm, drivers]);

  const loadDrivers = async () => {
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;

      setDrivers(profilesData || []);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      toast.error('Erro ao carregar motoristas');
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    if (!searchTerm) {
      setFilteredDrivers(drivers);
      return;
    }

    const filtered = drivers.filter(
      (driver) =>
        driver.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.cpf?.includes(searchTerm) ||
        driver.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDrivers(filtered);
  };

  const loadTripHistory = async (driverId: string) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTripHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de viagens');
    }
  };

  const handleViewDetails = async (driver: Driver) => {
    setSelectedDriver(driver);
    await loadTripHistory(driver.id);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'concluida': 'bg-green-500',
      'em_andamento': 'bg-blue-500',
      'aprovada': 'bg-yellow-500',
      'cancelada': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'concluida': 'Concluída',
      'em_andamento': 'Em Andamento',
      'aprovada': 'Aprovada',
      'cancelada': 'Cancelada',
    };
    return labels[status] || status;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Motoristas</h1>
            <p className="text-muted-foreground">Gerencie motoristas, viagens e jornadas</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Motorista
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Motoristas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{drivers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Viagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Violações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">2</div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Motoristas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Vínculo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Nenhum motorista encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.full_name || '-'}</TableCell>
                        <TableCell>{driver.cpf || '-'}</TableCell>
                        <TableCell>{driver.email}</TableCell>
                        <TableCell>{driver.telefone || '-'}</TableCell>
                        <TableCell>{driver.cidade || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{driver.tipo_vinculo || 'CLT'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(driver)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Detalhes do Motorista</DialogTitle>
                              </DialogHeader>
                              
                              <Tabs defaultValue="info">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="info">Informações</TabsTrigger>
                                  <TabsTrigger value="trips">Histórico de Viagens</TabsTrigger>
                                  <TabsTrigger value="journey">Jornada</TabsTrigger>
                                </TabsList>

                                <TabsContent value="info" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Nome Completo</Label>
                                      <p className="text-sm font-medium">{selectedDriver?.full_name || '-'}</p>
                                    </div>
                                    <div>
                                      <Label>CPF</Label>
                                      <p className="text-sm font-medium">{selectedDriver?.cpf || '-'}</p>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <p className="text-sm font-medium">{selectedDriver?.email}</p>
                                    </div>
                                    <div>
                                      <Label>Telefone</Label>
                                      <p className="text-sm font-medium">{selectedDriver?.telefone || '-'}</p>
                                    </div>
                                    <div>
                                      <Label>Cidade</Label>
                                      <p className="text-sm font-medium">{selectedDriver?.cidade || '-'}</p>
                                    </div>
                                    <div>
                                      <Label>Tipo de Vínculo</Label>
                                      <p className="text-sm font-medium">{selectedDriver?.tipo_vinculo || 'CLT'}</p>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="trips">
                                  <div className="space-y-2">
                                    {tripHistory.length === 0 ? (
                                      <p className="text-center text-muted-foreground py-8">
                                        Nenhuma viagem registrada
                                      </p>
                                    ) : (
                                      <div className="space-y-2">
                                        {tripHistory.map((trip) => (
                                          <Card key={trip.id}>
                                            <CardContent className="p-4">
                                              <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                  <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{trip.origem}</span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className="font-medium">{trip.destino}</span>
                                                  </div>
                                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(trip.data_inicio).toLocaleDateString('pt-BR')}
                                                  </div>
                                                </div>
                                                <Badge className={getStatusColor(trip.status)}>
                                                  {getStatusLabel(trip.status)}
                                                </Badge>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>

                                <TabsContent value="journey">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                      <Card>
                                        <CardContent className="p-4">
                                          <div className="text-sm text-muted-foreground">Horas Trabalhadas</div>
                                          <div className="text-2xl font-bold">184h</div>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardContent className="p-4">
                                          <div className="text-sm text-muted-foreground">Horas Extras</div>
                                          <div className="text-2xl font-bold text-orange-600">12h</div>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardContent className="p-4">
                                          <div className="text-sm text-muted-foreground">Violações</div>
                                          <div className="text-2xl font-bold text-red-600">2</div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Dados do mês atual
                                    </p>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DriversManagement;
