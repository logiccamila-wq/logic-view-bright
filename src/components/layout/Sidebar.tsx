import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Truck, 
  Package, 
  Users, 
  Wrench, 
  BarChart3, 
  Shield, 
  Activity, 
  Database, 
  Leaf, 
  Wifi,
  ShoppingBag,
  Menu,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  // Iniciar sempre expandida (false = expandida, true = collapsed)
  const [collapsed, setCollapsed] = useState(false);
  const { canAccessModule } = useAuth();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
    { href: "/control-tower", label: "Torre de Controle", icon: Shield, module: "control-tower" },
    
    // Módulos Core de Sistema
    { href: "/erp", label: "ERP", icon: BarChart3, module: "erp" },
    { href: "/eip", label: "EIP", icon: Package, module: "eip" },
    { href: "/crm", label: "CRM", icon: Users, module: "crm" },
    { href: "/tms", label: "TMS", icon: Truck, module: "tms" },
    { href: "/wms", label: "WMS", icon: Package, module: "wms" },
    { href: "/oms", label: "OMS", icon: Activity, module: "oms" },
    { href: "/scm", label: "SCM", icon: Package, module: "scm" },
    
    // Gestão Operacional
    { href: "/fleet", label: "Gestão de Frota", icon: Truck, module: "fleet" },
    { href: "/drivers-management", label: "Gestão de Motoristas", icon: Users, module: "fleet" },
    { href: "/journey-management", label: "Gestão Jornadas", icon: Activity, module: "fleet" },
    { href: "/approvals", label: "Aprovações", icon: Shield, module: "approvals" },
    
    // Apps e Ferramentas
    { href: "/driver", label: "App Motorista", icon: Truck, module: "driver" },
    { href: "/mechanic", label: "Hub Mecânico", icon: Wrench, module: "mechanic" },
    { href: "/inventory", label: "Estoque/Oficina", icon: Package, module: "inventory" },
    
    // Análises e Gestão
    { href: "/supergestor", label: "Supergestor", icon: BarChart3, module: "operations" },
    { href: "/predictive-maintenance", label: "Manutenção Preditiva", icon: Activity, module: "maintenance" },
    { href: "/logistics-kpi", label: "KPIs de Logística", icon: BarChart3, module: "operations" },
    { href: "/cost-monitoring", label: "Monitoramento de Custos", icon: BarChart3, module: "finance" },
    
    // Financeiro
    { href: "/bank-reconciliation", label: "Conciliação Bancária", icon: BarChart3, module: "finance" },
    { href: "/accounts-payable", label: "Contas a Pagar", icon: BarChart3, module: "finance" },
    { href: "/accounts-receivable", label: "Contas a Receber", icon: BarChart3, module: "finance" },
    { href: "/dre", label: "DRE", icon: BarChart3, module: "finance" },
    
    // Admin e Configurações
    { href: "/employees", label: "Funcionários", icon: Users, module: "operations" },
    { href: "/users", label: "Usuários", icon: Users, module: "users" },
    { href: "/permissions", label: "Permissões", icon: Shield, module: "settings" },
    { href: "/documents", label: "Documentos", icon: Database, module: "documents" },
    { href: "/reports", label: "Relatórios", icon: BarChart3, module: "reports" },
    
    // Inovação e Tecnologia
    { href: "/innovation", label: "Innovation Lab", icon: Leaf, module: "innovation" },
    { href: "/esg", label: "ESG", icon: Leaf, module: "operations" },
    { href: "/iot", label: "IoT", icon: Wifi, module: "iot" },
    { href: "/developer", label: "Developer", icon: Database, module: "developer" },
    
    // Outros
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag, module: "operations" },
    { href: "/gate", label: "Portaria", icon: Shield, module: "operations" },
  ];

  const visibleItems = menuItems.filter((item) => !item.module || canAccessModule(item.module));

  return (
    <div className={cn(
      "pb-12 border-r bg-background h-screen sticky top-0 transition-all duration-300 flex-shrink-0",
      collapsed ? "w-16" : "w-64 md:w-64",
      className
    )}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-4 px-4">
            {!collapsed && (
              <h2 className="text-lg font-bold tracking-tight text-primary flex items-center gap-2">
                <Zap className="h-5 w-5" />
                XYZLogicFlow
              </h2>
            )}
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="ml-auto">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)] px-1">
            <div className="space-y-1">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                >
                  <Button
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", collapsed ? "px-2 justify-center" : "")}
                  >
                    <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
