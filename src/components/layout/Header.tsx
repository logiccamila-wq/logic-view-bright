import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">EJG</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-blue-900 font-bold text-lg">EJG Transporte</h1>
              <p className="text-xs text-gray-600">Químico & Medicamentos</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Home
            </Link>
            <Link to="/login?brand=ejg" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Acesso EJG
            </Link>
            <Link to="/login?brand=albuquerque" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Acesso Albuquerque
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">
              Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-900 hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
