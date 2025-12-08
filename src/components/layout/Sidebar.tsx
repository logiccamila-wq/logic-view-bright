import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Truck, 
  Package, 
  Users, 
  Settings, 
  Wrench, 
  BarChart3, 
  Shield, 
  Activity, 
  Database, 
  Leaf, 
  Wifi,
  ShoppingBag,
  LogOut,
  Menu,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/tms", label: "TMS", icon: Truck },
    { href: "/erp", label: "ERP", icon: BarChart3 },
    { href: "/wms", label: "WMS", icon: Package },
    { href: "/crm", label: "CRM", icon: Users },
    { href: "/oms", label: "OMS", icon: Activity },
    { href: "/driver", label: "Motorista", icon: Truck },
    { href: "/mechanic", label: "Mecânico", icon: Wrench },
    { href: "/supergestor", label: "Supergestor", icon: BarChart3 },
    { href: "/gate", label: "Portaria", icon: Shield },
    { href: "/predictive-maintenance", label: "Manutenção Preditiva", icon: Activity },
    { href: "/admin", label: "Admin Dados", icon: Database },
    { href: "/esg", label: "ESG", icon: Leaf },
    { href: "/iot", label: "IoT", icon: Wifi },
  ];

  return (
    <div className={cn("pb-12 border-r bg-background h-screen sticky top-0 transition-all duration-300", collapsed ? "w-16" : "w-64", className)}>
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
              {menuItems.map((item) => (
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
