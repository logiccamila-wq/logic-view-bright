import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  DollarSign,
  BarChart3,
  Settings,
  Package,
  CreditCard,
  Users,
  Wrench,
  TrendingUp,
  FileText,
  Calendar,
  Shield,
  ArrowRight,
} from "lucide-react";
import { resolveModuleRoute } from "@/modules/moduleNavigation";

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route?: string;
}

interface TabCategory {
  id: string;
  label: string;
  modules: Module[];
}

const defaultCategories: TabCategory[] = [
  {
    id: "logistics",
    label: "Logística",
    modules: [
      { id: "tms", name: "TMS", description: "Gestão de transportes", icon: <Truck className="w-5 h-5" /> },
      { id: "live-tracking", name: "Rastreamento", description: "GPS em tempo real", icon: <Package className="w-5 h-5" /> },
      { id: "documents", name: "CTe/MDFe", description: "Documentos fiscais", icon: <FileText className="w-5 h-5" /> },
      { id: "routing", name: "Roteirização", description: "Otimização de rotas", icon: <TrendingUp className="w-5 h-5" /> },
    ],
  },
  {
    id: "financial",
    label: "Financeiro",
    modules: [
      { id: "accounts-payable", name: "Contas a Pagar", description: "Gestão de despesas", icon: <CreditCard className="w-5 h-5" /> },
      { id: "bank-reconciliation", name: "Conciliação", description: "Bancária automática", icon: <DollarSign className="w-5 h-5" /> },
      { id: "approvals", name: "Aprovações", description: "Workflow financeiro", icon: <Shield className="w-5 h-5" /> },
      { id: "logistics-kpi", name: "KPIs", description: "Indicadores financeiros", icon: <BarChart3 className="w-5 h-5" /> },
    ],
  },
  {
    id: "commercial",
    label: "Comercial",
    modules: [
      { id: "crm", name: "CRM", description: "Gestão de clientes", icon: <Users className="w-5 h-5" /> },
      { id: "crm-proposals", name: "Propostas", description: "Orçamentos digitais", icon: <FileText className="w-5 h-5" />, route: "/crm" },
      { id: "crm-commissions", name: "Comissões", description: "Cálculo automático", icon: <DollarSign className="w-5 h-5" />, route: "/crm" },
      { id: "crm-pipeline", name: "Pipeline", description: "Funil de vendas", icon: <TrendingUp className="w-5 h-5" />, route: "/crm" },
    ],
  },
  {
    id: "operational",
    label: "Operacional",
    modules: [
      { id: "mechanic", name: "Manutenção", description: "Gestão de frota", icon: <Wrench className="w-5 h-5" /> },
      { id: "drivers-management", name: "Motoristas", description: "Controle de jornada", icon: <Users className="w-5 h-5" /> },
      { id: "journey-management", name: "Agendamentos", description: "Calendário integrado", icon: <Calendar className="w-5 h-5" /> },
      { id: "settings", name: "Configurações", description: "Personalização total", icon: <Settings className="w-5 h-5" /> },
    ],
  },
];

interface ModuleTabsProps {
  categories?: TabCategory[];
}

/**
 * Interactive tabs showcase for product modules
 * Displays categorized modules with smooth transitions
 */
export function ModuleTabs({ categories = defaultCategories }: ModuleTabsProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Tabs defaultValue={categories[0].id} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 p-1 rounded-xl mb-8">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {category.modules.map((module, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <button
                    type="button"
                    onClick={() => navigate(module.route || resolveModuleRoute(module.id))}
                    className="w-full rounded-xl border border-white/20 bg-white/10 p-6 text-left backdrop-blur-lg transition-all duration-300 hover:border-indigo-500/50 dark:bg-black/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white transition-shadow group-hover:shadow-lg">
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                          {module.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {module.description}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-200">
                          Abrir módulo
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
