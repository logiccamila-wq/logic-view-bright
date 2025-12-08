import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, AlertCircle, CheckCircle, Clock, ArrowRight, Wrench } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { canAccessModule, roles, loading } = useAuth();

  // Redirecionar mecânicos que tentam acessar o dashboard
  useEffect(() => {
    if (loading) return;
    
    const onlyMechanic = roles.length > 0 && roles.every(r => 
      r === 'fleet_maintenance' || r === 'maintenance_assistant'
    );
    
    if (onlyMechanic) {
      navigate('/mechanic', { replace: true });
    }
  }, [roles, loading, navigate]);


  // Buscar veículos ativos
  const { data: vehicles = [] } = useQuery({
    queryKey: ['active-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'Ativo')
        .limit(50);
      
      if (error) throw error;
      
      // Transformar para o formato do mapa
      return (data || []).map((v: any) => ({
        id: v.id,
        placa: v.plate,
        posicao: {
          lat: -8.1137 + (Math.random() - 0.5) * 0.5, // Região de Recife
          lng: -34.9005 + (Math.random() - 0.5) * 0.5
        },
        status: v.status,
        statusColor: v.status === 'Ativo' ? 'green' : 'gray'
      }));
    }
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard Geral</h1>
          <p className="text-base text-muted-foreground">
            Visão geral da operação logística e indicadores de performance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Veículos Ativos" 
            value="24" 
            icon={Truck}
            trend={{ value: "+2 esta semana", positive: true }}
          />
          <StatCard 
            title="Ordens Pendentes" 
            value="12" 
            icon={AlertCircle}
          />
          <StatCard 
            title="Entregas Hoje" 
            value="38" 
            icon={CheckCircle}
            trend={{ value: "+15%", positive: true }}
          />
          <StatCard 
            title="Horas Trabalhadas" 
            value="1.2k" 
            icon={Clock}
          />
        </div>

        {/* Acesso Rápido aos Principais Módulos */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card App Motorista */}
          <Card 
            className="border border-info/20 bg-gradient-to-br from-info/5 to-info/10 hover:border-info/40 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/driver')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-info w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                  <Truck className="w-6 h-6 text-info-foreground" />
                </div>
                <ArrowRight className="w-5 h-5 text-info group-hover:translate-x-1 transition-transform" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-foreground">App Motorista</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gerencie viagens, check-lists e ganhos em tempo real
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-info/15 text-info border border-info/20">Check-in/out</span>
                <span className="text-xs px-3 py-1 rounded-full bg-info/15 text-info border border-info/20">Rotas</span>
                <span className="text-xs px-3 py-1 rounded-full bg-info/15 text-info border border-info/20">Financeiro</span>
              </div>
            </CardContent>
          </Card>

          {/* Card Hub Mecânico */}
          <Card 
            className="border border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 hover:border-accent/40 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/mechanic')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-accent w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                  <Wrench className="w-6 h-6 text-accent-foreground" />
                </div>
                <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-foreground">Hub Mecânico</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Controle ordens de serviço, manutenções e TPMS
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/20">O.S.</span>
                <span className="text-xs px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/20">Manutenção</span>
                <span className="text-xs px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/20">Pneus</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de Rastreamento - Temporariamente Desabilitado */}
        <Card className="overflow-hidden">
          <CardContent className="p-6 text-center">
            <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Rastreamento Temporariamente Desabilitado</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Sistema em testes. Acesse o módulo de Rastreamento para ver veículos.
            </p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/live-tracking')}>Abrir Live Tracking</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
