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

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, module: "dashboard" },
  { title: "Torre de Controle", url: "/control-tower", icon: TowerControl, module: "control-tower" },
  { title: "Gestão de Frota", url: "/fleet", icon: Truck, module: "fleet" },
  { title: "Hub Mecânico", url: "/mechanic", icon: Wrench, module: "mechanic" },
  { title: "App Motorista", url: "/driver", icon: User, module: "driver" },
];

const managementItems = [
  { title: "Aprovações", url: "/approvals", icon: CheckCircle, module: "approvals" },
  { title: "Estoque", url: "/inventory", icon: Package, module: "inventory" },
  { title: "Usuários", url: "/users", icon: Users, module: "users" },
  { title: "Relatórios", url: "/reports", icon: BarChart3, module: "reports" },
  { title: "Configurações", url: "/settings", icon: Settings, module: "settings" },
];

const modulesItems = [
  { title: "WMS", url: "/wms", icon: Warehouse, module: "wms" },
  { title: "TMS", url: "/tms", icon: MapPin, module: "tms" },
  { title: "OMS", url: "/oms", icon: ShoppingCart, module: "oms" },
  { title: "SCM", url: "/scm", icon: GitBranch, module: "scm" },
  { title: "CRM", url: "/crm", icon: UserCheck, module: "crm" },
  { title: "ERP", url: "/erp", icon: Building2, module: "erp" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { canAccessModule, signOut, user } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  
  // Filter items based on permissions
  const filteredMainItems = mainItems.filter(item => canAccessModule(item.module));
  const filteredManagementItems = managementItems.filter(item => canAccessModule(item.module));
  const filteredModulesItems = modulesItems.filter(item => canAccessModule(item.module));

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent className="bg-sidebar border-r border-border">
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            {!collapsed && (
              <h1 className="text-xl font-bold text-primary">OptiLog</h1>
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">O</span>
              </div>
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
        {filteredModulesItems.length > 0 && (
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
        )}

        {/* User info and Logout */}
        <div className="mt-auto p-4 border-t border-border space-y-2">
          {user && !collapsed && (
            <div className="text-xs text-muted-foreground truncate px-2">
              {user.email}
            </div>
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
