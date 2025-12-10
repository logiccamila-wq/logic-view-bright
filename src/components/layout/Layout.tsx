import { ReactNode } from "react";
import { useMaintenanceAlerts } from "@/hooks/useMaintenanceAlerts";
import { useCostAlerts } from "@/hooks/useCostAlerts";
import Header from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children?: ReactNode;
}

import { Outlet } from 'react-router-dom';

export default function Layout({ children }: LayoutProps) {
  useMaintenanceAlerts();
  useCostAlerts();
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar className="hidden md:block" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6 overflow-auto pt-16">
          {children || <Outlet />}
        </main>
        {/* Footer removido conforme solicitado */}
      </div>
    </div>
  );
}
