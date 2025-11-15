import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Shield, Users, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

type AppRole = 'admin' | 'driver' | 'finance' | 'operations' | 'commercial' | 'fleet_maintenance' | 'maintenance_assistant' | 'logistics_manager' | 'maintenance_manager';

const MODULE_PERMISSIONS: Record<AppRole, string[]> = {
  driver: ['dashboard', 'fleet', 'tms', 'driver'],
  finance: ['dashboard', 'erp', 'reports', 'approvals', 'control-tower', 'finance', 'documents'],
  operations: ['dashboard', 'operations', 'tms', 'fleet', 'approvals', 'control-tower', 'documents'],
  admin: ['dashboard', 'wms', 'tms', 'oms', 'scm', 'crm', 'erp', 'fleet', 'mechanic', 'driver', 'reports', 'settings', 'users', 'approvals', 'control-tower', 'inventory', 'finance', 'documents', 'developer', 'innovation'],
  commercial: ['dashboard', 'tms', 'crm'],
  fleet_maintenance: ['dashboard', 'fleet', 'mechanic', 'inventory', 'documents', 'approvals'],
  maintenance_assistant: ['dashboard', 'mechanic', 'inventory'],
  logistics_manager: ['dashboard', 'tms', 'fleet', 'driver', 'approvals', 'reports', 'control-tower', 'finance', 'documents'],
  maintenance_manager: ['dashboard', 'fleet', 'mechanic', 'approvals', 'reports', 'control-tower', 'inventory', 'documents'],
};

const MODULES_INFO: Record<string, { name: string; icon: string; category: string }> = {
  dashboard: { name: 'Dashboard', icon: '📊', category: 'Core' },
  wms: { name: 'WMS', icon: '📦', category: 'Operações' },
  tms: { name: 'TMS', icon: '🚛', category: 'Operações' },
  oms: { name: 'OMS', icon: '📋', category: 'Operações' },
  scm: { name: 'SCM', icon: '⛓️', category: 'Operações' },
  crm: { name: 'CRM', icon: '👥', category: 'Comercial' },
  erp: { name: 'ERP', icon: '💼', category: 'Financeiro' },
  fleet: { name: 'Frota', icon: '🚗', category: 'Operações' },
  mechanic: { name: 'Mecânica', icon: '🔧', category: 'Manutenção' },
  driver: { name: 'Motorista', icon: '👨‍✈️', category: 'Operações' },
  reports: { name: 'Relatórios', icon: '📈', category: 'Análise' },
  settings: { name: 'Configurações', icon: '⚙️', category: 'Sistema' },
  users: { name: 'Usuários', icon: '👤', category: 'Sistema' },
  approvals: { name: 'Aprovações', icon: '✅', category: 'Gestão' },
  'control-tower': { name: 'Torre de Controle', icon: '🗼', category: 'Operações' },
  inventory: { name: 'Estoque', icon: '📊', category: 'Manutenção' },
  finance: { name: 'Financeiro', icon: '💰', category: 'Financeiro' },
  documents: { name: 'Documentos', icon: '📄', category: 'Gestão' },
  developer: { name: 'Developer', icon: '💻', category: 'Sistema' },
  innovation: { name: 'Inovação', icon: '🚀', category: 'Sistema' },
  operations: { name: 'Operações', icon: '⚡', category: 'Operações' },
};

const ROLE_INFO: Record<AppRole, { name: string; color: string; description: string }> = {
  admin: { name: 'Administrador', color: 'bg-red-500', description: 'Acesso total ao sistema' },
  driver: { name: 'Motorista', color: 'bg-blue-500', description: 'Acesso a viagens e rotas' },
  finance: { name: 'Financeiro', color: 'bg-green-500', description: 'Gestão financeira e contábil' },
  operations: { name: 'Operações', color: 'bg-purple-500', description: 'Gestão operacional' },
  commercial: { name: 'Comercial', color: 'bg-cyan-500', description: 'Vendas e relacionamento' },
  fleet_maintenance: { name: 'Manutenção de Frota', color: 'bg-orange-500', description: 'Manutenção e mecânica' },
  maintenance_assistant: { name: 'Assistente de Manutenção', color: 'bg-yellow-500', description: 'Suporte à manutenção' },
  logistics_manager: { name: 'Gestor Logístico', color: 'bg-indigo-500', description: 'Gestão de logística' },
  maintenance_manager: { name: 'Gerente de Manutenção', color: 'bg-pink-500', description: 'Gestão de manutenção' },
};

const Permissions = () => {
  const { hasRole, roles } = useAuth();

  // Apenas admins podem ver esta página
  if (!hasRole('admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  const allRoles = Object.keys(MODULE_PERMISSIONS) as AppRole[];
  const allModules = Array.from(new Set(Object.values(MODULE_PERMISSIONS).flat()));
  const categories = Array.from(new Set(Object.values(MODULES_INFO).map(m => m.category)));

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Matriz de Permissões
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualização completa de acessos e permissões por perfil
          </p>
        </div>

        {/* Suas Permissões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Suas Permissões
            </CardTitle>
            <CardDescription>Você está logado com os seguintes perfis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <Badge key={role} className={`${ROLE_INFO[role].color} text-white`}>
                  {ROLE_INFO[role].name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Permissões por Categoria */}
        {categories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold sticky left-0 bg-card z-10">
                        Módulo
                      </th>
                      {allRoles.map((role) => (
                        <th key={role} className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge className={`${ROLE_INFO[role].color} text-white text-xs`}>
                              {ROLE_INFO[role].name}
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allModules
                      .filter(module => MODULES_INFO[module]?.category === category)
                      .map((module) => (
                        <tr key={module} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium sticky left-0 bg-card">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{MODULES_INFO[module]?.icon}</span>
                              <span>{MODULES_INFO[module]?.name || module}</span>
                            </div>
                          </td>
                          {allRoles.map((role) => {
                            const hasAccess = MODULE_PERMISSIONS[role].includes(module);
                            return (
                              <td key={role} className="p-3 text-center">
                                {hasAccess ? (
                                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500/30 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Legenda de Perfis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Perfis do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRoles.map((role) => (
                <div key={role} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge className={`${ROLE_INFO[role].color} text-white shrink-0`}>
                    {ROLE_INFO[role].name}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {ROLE_INFO[role].description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {MODULE_PERMISSIONS[role].length} módulos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Permissions;
