import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MapPin, DollarSign, Fuel, Package, TrendingUp, Route } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RouteFinancial {
  session: any;
  ctes: any[];
  refuelings: any[];
  totalRevenue: number;
  totalFuel: number;
  netValue: number;
}

export const DriverRouteFinancial = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<RouteFinancial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRouteFinancials();
  }, [user]);

  const loadRouteFinancials = async () => {
    if (!user) return;

    // Buscar sessões finalizadas com trip_id
    const { data: sessions } = await supabase
      .from('driver_work_sessions')
      .select('*')
      .eq('driver_id', user.id)
      .eq('status', 'finalizada')
      .not('trip_id', 'is', null)
      .order('data_inicio', { ascending: false })
      .limit(20);

    if (!sessions) {
      setLoading(false);
      return;
    }

    // Para cada sessão, buscar CTEs e abastecimentos relacionados
    const routeFinancials: RouteFinancial[] = [];

    for (const session of sessions) {
      // Buscar CTEs da viagem
      const { data: ctes } = await supabase
        .from('cte')
        .select('*')
        .eq('trip_id', session.trip_id);

      // Buscar abastecimentos da sessão
      const { data: refuelings } = await supabase
        .from('refuelings')
        .select('*')
        .eq('driver_id', user.id)
        .gte('timestamp', session.data_inicio)
        .lte('timestamp', session.data_fim || new Date().toISOString());

      const totalRevenue = ctes?.reduce((sum, cte) => sum + Number(cte.valor_total), 0) || 0;
      const totalFuel = refuelings?.reduce((sum, ref) => sum + Number(ref.total_value), 0) || 0;
      const netValue = totalRevenue - totalFuel;

      routeFinancials.push({
        session,
        ctes: ctes || [],
        refuelings: refuelings || [],
        totalRevenue,
        totalFuel,
        netValue,
      });
    }

    setRoutes(routeFinancials);
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getRouteOriginDestination = (ctes: any[]) => {
    if (ctes.length === 0) return { origin: 'N/A', destination: 'N/A' };
    
    const firstCte = ctes[0];
    const lastCte = ctes[ctes.length - 1];
    
    return {
      origin: `${firstCte.remetente_cidade}/${firstCte.remetente_uf}`,
      destination: `${lastCte.destinatario_cidade}/${lastCte.destinatario_uf}`
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Rotas & Financeiro
          </CardTitle>
          <Badge variant="outline">Últimas 20 viagens</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando rotas...
            </div>
          ) : routes.length > 0 ? (
            <div className="space-y-4">
              {routes.map((route, index) => {
                const { origin, destination } = getRouteOriginDestination(route.ctes);
                
                return (
                  <div
                    key={route.session.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">Viagem #{routes.length - index}</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            <strong>Origem:</strong> {origin}
                          </p>
                          <p className="text-muted-foreground">
                            <strong>Destino:</strong> {destination}
                          </p>
                          <p className="text-muted-foreground">
                            <strong>Veículo:</strong> {route.session.vehicle_plate}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(route.session.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                            {route.session.data_fim && 
                              ` - ${format(new Date(route.session.data_fim), "dd/MM/yyyy", { locale: ptBR })}`
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-muted-foreground">CT-es</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          {route.ctes.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(route.totalRevenue)}
                        </p>
                      </div>

                      <div className="p-3 bg-red-500/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Fuel className="h-4 w-4 text-red-600" />
                          <span className="text-xs text-muted-foreground">Combustível</span>
                        </div>
                        <p className="text-lg font-bold text-red-600">
                          {route.refuelings.length}x
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(route.totalFuel)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-semibold">Valor Líquido</span>
                      </div>
                      <span className={`text-lg font-bold ${route.netValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(route.netValue)}
                      </span>
                    </div>

                    {route.ctes.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">CT-es desta rota:</p>
                        <div className="space-y-1">
                          {route.ctes.map((cte) => (
                            <div key={cte.id} className="text-xs p-2 bg-muted/30 rounded">
                              <span className="font-mono">{cte.numero_cte}</span>
                              {' - '}
                              <span className="text-muted-foreground">
                                {cte.remetente_cidade}/{cte.remetente_uf} → {cte.destinatario_cidade}/{cte.destinatario_uf}
                              </span>
                              {' - '}
                              <span className="font-semibold">{formatCurrency(cte.valor_total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma rota com dados financeiros encontrada</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
