import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Wallet, 
  Calendar,
  MapPin,
  Truck,
  DollarSign,
  CheckCircle,
  Loader2,
  Fuel,
  Receipt,
  ClipboardCheck,
  Bell,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/StatCard";
import { WorkSessionPanel } from "@/components/driver/WorkSessionPanel";
import { DriverJourneyStatus } from "@/components/driver/DriverJourneyStatus";
import { DriverEarnings } from "@/components/driver/DriverEarnings";
import { FuelExpenseDialog } from "@/components/driver/FuelExpenseDialog";
import { TripExpenseDialog } from "@/components/driver/TripExpenseDialog";
import { DriverChecklist } from "@/components/driver/DriverChecklist";
import { TripAlerts } from "@/components/driver/TripAlerts";
import { DriverPerformance } from "@/components/driver/DriverPerformance";
import { DriverPayrollHistory } from "@/components/driver/DriverPayrollHistory";
import { DriverRouteFinancial } from "@/components/driver/DriverRouteFinancial";
import { DeliveryRouting } from "@/components/driver/DeliveryRouting";
import { LiveLocationToggle } from "@/components/driver/LiveLocationToggle";
import GaelChatbot from "@/components/GaelChatbot";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function DriverApp() {
  const { user } = useAuth();

  // Buscar sessão ativa
  const { data: activeSession, isLoading: loadingSession } = useQuery({
    queryKey: ['active-session', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_work_sessions')
        .select('*')
        .eq('driver_id', user?.id)
        .eq('status', 'em_andamento')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Buscar diárias pendentes
  const { data: dailyAllowances, isLoading: loadingAllowances, refetch: refetchAllowances } = useQuery({
    queryKey: ['daily-allowances', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_work_sessions')
        .select('*')
        .eq('driver_id', user?.id)
        .eq('status', 'finalizada')
        .order('data_inicio', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Buscar gratificações do mês
  const { data: monthlyEarnings, isLoading: loadingEarnings } = useQuery({
    queryKey: ['monthly-earnings', user?.id],
    queryFn: async () => {
      const now = new Date();
      const { data, error } = await supabase
        .from('driver_payroll')
        .select('*')
        .eq('driver_id', user?.id)
        .eq('mes', now.getMonth() + 1)
        .eq('ano', now.getFullYear())
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const calculateDailyAllowance = (session: any) => {
    if (!session.data_inicio || !session.data_fim) return 0;
    
    const start = new Date(session.data_inicio);
    const end = new Date(session.data_fim);
    const daysAway = differenceInDays(end, start);
    
    // R$ 80 por dia fora (exemplo)
    return daysAway * 80;
  };

  const handleRequestAllowanceApproval = async (sessionId: string) => {
    try {
      // Aqui você pode criar uma notificação ou registro de solicitação
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user?.id,
          title: 'Solicitação de Diária',
          message: `Motorista solicitou aprovação de diária da viagem ${sessionId}`,
          type: 'info',
          module: 'driver'
        });

      if (error) throw error;

      toast.success('Solicitação enviada!', {
        description: 'Seu pedido de diária foi enviado para aprovação'
      });
      
      refetchAllowances();
    } catch (error) {
      console.error('Erro ao solicitar aprovação:', error);
      toast.error('Erro ao enviar solicitação');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loadingSession || loadingAllowances || loadingEarnings) {
    return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
  }

  const totalPendingAllowances = dailyAllowances
    ?.filter((s: any) => !s.allowance_approved)
    .reduce((sum: number, s: any) => sum + calculateDailyAllowance(s), 0) || 0;

  return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Mobile-friendly */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">🚚 Meu App</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestão completa da sua jornada
          </p>
          <LiveLocationToggle />
        </div>

        {/* KPIs Mobile-friendly */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Status"
            value={activeSession ? "Em Viagem" : "Parado"}
            icon={Truck}
            className="text-sm"
          />
          <StatCard
            title="Mês Atual"
            value={formatCurrency(monthlyEarnings?.total_liquido || 0)}
            icon={Wallet}
            className="text-sm"
          />
          <StatCard
            title="Diárias Pendentes"
            value={dailyAllowances?.filter((s: any) => !s.allowance_approved).length || 0}
            icon={Calendar}
            className="text-sm"
          />
          <StatCard
            title="Diárias R$"
            value={formatCurrency(totalPendingAllowances)}
            icon={DollarSign}
            className="text-sm"
          />
        </div>

        {/* Tabs Mobile-optimized */}
        <Tabs defaultValue="jornada" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 h-auto gap-1">
            <TabsTrigger value="jornada" className="text-xs py-2">
              <Clock className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Jornada</span>
            </TabsTrigger>
            <TabsTrigger value="gratificacao" className="text-xs py-2">
              <Wallet className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Gratificação</span>
            </TabsTrigger>
            <TabsTrigger value="desempenho" className="text-xs py-2">
              <Clock className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Desempenho</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="text-xs py-2">
              <Receipt className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="rotas" className="text-xs py-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Rotas</span>
            </TabsTrigger>
            <TabsTrigger value="diarias" className="text-xs py-2">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Diárias</span>
            </TabsTrigger>
            <TabsTrigger value="despesas" className="text-xs py-2">
              <Fuel className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Despesas</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs py-2">
              <ClipboardCheck className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="viagens" className="text-xs py-2">
              <Bell className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Viagens</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba Jornada */}
          <TabsContent value="jornada" className="space-y-4 mt-4">
            {activeSession && <DriverJourneyStatus />}
            <WorkSessionPanel />
          </TabsContent>

          {/* Aba Gratificação */}
          <TabsContent value="gratificacao" className="space-y-4 mt-4">
            <DriverEarnings />
          </TabsContent>

          {/* Aba Desempenho */}
          <TabsContent value="desempenho" className="space-y-4 mt-4">
            <DriverPerformance />
          </TabsContent>

          {/* Aba Histórico */}
          <TabsContent value="historico" className="space-y-4 mt-4">
            <DriverPayrollHistory />
          </TabsContent>

          {/* Aba Rotas */}
          <TabsContent value="rotas" className="space-y-4 mt-4">
            <Tabs defaultValue="planejamento" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="planejamento">Planejar Rota</TabsTrigger>
                <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              </TabsList>
              <TabsContent value="planejamento" className="mt-4">
                <DeliveryRouting />
              </TabsContent>
              <TabsContent value="financeiro" className="mt-4">
                <DriverRouteFinancial />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Aba Diárias */}
          <TabsContent value="diarias" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Calendar className="w-5 h-5" />
                  Minhas Diárias
                </CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Diárias automáticas baseadas em dias fora da garagem
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {dailyAllowances && dailyAllowances.length > 0 ? (
                  dailyAllowances.map((session: any) => {
                    const daysAway = session.data_fim 
                      ? differenceInDays(new Date(session.data_fim), new Date(session.data_inicio))
                      : 0;
                    const allowanceValue = calculateDailyAllowance(session);

                    return (
                      <Card key={session.id} className="border-l-4 border-l-primary/20">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {session.vehicle_plate}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(session.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                                  {' → '}
                                  {session.data_fim && format(new Date(session.data_fim), 'dd/MM/yyyy', { locale: ptBR })}
                                </span>
                              </div>
                              <p className="text-sm font-medium">
                                {daysAway} {daysAway === 1 ? 'dia' : 'dias'} fora
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">
                                  {formatCurrency(allowanceValue)}
                                </p>
                                <Badge 
                                  variant={session.allowance_approved ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {session.allowance_approved ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Aprovado
                                    </>
                                  ) : (
                                    'Pendente'
                                  )}
                                </Badge>
                              </div>
                              
                              {!session.allowance_approved && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRequestAllowanceApproval(session.id)}
                                  className="text-xs"
                                >
                                  Solicitar
                                </Button>
                              )}
                            </div>
                          </div>

                          {session.localizacao_inicio && (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2 border-t">
                              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">
                                {session.localizacao_inicio.city}, {session.localizacao_inicio.state}
                                {session.localizacao_fim && ` → ${session.localizacao_fim.city}, ${session.localizacao_fim.state}`}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma diária registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Despesas */}
          <TabsContent value="despesas" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <FuelExpenseDialog />
              <TripExpenseDialog />
            </div>
          </TabsContent>

          {/* Aba Checklist */}
          <TabsContent value="checklist" className="space-y-4 mt-4">
            <DriverChecklist />
          </TabsContent>

          {/* Aba Viagens */}
          <TabsContent value="viagens" className="space-y-4 mt-4">
            <TripAlerts />
          </TabsContent>
        </Tabs>

        {/* Chatbot flutuante */}
        <div className="fixed bottom-4 right-4 z-50">
          <GaelChatbot />
        </div>
      </div>
  );
}
