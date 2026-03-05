import { Link } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import i18n, { supportedLanguages } from "@/lib/i18n/i18n-config";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-primary font-bold text-lg">XYZLogicFlow</h1>
              <p className="text-xs text-muted-foreground">Logística Inteligente</p>
            </div>
          </Link>

          {/* Desktop Navigation - Moved to Sidebar */}
          <nav className="hidden md:flex items-center gap-4 ml-auto mr-4">
            <Link to="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Marketplace
            </Link>
            <Link to="/login?brand=ejg" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Área do Cliente
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={signOut}>Sair</Button>
                <Link to="/login" className="text-xs font-medium text-muted-foreground hover:text-primary">Trocar usuário</Link>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">Login</Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="hidden md:flex items-center gap-3">
            <select
              value={i18n.language}
              onChange={(e)=>{ i18n.changeLanguage(e.target.value); localStorage.setItem('optilog-language', e.target.value); }}
              className="border rounded px-2 py-1 text-sm"
            >
              {supportedLanguages.map(l => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}
            </select>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/login?brand=ejg"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Acesso EJG
              </Link>
              <Link
                to="/login?brand=albuquerque"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Acesso Albuquerque
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/marketplace"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                to="/tms"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                TMS
              </Link>
              <Link
                to="/erp"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ERP
              </Link>
              <Link
                to="/wms"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                WMS
              </Link>
              <Link
                to="/crm"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                CRM
              </Link>
              <Link
                to="/oms"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                OMS
              </Link>
              <Link
                to="/driver"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Motorista
              </Link>
              <Link
                to="/mechanic"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mecânico
              </Link>
              <Link
                to="/supergestor"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Supergestor
              </Link>
              <Link
                to="/gate"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Portaria
              </Link>
              <Link
                to="/predictive-maintenance"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Manutenção Preditiva
              </Link>
              <Link
                to="/admin"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dados
              </Link>
              <Link
                to="/esg"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ESG
              </Link>
              <Link
                to="/iot"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                IoT
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
