import { ReactNode } from "react";
import { useMaintenanceAlerts } from "@/hooks/useMaintenanceAlerts";
import { useCostAlerts } from "@/hooks/useCostAlerts";
import Header from "./Header";
import { Sidebar } from "./Sidebar";
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useMaintenanceAlerts();
  useCostAlerts();
  
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-muted/10">
      {/* Modern Sidebar */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Header with backdrop blur */}
        <Header />
        
        {/* Main Content with smooth animations */}
        <main 
          id="main-content"
          tabIndex={-1}
          className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 overflow-auto pt-16 animate-in fade-in slide-in-from-bottom-4 duration-500"
          role="main"
          aria-label="Conteúdo principal"
        >
          <div className="max-w-[1600px] mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
