export interface RegistryModule {
  slug: string;
  name: string;
  description: string;
  category?: string;
  enabled?: boolean;
  route?: string;
}

export const modules: RegistryModule[] = [
  {
    slug: "supergestor",
    name: "Supergestor",
    description: "Hub de IA para decisões operacionais e financeiras",
    category: "operations",
    enabled: true,
    route: "/supergestor",
  },
  {
    slug: "predictive-maintenance",
    name: "Manutenção Preditiva",
    description: "Previsões de manutenção por IA e risco de pneus",
    category: "maintenance",
    enabled: true,
    route: "/predictive-maintenance",
  },
  {
    slug: "drivers-management",
    name: "Gestão de Motoristas",
    description: "Cadastro, jornada, violações e histórico de viagens",
    category: "operations",
    enabled: true,
    route: "/drivers-management",
  },
  {
    slug: "approvals",
    name: "Aprovações",
    description: "Fluxo de aprovações operacionais e financeiras",
    category: "operations",
    enabled: true,
    route: "/approvals",
  },
  {
    slug: "logistics-kpi",
    name: "KPIs de Logística",
    description: "Indicadores de performance e custos por KM",
    category: "operations",
    enabled: true,
    route: "/logistics-kpi",
  },
  {
    slug: "bank-reconciliation",
    name: "Conciliação Bancária",
    description: "Importação e conciliação de extratos bancários",
    category: "finance",
    enabled: true,
    route: "/bank-reconciliation",
  },
  {
    slug: "cost-monitoring",
    name: "Monitoramento de Custos",
    description: "Acompanhamento de despesas e otimização de custo/km",
    category: "finance",
    enabled: true,
    route: "/cost-monitoring",
  },
  {
    slug: "iot",
    name: "IoT",
    description: "Telemetria de frota e sensores em tempo real",
    category: "iot",
    enabled: true,
    route: "/iot",
  },
  {
    slug: "permissions",
    name: "Permissões",
    description: "Perfis, papéis e autorização por módulo",
    category: "operations",
    enabled: true,
    route: "/permissions",
  },
  {
    slug: "developer",
    name: "Developer",
    description: "Ferramentas para dev, logs e diagnósticos",
    category: "dev",
    enabled: true,
    route: "/developer",
  },
  {
    slug: "reports",
    name: "Relatórios",
    description: "Relatórios executivos e financeiros",
    category: "business",
    enabled: true,
    route: "/reports",
  },
];
