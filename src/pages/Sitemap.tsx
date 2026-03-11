import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  Wrench,
  BarChart3,
  Shield,
  Activity,
  Database,
  Leaf,
  Wifi,
  DollarSign,
  FileText,
  Settings,
  Download,
  TrendingUp,
  Brain,
  Map,
  Globe,
  Box,
  ShoppingCart,
  Zap,
  Lock,
  BookOpen,
  CheckSquare,
  Building,
  Landmark,
  Receipt,
  CreditCard,
  UserCheck,
  FlaskConical,
  Layers,
  Clock,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { modules } from "@/modules/registry";

const categoryLabels: Record<string, string> = {
  operations: "Operações",
  finance: "Financeiro",
  maintenance: "Manutenção",
  iot: "IoT & Tecnologia",
  business: "Negócios",
  dev: "Dev & Ferramentas",
};

const categoryColors: Record<string, string> = {
  operations: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  finance: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  maintenance: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  iot: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  business: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  dev: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const categoryHeaderColors: Record<string, string> = {
  operations: "border-l-blue-500",
  finance: "border-l-green-500",
  maintenance: "border-l-orange-500",
  iot: "border-l-purple-500",
  business: "border-l-indigo-500",
  dev: "border-l-gray-500",
};

const slugIconMap: Record<string, React.ElementType> = {
  supergestor: Brain,
  "predictive-maintenance": Activity,
  "drivers-management": Users,
  approvals: CheckSquare,
  "logistics-kpi": BarChart3,
  "bank-reconciliation": Landmark,
  "cost-monitoring": DollarSign,
  iot: Wifi,
  permissions: Lock,
  developer: Database,
  reports: FileText,
  "supergestor-ai": Brain,
  "blockchain-tracking": Layers,
  "digital-twin": Box,
  "esg-dashboard": Leaf,
  "ai-route-optimization": Map,
  "cargo-marketplace": ShoppingCart,
  "advanced-analytics": BarChart3,
  "consultoria-financeira-ia": DollarSign,
  "analise-tributaria": Receipt,
  "app-motorista": Truck,
  "gestao-pops": BookOpen,
  "auditoria-sassmaq": Shield,
  dashboard: LayoutDashboard,
  tms: Truck,
  wms: Package,
  erp: Building,
  crm: UserCheck,
  oms: ShoppingCart,
  driver: Truck,
  mechanic: Wrench,
  "maintenance-checklist": CheckSquare,
  gate: Shield,
  "live-tracking": Globe,
  "install-app": Download,
  "control-tower": Shield,
  "control-tower-new": Shield,
  fleet: Truck,
  "journey-management": Clock,
  admin: Settings,
  esg: Leaf,
  dre: BarChart3,
  employees: Users,
  inventory: Package,
  documents: FileText,
  oem: BookOpen,
  scm: TrendingUp,
  "executive-dashboard": LayoutDashboard,
  users: Users,
  payroll: CreditCard,
  routing: Map,
  partners: Globe,
  "centros-custo": Building,
  "plano-contas": Landmark,
  lancamentos: Receipt,
  "accounts-payable": CreditCard,
  "accounts-receivable": DollarSign,
  "folha-pagamento": Receipt,
  "executive-report": FileText,
  "export-center": Download,
  eip: MessageSquare,
  innovation: FlaskConical,
  "driver-journey": Clock,
  "driver-payroll": CreditCard,
  demo: Zap,
  "erp-system": Building,
};

const categoryAccentColors: Record<string, string> = {
  operations: "bg-blue-500",
  finance: "bg-green-500",
  maintenance: "bg-orange-500",
  iot: "bg-purple-500",
  business: "bg-indigo-500",
  dev: "bg-gray-500",
};

export default function Sitemap() {
  const categories = Object.keys(categoryLabels);

  const grouped = categories.reduce<Record<string, typeof modules>>((acc, cat) => {
    acc[cat] = modules.filter((m) => m.category === cat && m.route);
    return acc;
  }, {});

  const total = modules.filter((m) => m.route).length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Layers className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mapa do Sistema</h1>
            <p className="text-muted-foreground">
              Visualize e acesse todos os módulos e páginas da plataforma XYZLogicFlow
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((cat) => (
            <Badge key={cat} className={categoryColors[cat] + " text-xs"}>
              {categoryLabels[cat]}: {grouped[cat].length}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs">
            Total: {total} módulos
          </Badge>
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-8">
        {categories.map((cat) => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span
                  className={"inline-block w-1 h-6 rounded mr-1 " + (categoryAccentColors[cat] ?? "bg-gray-500")}
                />
                {categoryLabels[cat]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((mod) => {
                  const Icon = slugIconMap[mod.slug] || Layers;
                  return (
                    <Link key={mod.slug} to={mod.route!} className="group">
                      <Card
                        className={
                          "h-full border-l-4 hover:shadow-md transition-shadow cursor-pointer " +
                          categoryHeaderColors[cat]
                        }
                      >
                        <CardHeader className="pb-2 pt-4 px-4">
                          <CardTitle className="flex items-center gap-2 text-sm font-semibold group-hover:text-primary transition-colors">
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{mod.name}</span>
                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                          <p className="text-xs text-muted-foreground line-clamp-2">{mod.description}</p>
                          <p className="text-xs text-primary/60 mt-2 font-mono">{mod.route}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
