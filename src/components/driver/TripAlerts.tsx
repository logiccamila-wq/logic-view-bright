import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MapPin, Clock, Navigation } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export function TripAlerts() {
  const { user } = useAuth();

  const { data: trips, refetch } = useQuery({
    queryKey: ['driver-trips', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          cte(
            destinatario_cidade,
            destinatario_uf,
            remetente_cidade,
            remetente_uf
          )
        `)
        .eq('driver_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleAcceptTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ status: 'in_progress' })
        .eq('id', tripId);

      if (error) throw error;

      toast.success("Viagem aceita!");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao aceitar viagem");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Novas Viagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trips && trips.length > 0 ? (
          trips.map((trip: any) => (
            <Card key={trip.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {trip.vehicle_plate}
                  </Badge>
                  <Badge>
                    {format(new Date(trip.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                  </Badge>
                </div>

                {trip.cte && trip.cte[0] && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-green-600" />
                      <div>
                        <strong>Origem:</strong> {trip.cte[0].remetente_cidade}/{trip.cte[0].remetente_uf}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Navigation className="w-4 h-4 mt-0.5 text-red-600" />
                      <div>
                        <strong>Destino:</strong> {trip.cte[0].destinatario_cidade}/{trip.cte[0].destinatario_uf}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Início previsto: {format(new Date(trip.departure_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>

                <Button 
                  onClick={() => handleAcceptTrip(trip.id)}
                  className="w-full"
                  size="sm"
                >
                  Aceitar Viagem
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma viagem pendente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
