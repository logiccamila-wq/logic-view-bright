import { motion } from "framer-motion";
import {
  Truck,
  DollarSign,
  FileText,
  MapPin,
  Cloud,
  Database,
  Zap,
  Mail,
  MessageSquare,
  CreditCard,
} from "lucide-react";

interface Integration {
  name: string;
  icon: React.ReactNode;
  category: string;
}

interface IntegrationGridProps {
  integrations?: Integration[];
  columns?: 3 | 4 | 5;
}

const defaultIntegrations: Integration[] = [
  { name: "TomTom Maps", icon: <MapPin className="w-8 h-8" />, category: "Logística" },
  { name: "SEFAZ CTe/MDFe", icon: <FileText className="w-8 h-8" />, category: "Fiscal" },
  { name: "Supabase", icon: <Database className="w-8 h-8" />, category: "Database" },
  { name: "AWS Cloud", icon: <Cloud className="w-8 h-8" />, category: "Infraestrutura" },
  { name: "Zapier", icon: <Zap className="w-8 h-8" />, category: "Automação" },
  { name: "WhatsApp API", icon: <MessageSquare className="w-8 h-8" />, category: "Comunicação" },
  { name: "EmailJS", icon: <Mail className="w-8 h-8" />, category: "E-mail" },
  { name: "Stripe/Pagar.me", icon: <CreditCard className="w-8 h-8" />, category: "Pagamentos" },
  { name: "ERP Systems", icon: <DollarSign className="w-8 h-8" />, category: "Financeiro" },
  { name: "Fleet Tracking", icon: <Truck className="w-8 h-8" />, category: "Rastreamento" },
];

/**
 * Partner integrations grid with hover effects
 * Displays logos/icons in responsive grid layout
 */
export function IntegrationGrid({
  integrations = defaultIntegrations,
  columns = 5,
}: IntegrationGridProps) {
  const gridCols = {
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Integrações Nativas
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Conecte-se com as ferramentas que você já usa
        </p>
      </motion.div>

      {/* Grid */}
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {integrations.map((integration, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer"
          >
            {/* Icon - Grayscale to Color on Hover */}
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 mb-3 grayscale group-hover:grayscale-0">
                {integration.icon}
              </div>
              
              {/* Name */}
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center mb-1">
                {integration.name}
              </h3>
              
              {/* Category */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {integration.category}
              </p>
            </div>

            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Precisa de uma integração específica?
        </p>
        <a
          href="/integrations"
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          Ver todas as integrações
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </motion.div>
    </div>
  );
}
