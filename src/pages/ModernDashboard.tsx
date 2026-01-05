import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { 
  Truck, Users, DollarSign, Package, TrendingUp, ArrowRight, 
  Clock, AlertCircle, CheckCircle, MapPin, Wrench, BarChart3,
  Zap, Target, Award, Activity
} from "lucide-react";
import { 
  StatCard, 
  PageHeader, 
  Section, 
  ModernCard,
  MetricCard 
} from "@/components/ui/modern-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ModernDashboard = () => {
  const navigate = useNavigate();
  const { canAccessModule, roles, loading, user } = useAuth();

  // Redirecionar mecânicos
  useEffect(() => {
    if (loading) return;
    const onlyMechanic = roles.length > 0 && roles.every(r => 
      r === 'fleet_maintenance' || r === 'maintenance_assistant'
    );
    if (onlyMechanic) {
      navigate('/mechanic', { replace: true });
    }
  }, [roles, loading, navigate]);

  // Buscar dados para o dashboard
  const { data: vehicles = [] } = useQuery({
    queryKey: ['active-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'Ativo')
        .limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['active-trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'Em Andamento')
        .limit(20);
      if (error) throw error;
      return data || [];
    }
  });

  const quickActions = [
    { icon: Truck, label: "Gestão de Frota", path: "/fleet", color: "blue" as const },
    { icon: MapPin, label: "Rastreamento", path: "/live-tracking", color: "green" as const },
    { icon: Users, label: "Motoristas", path: "/drivers-management", color: "purple" as const },
    { icon: BarChart3, label: "Relatórios", path: "/reports", color: "orange" as const },
  ];

  const moduleCards = [
    {
      title: "TMS - Transporte",
      description: "Gestão completa de fretes e viagens",
      icon: Truck,
      path: "/tms",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "WMS - Armazém",
      description: "Controle de estoque e inventário",
      icon: Package,
      path: "/wms",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "CRM - Clientes",
      description: "Relacionamento e vendas",
      icon: Users,
      path: "/crm",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "DRE Financeiro",
      description: "Análise de resultados",
      icon: DollarSign,
      path: "/dre",
      color: "from-orange-500 to-red-500"
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title={`Bem-vindo, ${user?.email?.split('@')[0] || 'Usuário'}!`}
          description="Aqui está um resumo da sua operação em tempo real"
          action={
            <Button onClick={() => navigate('/control-tower')} className="gap-2">
              <Target className="h-4 w-4" />
              Torre de Controle
            </Button>
          }
        />

        {/* KPI Cards */}
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Veículos Ativos"
              value={vehicles.length || 0}
              description="Em operação agora"
              icon={Truck}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Viagens Ativas"
              value={trips.length || 0}
              description="Em andamento"
              icon={MapPin}
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Taxa de Entregas"
              value="98.5%"
              description="No prazo este mês"
              icon={CheckCircle}
              trend={{ value: 2.5, isPositive: true }}
            />
            <StatCard
              title="Receita Mensal"
              value="R$ 1.2M"
              description="vs. R$ 980k mês anterior"
              icon={TrendingUp}
              trend={{ value: 22, isPositive: true }}
            />
          </div>
        </Section>

        {/* Quick Actions */}
        <Section title="Ações Rápidas">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <ModernCard 
                key={idx} 
                hover 
                className="cursor-pointer"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full ${
                    action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                    action.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                  }`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <p className="font-semibold">{action.label}</p>
                </CardContent>
              </ModernCard>
            ))}
          </div>
        </Section>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alertas e Notificações */}
          <div className="lg:col-span-2 space-y-6">
            <Section title="Alertas Importantes">
              <ModernCard>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">3 Veículos com Manutenção Atrasada</p>
                      <p className="text-sm text-muted-foreground">Revise o calendário de manutenções preventivas</p>
                      <Button variant="link" className="h-auto p-0 mt-2" onClick={() => navigate('/predictive-maintenance')}>
                        Ver Detalhes <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">42 Entregas Concluídas Hoje</p>
                      <p className="text-sm text-muted-foreground">Todas dentro do prazo estimado</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Eficiência de Combustível: +15%</p>
                      <p className="text-sm text-muted-foreground">Economia de R$ 8.500 este mês</p>
                    </div>
                  </div>
                </CardContent>
              </ModernCard>
            </Section>
          </div>

          {/* Métricas Rápidas */}
          <div className="space-y-6">
            <Section title="Performance">
              <div className="space-y-4">
                <MetricCard
                  label="Motoristas Ativos"
                  value="87"
                  icon={Users}
                  color="blue"
                />
                <MetricCard
                  label="Km Rodados Hoje"
                  value="12.4k"
                  icon={MapPin}
                  color="green"
                />
                <MetricCard
                  label="Manutenções Agendadas"
                  value="15"
                  icon={Wrench}
                  color="orange"
                />
                <MetricCard
                  label="NPS Score"
                  value="92"
                  icon={Award}
                  color="purple"
                />
              </div>
            </Section>
          </div>
        </div>

        {/* Módulos Principais */}
        <Section 
          title="Módulos do Sistema" 
          description="Acesse as funcionalidades principais do XYZLogicFlow"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {moduleCards.map((module, idx) => (
              <ModernCard 
                key={idx}
                hover
                className="group cursor-pointer overflow-hidden"
                onClick={() => navigate(module.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                <CardContent className="p-6 space-y-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color} w-fit`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                </CardContent>
              </ModernCard>
            ))}
          </div>
        </Section>

        {/* Métricas Adicionais */}
        <Section>
          <div className="grid md:grid-cols-3 gap-6">
            <ModernCard gradient>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Produtividade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Eficiência Operacional</span>
                      <span className="text-sm font-bold">94%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Taxa de Utilização</span>
                      <span className="text-sm font-bold">87%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Satisfação Clientes</span>
                      <span className="text-sm font-bold">96%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </ModernCard>

            <ModernCard gradient>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Crescimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Receita MoM</span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">+22%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Novos Clientes</span>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">+18</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Frota Cresceu</span>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">+5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Eficiência</span>
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">+15%</Badge>
                  </div>
                </div>
              </CardContent>
            </ModernCard>

            <ModernCard gradient>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Próximas Ações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-1 bg-primary rounded-full" />
                    <div>
                      <p className="font-medium">Reunião Operacional</p>
                      <p className="text-muted-foreground text-xs">Hoje, 14:00</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1 bg-green-500 rounded-full" />
                    <div>
                      <p className="font-medium">Revisar Relatórios</p>
                      <p className="text-muted-foreground text-xs">Amanhã, 09:00</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1 bg-orange-500 rounded-full" />
                    <div>
                      <p className="font-medium">Manutenção Programada</p>
                      <p className="text-muted-foreground text-xs">Sexta, 10:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          </div>
        </Section>
      </div>
    </Layout>
  );
};

export default ModernDashboard;
