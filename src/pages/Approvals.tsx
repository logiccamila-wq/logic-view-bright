import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, MapPin, User, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Trip {
  id: string;
  driver_id: string;
  driver_name: string;
  vehicle_plate: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  estimated_departure: string;
  estimated_arrival: string;
  notes: string;
}

const Approvals = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [rejectedCount, setRejectedCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    loadPendingTrips();
    loadSummaryCounts();
  }, []);

  const loadPendingTrips = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
      setPendingCount((data || []).length);
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
      toast.error('Erro ao carregar viagens pendentes');
    } finally {
      setLoading(false);
    }
  };

  const loadSummaryCounts = async () => {
    try {
      const { count: aprovadasCount, error: aproErr } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aprovada');

      if (aproErr) throw aproErr;
      setApprovedCount(aprovadasCount || 0);

      const { count: rejeitadasCount, error: rejeErr } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelada');

      if (rejeErr) throw rejeErr;
      setRejectedCount(rejeitadasCount || 0);
    } catch (error) {
      console.error('Erro ao carregar contagens:', error);
    }
  };

  const handleApprove = async (trip: Trip) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trips')
        .update({
          status: 'aprovada',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', trip.id);

      if (error) throw error;

      toast.success(`Viagem aprovada: ${trip.origin} → ${trip.destination}`);
      loadPendingTrips();
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao aprovar viagem:', error);
      toast.error('Erro ao aprovar viagem');
    }
  };

  const handleReject = async (trip: Trip) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trips')
        .update({
          status: 'cancelada',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', trip.id);

      if (error) throw error;

      toast.error(`Viagem rejeitada: ${trip.origin} → ${trip.destination}`);
      loadPendingTrips();
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao rejeitar viagem:', error);
      toast.error('Erro ao rejeitar viagem');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pendente: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30" },
      aprovada: { label: "Aprovada", className: "bg-green-500/20 text-green-600 hover:bg-green-500/30" },
      em_andamento: { label: "Em Andamento", className: "bg-blue-500/20 text-blue-600 hover:bg-blue-500/30" },
      concluida: { label: "Concluída", className: "bg-gray-500/20 text-gray-600 hover:bg-gray-500/30" },
      cancelada: { label: "Cancelada", className: "bg-red-500/20 text-red-600 hover:bg-red-500/30" },
    };
    return variants[status] || variants.pendente;
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Central de Aprovações</h1>
          <p className="text-muted-foreground">Gerenciamento de viagens e solicitações</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">Viagens liberadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">Solicitações negadas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Viagens Pendentes de Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhuma viagem pendente</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Origem → Destino</TableHead>
                    <TableHead>Data Solicitação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{trip.driver_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <span>{trip.vehicle_plate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{trip.origin} → {trip.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(trip.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(trip.status).className}>
                          {getStatusBadge(trip.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTrip(trip);
                            setDialogOpen(true);
                          }}
                        >
                          Revisar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revisar Viagem</DialogTitle>
            <DialogDescription>
              Analise os detalhes da viagem antes de aprovar ou rejeitar
            </DialogDescription>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Motorista</p>
                <p className="text-lg font-semibold">{selectedTrip.driver_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Veículo</p>
                <p className="text-lg font-semibold">{selectedTrip.vehicle_plate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rota</p>
                <p className="text-lg font-semibold">{selectedTrip.origin} → {selectedTrip.destination}</p>
              </div>
              {selectedTrip.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Observações</p>
                  <p className="text-sm">{selectedTrip.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => selectedTrip && handleReject(selectedTrip)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rejeitar
            </Button>
            <Button
              onClick={() => selectedTrip && handleApprove(selectedTrip)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Approvals;
