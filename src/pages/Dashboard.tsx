import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MapboxTracker } from "@/components/maps/MapboxTracker";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {

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

        {/* Mapa de Rastreamento */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <MapboxTracker vehicles={vehicles} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
