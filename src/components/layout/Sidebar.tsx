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
  Zap,
  DollarSign,
  FileText,
  Settings,
  Download,
  TrendingUp,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  module?: string;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { canAccessModule, loading, rolesReady } = useAuth();

  const menuCategories: MenuCategory[] = [
    {
      title: "Principal",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
        { href: "/control-tower", label: "Torre de Controle", icon: Shield, module: "control-tower" },
        { href: "/supergestor", label: "Supergestor IA", icon: Brain, module: "operations" },
      ]
    },
    {
      title: "Sistemas Core",
      items: [
        { href: "/erp", label: "ERP", icon: BarChart3, module: "erp" },
        { href: "/tms", label: "TMS", icon: Truck, module: "tms" },
        { href: "/wms", label: "WMS", icon: Package, module: "wms" },
        { href: "/crm", label: "CRM", icon: Users, module: "crm" },
        { href: "/scm", label: "SCM", icon: TrendingUp, module: "scm" },
      ]
    },
    {
      title: "Gestão Operacional",
      items: [
        { href: "/fleet", label: "Gestão de Frota", icon: Truck, module: "fleet" },
        { href: "/drivers-management", label: "Motoristas", icon: Users, module: "fleet" },
        { href: "/employees", label: "Funcionários", icon: Users, module: "operations" },
        { href: "/journey-management", label: "Jornadas", icon: Activity, module: "fleet" },
        { href: "/predictive-maintenance", label: "Manutenção Preditiva", icon: Activity, module: "maintenance" },
        { href: "/inventory", label: "Estoque/Oficina", icon: Package, module: "inventory" },
      ]
    },
    {
      title: "Financeiro",
      items: [
        { href: "/logistics-kpi", label: "KPIs Logística", icon: BarChart3, module: "operations" },
        { href: "/cost-monitoring", label: "Custos", icon: DollarSign, module: "finance" },
        { href: "/bank-reconciliation", label: "Conciliação Bancária", icon: DollarSign, module: "finance" },
        { href: "/accounts-payable", label: "Contas a Pagar", icon: DollarSign, module: "finance" },
        { href: "/accounts-receivable", label: "Contas a Receber", icon: DollarSign, module: "finance" },
        { href: "/dre", label: "DRE", icon: BarChart3, module: "finance" },
        { href: "/folha-pagamento", label: "Folha Pagamento", icon: DollarSign, module: "finance" },
      ]
    },
    {
      title: "Apps & Ferramentas",
      items: [
        { href: "/driver", label: "App Motorista", icon: Truck, module: "driver" },
        { href: "/mechanic", label: "Hub Mecânico", icon: Wrench, module: "mechanic" },
        { href: "/approvals", label: "Aprovações", icon: Shield, module: "approvals" },
        { href: "/documents", label: "Documentos", icon: FileText, module: "documents" },
        { href: "/export-center", label: "Exportações", icon: Download, module: "reports" },
      ]
    },
    {
      title: "Inovação & Tech",
      items: [
        { href: "/innovation", label: "Innovation Lab", icon: Leaf, module: "innovation" },
        { href: "/iot", label: "IoT", icon: Wifi, module: "iot" },
        { href: "/esg", label: "ESG", icon: Leaf, module: "operations" },
        { href: "/developer", label: "Developer", icon: Database, module: "developer" },
      ]
    },
    {
      title: "Configurações",
      items: [
        { href: "/users", label: "Usuários", icon: Users, module: "users" },
        { href: "/permissions", label: "Permissões", icon: Shield, module: "settings" },
        { href: "/reports", label: "Relatórios", icon: FileText, module: "reports" },
        { href: "/settings", label: "Configurações", icon: Settings, module: "settings" },
      ]
    },
  ];

  return (
    <div className={cn(
      "pb-12 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-screen sticky top-0 transition-all duration-300 flex-shrink-0 z-50",
      collapsed ? "w-16" : "w-64 md:w-72",
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
            <div className="space-y-4">
              {menuCategories.map((category, idx) => {
                 const visibleItems = category.items.filter((item) => {
                   if (!rolesReady || loading) {
                     return true;
                   }

                   return !item.module || canAccessModule(item.module);
                 });
                
                if (visibleItems.length === 0) return null;
                
                return (
                  <div key={idx} className="space-y-1">
                    {!collapsed && (
                      <>
                        <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {category.title}
                        </h3>
                        <Separator className="my-2" />
                      </>
                    )}
                    {visibleItems.map((item) => (
                      <Link key={item.href} to={item.href}>
                        <Button
                          variant={location.pathname === item.href ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            collapsed ? "px-2 justify-center" : "",
                            location.pathname === item.href && "bg-primary/10 text-primary"
                          )}
                          size="sm"
                        >
                          <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </Button>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
