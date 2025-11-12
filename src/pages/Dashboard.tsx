import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Truck, BarChart3, Users } from "lucide-react";

const Dashboard = () => {
  const modules = [
    {
      title: "HUB Central de Serviços",
      description: "Oficina & Posto Interno",
      icon: Wrench,
      color: "bg-purple",
      href: "/mechanic",
    },
    {
      title: "Super App Motorista",
      description: "Gestão completa para motoristas",
      icon: Truck,
      color: "bg-green",
      href: "/driver",
    },
    {
      title: "Gestão de Frota",
      description: "Controle total da frota",
      icon: BarChart3,
      color: "bg-orange",
      href: "/fleet",
    },
    {
      title: "Administração",
      description: "Usuários e permissões",
      icon: Users,
      color: "bg-primary",
      href: "/admin",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Escolha um módulo para começar</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <a key={module.title} href={module.href}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
