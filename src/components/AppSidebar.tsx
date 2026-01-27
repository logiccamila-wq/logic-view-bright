import {
  LayoutDashboard, 
  Truck, 
  Wrench, 
  User, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Package,
  MapPin,
  ShoppingCart,
  GitBranch,
  UserCheck,
  Building2,
  CheckCircle,
  TowerControl,
  Warehouse,
  Clock,
  ClipboardList,
  Wallet,
  Calculator,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  FileText,
  Code2,
  Sparkles,
  Shield,
  Briefcase,
  TrendingUp,
  Layers,
  Receipt,
  Zap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, module: "dashboard" },
  { title: "Torre de Controle", url: "/control-tower", icon: TowerControl, module: "control-tower" },
  { title: "Torre de Controle (Novo)", url: "/control-tower-new", icon: TowerControl, module: "control-tower" },
  { title: "Rastreamento ao Vivo", url: "/live-tracking", icon: MapPin, module: "fleet" },
  { title: "Gestão de Frota", url: "/fleet", icon: Truck, module: "fleet" },
  { title: "Hub Mecânico", url: "/mechanic", icon: Wrench, module: "mechanic" },
  { title: "App Motorista", url: "/driver", icon: User, module: "driver" },
  { title: "Jornada Motorista", url: "/driver-journey", icon: Clock, module: "driver" },
  { title: "Minhas Gratificações", url: "/driver-payroll", icon: Wallet, module: "driver" },
  { title: "Gestão de Motoristas", url: "/drivers-management", icon: Users, module: "fleet" },
  { title: "Gestão Jornadas", url: "/journey-management", icon: ClipboardList, module: "fleet" },
  { title: "Folha de Pagamento", url: "/payroll-management", icon: Calculator, module: "fleet" },
];

const managementItems = [
  { title: "Aprovações", url: "/approvals", icon: CheckCircle, module: "approvals" },
  { title: "Estoque", url: "/inventory", icon: Package, module: "inventory" },
  { title: "Funcionários", url: "/employees", icon: Briefcase, module: "fleet" },
  { title: "Sócios", url: "/partners", icon: Users, module: "finance" },
  { title: "Centros de Custo", url: "/centros-custo", icon: Layers, module: "finance" },
  { title: "Plano de Contas", url: "/plano-contas", icon: Receipt, module: "finance" },
  { title: "Lançamentos", url: "/lancamentos", icon: FileText, module: "finance" },
  { title: "Conciliação Bancária", url: "/bank-reconciliation", icon: Wallet, module: "finance" },
  { title: "Contas a Pagar", url: "/accounts-payable", icon: ArrowDownCircle, module: "finance" },
  { title: "Contas a Receber", url: "/accounts-receivable", icon: ArrowUpCircle, module: "finance" },
  { title: "Folha de Pagamento", url: "/folha-pagamento", icon: Calculator, module: "fleet" },
  { title: "DRE", url: "/dre", icon: TrendingUp, module: "finance" },
  { title: "Monitoramento de Custos", url: "/cost-monitoring", icon: DollarSign, module: "finance" },
  { title: "Documentos", url: "/documents", icon: FileText, module: "documents" },
  { title: "Usuários", url: "/users", icon: Users, module: "users" },
  { title: "Permissões", url: "/permissions", icon: Shield, module: "settings" },
  { title: "Relatórios", url: "/reports", icon: BarChart3, module: "reports" },
  { title: "Relatório Executivo", url: "/executive-report", icon: BarChart3, module: "reports" },
  { title: "Configurações", url: "/settings", icon: Settings, module: "settings" },
];

const modulesItems = [
  { title: "WMS", url: "/wms", icon: Warehouse, module: "wms" },
  { title: "TMS", url: "/tms", icon: MapPin, module: "tms" },
  { title: "OMS", url: "/oms", icon: ShoppingCart, module: "oms" },
  { title: "SCM", url: "/scm", icon: GitBranch, module: "scm" },
  { title: "CRM", url: "/crm", icon: UserCheck, module: "crm" },
  { title: "ERP", url: "/erp", icon: Building2, module: "erp" },
  { title: "EIP", url: "/eip", icon: GitBranch, module: "eip" },
  { title: "Innovation Lab", url: "/innovation", icon: Sparkles, module: "innovation" },
  { title: "Developer", url: "/developer", icon: Code2, module: "developer" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { canAccessModule, signOut, user, hasRole, loading } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  
  // Se for APENAS motorista (sem outras roles), mostrar apenas App Motorista
  const isOnlyDriver = hasRole('driver') && !hasRole('admin') && !hasRole('logistics_manager') && !hasRole('operations') && !hasRole('finance') && !hasRole('commercial') && !hasRole('fleet_maintenance') && !hasRole('maintenance_assistant') && !hasRole('maintenance_manager');
  
  const driverItems = [
    { title: "App Motorista", url: "/driver", icon: User, module: "driver" },
  ];
  
  // Filter items based on permissions
  const filteredMainItems = isOnlyDriver 
    ? driverItems.filter(item => canAccessModule(item.module))
    : mainItems.filter(item => canAccessModule(item.module));
  const filteredManagementItems = isOnlyDriver ? [] : managementItems.filter(item => canAccessModule(item.module));
  const filteredModulesItems = isOnlyDriver ? [] : modulesItems.filter(item => canAccessModule(item.module));

  // 🔄 Mostrar loading state
  if (loading) {
    return (
      <Sidebar className={collapsed ? "w-14" : "w-64"}>
        <SidebarContent className="bg-sidebar border-r border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              {!collapsed && (
                <span className="font-bold text-lg text-foreground">XYZLogicFlow</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Log de debug
  const isDev = import.meta.env.DEV;
  if (isDev) {
    console.log('🎨 [AppSidebar] Renderizando com:', {
      user: user?.email,
      loading,
      filteredMainItems: filteredMainItems.length,
      filteredManagementItems: filteredManagementItems.length,
      filteredModulesItems: filteredModulesItems.length
    });
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent className="bg-sidebar border-r border-border">
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-primary/10 p-1.5 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
             </div>
            {!collapsed && (
              <span className="font-bold text-lg text-foreground">XYZLogicFlow</span>
            )}
          </div>
          {!collapsed && <NotificationBell />}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        {filteredManagementItems.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
              Gestão
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-muted/50 transition-colors"
                        activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Módulos Integrados */}
        {filteredModulesItems.length > 0 ? (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
              Módulos
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredModulesItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-muted/50 transition-colors"
                        activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : !collapsed && !loading && (
          <div className="px-4 py-2 text-xs text-muted-foreground">
            ⚠️ Nenhum módulo disponível.
            {user?.email && (
              <div className="mt-1">
                Email: {user.email}
              </div>
            )}
          </div>
        )}

        {/* User info and Logout */}
        <div className="mt-auto p-4 border-t border-border space-y-2">
          {user && !collapsed && (
            <div className="text-xs text-muted-foreground truncate px-2">
              {user.user_metadata?.name || user.user_metadata?.display_name || user.email}
            </div>
          )}
          {user && !collapsed && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={async () => {
                const isDev = import.meta.env.DEV;
                toast.info("Recarregando permissões...");
                if (user?.id) {
                  // Força reload das roles
                  const { data } = await supabase
                    .from("user_roles")
                    .select("*")
                    .eq("user_id", user.id);
                  
                  if (isDev) console.log('🔄 Permissões recarregadas:', data);
                  toast.success("Permissões atualizadas!");
                  window.location.reload();
                }
              }}
            >
              🔄 Recarregar Permissões
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
