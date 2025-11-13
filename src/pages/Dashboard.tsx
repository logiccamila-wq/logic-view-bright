import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Truck, Wrench, Users, BarChart3, ArrowRight, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const Dashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Gestão de Frota",
      description: "Gerencie veículos e rastreamento",
      icon: Truck,
      color: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-600",
      path: "/fleet",
    },
    {
      title: "Hub do Mecânico",
      description: "Ordens de serviço e manutenção",
      icon: Wrench,
      color: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-600",
      path: "/mechanic",
    },
    {
      title: "Super App Motorista",
      description: "App completo para motoristas",
      icon: Users,
      color: "bg-green-500/20 hover:bg-green-500/30 text-green-600",
      path: "/driver",
    },
    {
      title: "Relatórios",
      description: "Análises e métricas detalhadas",
      icon: BarChart3,
      color: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-600",
      path: "/reports",
    },
  ];

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

        {/* Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card
                key={index}
                className="group cursor-pointer transition-all hover:shadow-lg"
                onClick={() => navigate(module.path)}
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-full ${module.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {module.description}
                  </p>
                  <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                    Acessar
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
