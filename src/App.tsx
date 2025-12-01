import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { HelmetProvider } from "react-helmet-async";
import { AppThemeProvider } from "@/lib/themes/ThemeProvider";
import i18n from "@/lib/i18n/i18n-config";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import { AuthProvider } from "@/contexts/AuthContext";
import SettingsAppearance from "@/pages/settings/SettingsAppearance";
import SettingsBranding from "@/pages/settings/SettingsBranding";
import SettingsLanguage from "@/pages/settings/SettingsLanguage";
import SettingsDomain from "@/pages/settings/SettingsDomain";
import SettingsModules from "@/pages/settings/SettingsModules";
import ModuleMarketplace from "@/pages/ModuleMarketplace";
import OnboardingFlow from "@/pages/OnboardingFlow";
import Demo from "@/pages/Demo";

function App() {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <AppThemeProvider>
          <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                {/* Onboarding Flow */}
                <Route path="/onboarding" element={<OnboardingFlow />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Main Application */}
                <Route path="/*" element={
                  <Layout>
                    <Routes>
                      <Route index element={<Dashboard />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      
                      {/* Settings Routes */}
                      <Route path="settings">
                        <Route path="appearance" element={<SettingsAppearance />} />
                        <Route path="branding" element={<SettingsBranding />} />
                        <Route path="language" element={<SettingsLanguage />} />
                        <Route path="domain" element={<SettingsDomain />} />
                        <Route path="modules" element={<SettingsModules />} />
                      </Route>
                      
                      {/* Module Marketplace */}
                      <Route path="marketplace" element={<ModuleMarketplace />} />
                      
                      {/* Demo Page */}
                      <Route path="demo" element={<Demo />} />
                    </Routes>
                  </Layout>
                } />
              </Routes>
            </div>
          </Router>
          </AuthProvider>
          <Toaster />
        </AppThemeProvider>
      </I18nextProvider>
    </HelmetProvider>
  );
}

export default App;
