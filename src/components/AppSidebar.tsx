import { 
  LayoutDashboard, 
  Truck, 
  Wrench, 
  User, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut 
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Gestão de Frota", url: "/fleet", icon: Truck },
  { title: "Hub Mecânico", url: "/mechanic", icon: Wrench },
  { title: "App Motorista", url: "/driver", icon: User },
];

const managementItems = [
  { title: "Usuários", url: "/users", icon: Users },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
  { title: "Configurações", url: "/settings", icon: Settings },
];

const modulesItems = [
  { title: "WMS", url: "/wms", icon: LayoutDashboard },
  { title: "TMS", url: "/tms", icon: Truck },
  { title: "OMS", url: "/oms", icon: BarChart3 },
  { title: "SCM", url: "/scm", icon: Wrench },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "ERP", url: "/erp", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const mainExpanded = mainItems.some((i) => isActive(i.url));
  const managementExpanded = managementItems.some((i) => isActive(i.url));
  const modulesExpanded = modulesItems.some((i) => isActive(i.url));

  const handleLogout = () => {
    toast.success("Logout realizado com sucesso!");
    navigate("/login");
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent className="bg-sidebar border-r border-border">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          {!collapsed && (
            <h1 className="text-xl font-bold text-primary">OptiLog</h1>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">O</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
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
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
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

        {/* Módulos Integrados */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modulesItems.map((item) => (
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

        {/* Logout Button */}
        <div className="mt-auto p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
