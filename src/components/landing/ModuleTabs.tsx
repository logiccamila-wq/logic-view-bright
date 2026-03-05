import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

interface Module {
  name: string;
  description: string;
  icon: React.ReactNode;
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
      { name: "TMS", description: "Gestão de transportes", icon: <Truck className="w-5 h-5" /> },
      { name: "Rastreamento", description: "GPS em tempo real", icon: <Package className="w-5 h-5" /> },
      { name: "CTe/MDFe", description: "Documentos fiscais", icon: <FileText className="w-5 h-5" /> },
      { name: "Roteirização", description: "Otimização de rotas", icon: <TrendingUp className="w-5 h-5" /> },
    ],
  },
  {
    id: "financial",
    label: "Financeiro",
    modules: [
      { name: "Contas a Pagar", description: "Gestão de despesas", icon: <CreditCard className="w-5 h-5" /> },
      { name: "Conciliação", description: "Bancária automática", icon: <DollarSign className="w-5 h-5" /> },
      { name: "Aprovações", description: "Workflow financeiro", icon: <Shield className="w-5 h-5" /> },
      { name: "KPIs", description: "Indicadores financeiros", icon: <BarChart3 className="w-5 h-5" /> },
    ],
  },
  {
    id: "commercial",
    label: "Comercial",
    modules: [
      { name: "CRM", description: "Gestão de clientes", icon: <Users className="w-5 h-5" /> },
      { name: "Propostas", description: "Orçamentos digitais", icon: <FileText className="w-5 h-5" /> },
      { name: "Comissões", description: "Cálculo automático", icon: <DollarSign className="w-5 h-5" /> },
      { name: "Pipeline", description: "Funil de vendas", icon: <TrendingUp className="w-5 h-5" /> },
    ],
  },
  {
    id: "operational",
    label: "Operacional",
    modules: [
      { name: "Manutenção", description: "Gestão de frota", icon: <Wrench className="w-5 h-5" /> },
      { name: "Motoristas", description: "Controle de jornada", icon: <Users className="w-5 h-5" /> },
      { name: "Agendamentos", description: "Calendário integrado", icon: <Calendar className="w-5 h-5" /> },
      { name: "Configurações", description: "Personalização total", icon: <Settings className="w-5 h-5" /> },
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
                  className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white group-hover:shadow-lg transition-shadow">
                      {module.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {module.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
