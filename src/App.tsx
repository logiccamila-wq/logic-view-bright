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
import InstallApp from "./pages/InstallApp";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import Mechanic from "./pages/Mechanic";
import Driver from "./pages/Driver";
import DriverApp from "./pages/DriverApp";
import DriverJourney from "./pages/DriverJourney";
import JourneyManagement from "./pages/JourneyManagement";
import DriversManagement from "./pages/DriversManagement";
import LiveTracking from "./pages/LiveTracking";
import DriverPayroll from "./pages/DriverPayroll";
import PayrollManagement from "./pages/PayrollManagement";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Approvals from "./pages/Approvals";
import ControlTower from "./pages/ControlTower";
import Documents from "./pages/Documents";
import Developer from "./pages/Developer";
import InnovationLab from "./pages/InnovationLab";
import Inventory from "./pages/Inventory";
import WMS from "./pages/WMS";
import TMS from "./pages/TMS";
import OMS from "./pages/OMS";
import SCM from "./pages/SCM";
import CRM from "./pages/CRM";
import ERP from "./pages/ERP";
import AccountsPayable from "./pages/AccountsPayable";
import AccountsReceivable from "./pages/AccountsReceivable";
import CostMonitoring from "./pages/CostMonitoring";
import ImportVehicles from "./pages/ImportVehicles";
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
            <Route path="/install" element={<InstallApp />} />
            <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
            <Route path="/fleet" element={<ProtectedRoute module="fleet"><Fleet /></ProtectedRoute>} />
            <Route path="/mechanic" element={<ProtectedRoute module="mechanic"><Mechanic /></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute module="driver"><DriverApp /></ProtectedRoute>} />
          <Route path="/driver-old" element={<ProtectedRoute module="driver"><Driver /></ProtectedRoute>} />
            <Route path="/driver-journey" element={<ProtectedRoute module="driver"><DriverJourney /></ProtectedRoute>} />
            <Route path="/journey-management" element={<ProtectedRoute module="fleet"><JourneyManagement /></ProtectedRoute>} />
            <Route path="/drivers-management" element={<ProtectedRoute module="fleet"><DriversManagement /></ProtectedRoute>} />
            <Route path="/live-tracking" element={<ProtectedRoute module="fleet"><LiveTracking /></ProtectedRoute>} />
            <Route path="/driver-payroll" element={<ProtectedRoute module="driver"><DriverPayroll /></ProtectedRoute>} />
            <Route path="/payroll-management" element={<ProtectedRoute module="fleet"><PayrollManagement /></ProtectedRoute>} />
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
            <Route path="/accounts-payable" element={<ProtectedRoute module="finance"><AccountsPayable /></ProtectedRoute>} />
            <Route path="/accounts-receivable" element={<ProtectedRoute module="finance"><AccountsReceivable /></ProtectedRoute>} />
            <Route path="/cost-monitoring" element={<ProtectedRoute module="finance"><CostMonitoring /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute module="documents"><Documents /></ProtectedRoute>} />
            <Route path="/developer" element={<ProtectedRoute module="developer"><Developer /></ProtectedRoute>} />
            <Route path="/innovation" element={<ProtectedRoute module="innovation"><InnovationLab /></ProtectedRoute>} />
            <Route path="/import-vehicles" element={<ProtectedRoute module="fleet"><ImportVehicles /></ProtectedRoute>} />
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
