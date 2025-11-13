import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import Mechanic from "./pages/Mechanic";
import Driver from "./pages/Driver";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Approvals from "./pages/Approvals";
import ControlTower from "./pages/ControlTower";
import Inventory from "./pages/Inventory";
import WMS from "./pages/WMS";
import TMS from "./pages/TMS";
import OMS from "./pages/OMS";
import SCM from "./pages/SCM";
import CRM from "./pages/CRM";
import ERP from "./pages/ERP";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
            <Route path="/fleet" element={<ProtectedRoute module="fleet"><Fleet /></ProtectedRoute>} />
            <Route path="/mechanic" element={<ProtectedRoute module="mechanic"><Mechanic /></ProtectedRoute>} />
            <Route path="/driver" element={<ProtectedRoute module="driver"><Driver /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute module="users"><Users /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute module="reports"><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute module="settings"><Settings /></ProtectedRoute>} />
            <Route path="/approvals" element={<ProtectedRoute module="approvals"><Approvals /></ProtectedRoute>} />
            <Route path="/control-tower" element={<ProtectedRoute module="control-tower"><ControlTower /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute module="inventory"><Inventory /></ProtectedRoute>} />
            <Route path="/wms" element={<ProtectedRoute module="wms"><WMS /></ProtectedRoute>} />
            <Route path="/tms" element={<ProtectedRoute module="tms"><TMS /></ProtectedRoute>} />
            <Route path="/oms" element={<ProtectedRoute module="oms"><OMS /></ProtectedRoute>} />
            <Route path="/scm" element={<ProtectedRoute module="scm"><SCM /></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute module="crm"><CRM /></ProtectedRoute>} />
            <Route path="/erp" element={<ProtectedRoute module="erp"><ERP /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
