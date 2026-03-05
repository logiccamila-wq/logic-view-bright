import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  ArrowRight,
  BarChart3,
  Shield,
  Package
} from "lucide-react";

export default function ExecutiveDashboard() {
  const modules = [
    {
      title: "Gestão Financeira",
      description: "Visão consolidada do financeiro",
      items: [
        { label: "DRE Executivo", href: "/dre", icon: BarChart3 },
        { label: "Fluxo de Caixa", href: "/bank-reconciliation", icon: DollarSign },
        { label: "Contas a Pagar", href: "/accounts-payable", icon: FileText },
        { label: "Contas a Receber", href: "/accounts-receivable", icon: FileText },
        { label: "KPIs Logística", href: "/logistics-kpi", icon: TrendingUp },
      ],
      color: "bg-blue-500"
    },
    {
      title: "Gestão Operacional",
      description: "Operações e frota em tempo real",
      items: [
        { label: "Torre de Controle", href: "/control-tower", icon: Shield },
        { label: "Gestão de Frota", href: "/fleet", icon: Package },
        { label: "Motoristas", href: "/drivers-management", icon: Users },
        { label: "Manutenção Preditiva", href: "/predictive-maintenance", icon: TrendingUp },
        { label: "Custos Operacionais", href: "/cost-monitoring", icon: DollarSign },
      ],
      color: "bg-green-500"
    },
    {
      title: "Recursos Humanos",
      description: "Gestão de pessoas e folha",
      items: [
        { label: "Funcionários", href: "/employees", icon: Users },
        { label: "Folha de Pagamento", href: "/folha-pagamento", icon: DollarSign },
        { label: "Jornadas", href: "/journey-management", icon: FileText },
        { label: "Aprovações", href: "/approvals", icon: Shield },
      ],
      color: "bg-purple-500"
    },
    {
      title: "Relatórios & Analytics",
      description: "Insights e inteligência de negócios",
      items: [
        { label: "Supergestor IA", href: "/supergestor", icon: TrendingUp },
        { label: "Relatórios Gerenciais", href: "/reports", icon: FileText },
        { label: "Exportar Dados", href: "/export-center", icon: FileText },
        { label: "Innovation Lab", href: "/innovation", icon: TrendingUp },
      ],
      color: "bg-orange-500"
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Executivo</h1>
        <p className="text-muted-foreground">
          Visão integrada de todos os módulos do sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((module, idx) => (
          <Card key={idx}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${module.color}`} />
                <div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {module.items.map((item, itemIdx) => (
                  <Link key={itemIdx} to={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-between group hover:bg-primary/10"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integração entre Módulos</CardTitle>
          <CardDescription>
            Os módulos estão conectados e compartilham dados em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Financeiro ↔ Operacional</h3>
              <p className="text-sm text-muted-foreground">
                Custos de viagens, abastecimentos e manutenções são automaticamente refletidos no DRE e contas a pagar.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">RH ↔ Folha</h3>
              <p className="text-sm text-muted-foreground">
                Dados de funcionários e motoristas integrados com cálculos de folha de pagamento e jornadas.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">IA ↔ Todos os Módulos</h3>
              <p className="text-sm text-muted-foreground">
                Supergestor analisa dados de todos os módulos para fornecer insights preditivos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
