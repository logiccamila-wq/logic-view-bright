import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Truck, Shield, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-900 font-bold text-lg">EJG</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">EJG Transporte</h3>
                <p className="text-blue-200 text-sm">Químico & Medicamentos</p>
              </div>
            </div>
            <p className="text-blue-200 text-sm">
              Especialistas em transporte de produtos químicos e medicamentos com tecnologia de ponta e segurança incomparável.
            </p>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-blue-200">Certificação ISO 9001</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg">Navegação</h4>
            <nav className="space-y-2">
              <Link to="/" className="block text-blue-200 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/login?brand=ejg" className="block text-blue-200 hover:text-white transition-colors">
                Acesso EJG
              </Link>
              <Link to="/login?brand=albuquerque" className="block text-blue-200 hover:text-white transition-colors">
                Acesso Albuquerque
              </Link>
              <Link to="/login" className="block text-blue-200 hover:text-white transition-colors">
                Login
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg">Serviços</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-green-400" />
                <span className="text-blue-200 text-sm">Transporte Químico</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-blue-200 text-sm">SaaSMaq Monitoramento</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-blue-200 text-sm">Transporte Medicamentos</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-blue-200 text-sm">+55 (11) 9999-9999</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-green-400" />
                <span className="text-blue-200 text-sm">contato@ejgtransporte.com.br</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-blue-200 text-sm">São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center">
          <p className="text-blue-200 text-sm">
            © 2024 EJG Transporte Químico. Todos os direitos reservados. | Desenvolvido por XYZLogicFlow
          </p>
        </div>
      </div>
    </footer>
  );
}
