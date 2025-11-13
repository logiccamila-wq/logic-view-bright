import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import Mechanic from "./pages/Mechanic";
import Driver from "./pages/Driver";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
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
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/mechanic" element={<Mechanic />} />
          <Route path="/driver" element={<Driver />} />
          <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/wms" element={<WMS />} />
          <Route path="/tms" element={<TMS />} />
          <Route path="/oms" element={<OMS />} />
          <Route path="/scm" element={<SCM />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/erp" element={<ERP />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
