import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useMaintenanceAlerts } from "@/hooks/useMaintenanceAlerts";
import { useCostAlerts } from "@/hooks/useCostAlerts";
import { NotificationBell } from "@/components/NotificationBell";
import { EJGChatbot } from "@/components/EJGChatbot";
import { Zap } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Ativar sistemas de alertas
  useMaintenanceAlerts();
  useCostAlerts();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex items-center px-6 gap-4 shadow-sm">
            <SidebarTrigger className="mr-2" />
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-foreground">
                XYZLogicFlow
              </h2>
              <span className="text-xs text-muted-foreground">Enterprise Logistics</span>
            </div>
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto bg-muted/30">
            {children}
          </main>
        </div>
        <EJGChatbot />
      </div>
    </SidebarProvider>
  );
}
