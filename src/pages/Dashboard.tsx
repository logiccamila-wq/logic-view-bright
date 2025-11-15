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

const Dashboard = () => {
  const navigate = useNavigate();
  const { canAccessModule } = useAuth();

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard OptiLog</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao sistema de gestão EJG Evolução em Transporte
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:border-blue-500/40 transition-all duration-300 cursor-pointer group"
            onClick={() => canAccessModule('driver') ? navigate('/driver') : toast.error('Sem permissão para acessar o App Motorista')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">App Motorista</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gerencie viagens, check-lists e ganhos em tempo real
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">Check-in/out</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">Rotas</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">Financeiro</span>
              </div>
            </CardContent>
          </Card>

          {/* Card Hub Mecânico */}
          <Card 
            className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:border-purple-500/40 transition-all duration-300 cursor-pointer group"
            onClick={() => canAccessModule('mechanic') ? navigate('/mechanic') : toast.error('Sem permissão para acessar o Hub Mecânico')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">Hub Mecânico</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Controle ordens de serviço, manutenções e TPMS
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400">O.S.</span>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400">Manutenção</span>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400">Pneus</span>
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
