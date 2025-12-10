import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { HelmetProvider } from "react-helmet-async";
import { AppThemeProvider } from "@/lib/themes/ThemeProvider";
import i18n from "@/lib/i18n/i18n-config";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout/Layout";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import LoadingSpinner from "@/components/animations/LoadingSpinner";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Login = lazy(() => import("@/pages/Login"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const SettingsAppearance = lazy(() => import("@/pages/settings/SettingsAppearance"));
const SettingsBranding = lazy(() => import("@/pages/settings/SettingsBranding"));
const SettingsLanguage = lazy(() => import("@/pages/settings/SettingsLanguage"));
const SettingsDomain = lazy(() => import("@/pages/settings/SettingsDomain"));
const SettingsModules = lazy(() => import("@/pages/settings/SettingsModules"));
const ModuleMarketplace = lazy(() => import("@/pages/ModuleMarketplace"));
const ModulePage = lazy(() => import("@/pages/Module"));
const OnboardingFlow = lazy(() => import("@/pages/OnboardingFlow"));
const Demo = lazy(() => import("@/pages/Demo"));
const TMS = lazy(() => import("@/pages/TMS"));
const ERP = lazy(() => import("@/pages/ERP"));
const WMS = lazy(() => import("@/pages/WMS"));
const CRM = lazy(() => import("@/pages/CRM"));
const OMS = lazy(() => import("@/pages/OMS"));
const Driver = lazy(() => import("@/pages/Driver"));
const Mechanic = lazy(() => import("@/pages/Mechanic"));
const MaintenanceChecklist = lazy(() => import("@/pages/MaintenanceChecklist"));
const Supergestor = lazy(() => import("@/pages/Supergestor"));
const Gate = lazy(() => import("@/pages/Gate"));
const PredictiveMaintenance = lazy(() => import("@/pages/PredictiveMaintenance"));
const Admin = lazy(() => import("@/pages/Admin"));
const ESG = lazy(() => import("@/pages/ESG"));
const IoT = lazy(() => import("@/pages/IoT"));
const Developer = lazy(() => import("@/pages/Developer"));
const LiveTracking = lazy(() => import("@/pages/LiveTracking"));
const InstallApp = lazy(() => import("@/pages/InstallApp"));
const Documents = lazy(() => import("@/pages/Documents"));
const ControlTower = lazy(() => import("@/pages/ControlTower"));
const Fleet = lazy(() => import("@/pages/Fleet"));
const JourneyManagement = lazy(() => import("@/pages/JourneyManagement"));
const CostMonitoring = lazy(() => import("@/pages/CostMonitoring"));
const LogisticsKPI = lazy(() => import("@/pages/LogisticsKPI"));
const DRE = lazy(() => import("@/pages/DRE"));
const Employees = lazy(() => import("@/pages/Employees"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const Approvals = lazy(() => import("@/pages/Approvals"));
const MaintenanceLibrary = lazy(() => import("@/pages/MaintenanceLibrary"));
const SCM = lazy(() => import("@/pages/SCM"));
const ExecutiveDashboard = lazy(() => import("@/pages/ExecutiveDashboard"));
const DriversManagement = lazy(() => import("@/pages/DriversManagement"));
const DriverApp = lazy(() => import("@/pages/DriverApp"));
const Routing = lazy(() => import("@/pages/Routing"));
const Users = lazy(() => import("@/pages/Users"));
const PayrollManagement = lazy(() => import("@/pages/PayrollManagement"));
const AccountsPayable = lazy(() => import("@/pages/AccountsPayable"));
const AccountsReceivable = lazy(() => import("@/pages/AccountsReceivable"));
const BankReconciliation = lazy(() => import("@/pages/BankReconciliation"));
const Lancamentos = lazy(() => import("@/pages/Lancamentos"));
const Partners = lazy(() => import("@/pages/Partners"));
const PlanoContas = lazy(() => import("@/pages/PlanoContas"));
const CentrosCusto = lazy(() => import("@/pages/CentrosCusto"));
const FolhaPagamento = lazy(() => import("@/pages/FolhaPagamento"));
const DriverJourney = lazy(() => import("@/pages/DriverJourney"));
const DriverPayroll = lazy(() => import("@/pages/DriverPayroll"));
const ControlTowerRedesign = lazy(() => import("@/pages/ControlTowerRedesign"));
const InnovationLab = lazy(() => import("@/pages/InnovationLab"));
const EIP = lazy(() => import("@/pages/EIP"));
const Permissions = lazy(() => import("@/pages/Permissions"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));

function App() {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <AppThemeProvider>
          <Router>
            <AuthProvider>
              <NotificationsProvider>
                <div className="min-h-screen bg-background text-foreground">
                  <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/onboarding" element={<OnboardingFlow />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/*" element={
                        <Layout>
                          <Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner /></div>}>
                            <Routes>
                              <Route index element={<ModuleMarketplace />} />
                              <Route path="dashboard" element={<Dashboard />} />
                              <Route path="settings">
                                <Route index element={<Settings />} />
                                <Route path="appearance" element={<SettingsAppearance />} />
                                <Route path="branding" element={<SettingsBranding />} />
                                <Route path="language" element={<SettingsLanguage />} />
                                <Route path="domain" element={<SettingsDomain />} />
                                <Route path="modules" element={<SettingsModules />} />
                              </Route>
                              <Route path="marketplace" element={<ModuleMarketplace />} />
                              <Route path="module/:slug" element={<ModulePage />} />
                              <Route path="tms" element={<TMS />} />
                              <Route path="erp" element={<ERP />} />
                              <Route path="wms" element={<WMS />} />
                              <Route path="crm" element={<CRM />} />
                              <Route path="oms" element={<OMS />} />
                              <Route path="driver" element={<Driver />} />
                              <Route path="dr" element={<Driver />} />
                              <Route path="driver-journey" element={<DriverJourney />} />
                              <Route path="driver-payroll" element={<DriverPayroll />} />
                              <Route path="mechanic" element={<Mechanic />} />
                              <Route path="maintenance-checklist" element={<MaintenanceChecklist />} />
                              <Route path="supergestor" element={<Supergestor />} />
                              <Route path="gate" element={<Gate />} />
                              <Route path="live-tracking" element={<LiveTracking />} />
                              <Route path="install-app" element={<InstallApp />} />
                              <Route path="control-tower" element={<ControlTower />} />
                              <Route path="control-tower-new" element={<ControlTowerRedesign />} />
                              <Route path="fleet" element={<Fleet />} />
                              <Route path="journey-management" element={<JourneyManagement />} />
                              <Route path="cost-monitoring" element={<CostMonitoring />} />
                              <Route path="logistics-kpi" element={<LogisticsKPI />} />
                              <Route path="predictive-maintenance" element={<PredictiveMaintenance />} />
                              <Route path="admin" element={<Admin />} />
                              <Route path="esg" element={<ESG />} />
                              <Route path="iot" element={<IoT />} />
                              <Route path="dre" element={<DRE />} />
                              <Route path="employees" element={<Employees />} />
                              <Route path="warehouse" element={<Inventory />} />
                              <Route path="inventory" element={<Inventory />} />
                              <Route path="documents" element={<Documents />} />
                              <Route path="approvals" element={<Approvals />} />
                              <Route path="oem" element={<MaintenanceLibrary />} />
                              <Route path="scm" element={<SCM />} />
                              <Route path="executive-dashboard" element={<ExecutiveDashboard />} />
                              <Route path="drivers" element={<DriversManagement />} />
                              <Route path="drivers-management" element={<DriversManagement />} />
                              <Route path="driver-app" element={<DriverApp />} />
                              <Route path="users" element={<Users />} />
                              <Route path="payroll" element={<PayrollManagement />} />
                              <Route path="payroll-management" element={<PayrollManagement />} />
                              <Route path="routing" element={<Routing />} />
                              <Route path="demo" element={<Demo />} />
                              <Route path="developer" element={<Developer />} />
                              <Route path="partners" element={<Partners />} />
                              <Route path="centros-custo" element={<CentrosCusto />} />
                              <Route path="plano-contas" element={<PlanoContas />} />
                              <Route path="lancamentos" element={<Lancamentos />} />
                              <Route path="bank-reconciliation" element={<BankReconciliation />} />
                              <Route path="accounts-payable" element={<AccountsPayable />} />
                              <Route path="accounts-receivable" element={<AccountsReceivable />} />
                              <Route path="folha-pagamento" element={<FolhaPagamento />} />
                              <Route path="permissions" element={<Permissions />} />
                              <Route path="reports" element={<Reports />} />
                              <Route path="eip" element={<EIP />} />
                              <Route path="innovation" element={<InnovationLab />} />
                            </Routes>
                          </Suspense>
                        </Layout>
                      } />
                    </Routes>
                  </Suspense>
                </div>
              </NotificationsProvider>
            </AuthProvider>
          </Router>
          <Toaster />
        </AppThemeProvider>
      </I18nextProvider>
    </HelmetProvider>
  );
}

export default App;
