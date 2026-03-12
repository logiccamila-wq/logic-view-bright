import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Shield, Users, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

type AppRole = 'admin' | 'driver' | 'finance' | 'operations' | 'commercial' | 'fleet_maintenance' | 'maintenance_assistant' | 'logistics_manager' | 'maintenance_manager';
type DynProfile = { key: string; name: string };
type DynModule = { key: string; name: string; description?: string };
type DynMatrix = Record<string, Record<string, boolean>>;

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

const GITHUB_COPILOT_AGENT_PERMISSIONS = [
  {
    category: 'Em geral',
    permissions: [
      'Alterar configurações de rastreamento',
      'Criar novos projetos',
      'Excluir projeto de equipe',
      'Editar informações de nível de instância',
      'Exibir informações em nível de instância',
    ],
  },
  {
    category: 'Conta de serviço',
    permissions: [
      'Fazer pedidos em nome de outras pessoas.',
      'Eventos de gatilho',
      'Visualizar informações de sincronização do sistema',
    ],
  },
  {
    category: 'Tábuas',
    permissions: [
      'Administrar permissões de processo',
      'Criar processo',
      'Excluir campo da organização',
      'Excluir processo',
      'Processo de edição',
    ],
  },
  {
    category: 'Descansar',
    permissions: [
      'Administrar alterações arquivadas',
      'Administrar espaços de trabalho',
      'Crie um espaço de trabalho',
    ],
  },
  {
    category: 'Oleodutos',
    permissions: [
      'Administrar permissões de recursos de compilação',
      'Gerenciar recursos de construção',
      'Gerenciar políticas de dutos',
      'Use os recursos de construção',
      'Veja os recursos de construção',
    ],
  },
  {
    category: 'Planos de teste',
    permissions: ['Gerenciar controladores de teste'],
  },
  {
    category: 'Auditoria',
    permissions: [
      'Excluir fluxos de auditoria',
      'Gerenciar fluxos de auditoria',
      'Visualizar registro de auditoria',
    ],
  },
  {
    category: 'Políticas',
    permissions: ['Gerenciar políticas empresariais'],
  },
] as const;

function safeJson(r: Response) {
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error("Resposta não JSON");
  return r.json();
}

const Permissions = () => {
  const { hasRole, roles } = useAuth();
  const [dynProfiles, setDynProfiles] = useState<DynProfile[]>([]);
  const [dynModules, setDynModules] = useState<DynModule[]>([]);
  const [dynMatrix, setDynMatrix] = useState<DynMatrix>({});

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`/api/permissions-matrix`);
        const data = await safeJson(r);
        setDynProfiles((data.profiles || []).map((p:any)=>({ key: p.key, name: p.name })));
        setDynModules((data.modules || []).map((m:any)=>({ key: m.key, name: m.name, description: m.description })));
        setDynMatrix(data.matrix || {});
      } catch {}
    };
    load();
  }, []);

  // Apenas admins podem ver esta página
  if (!hasRole('admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  const allRoles = dynProfiles.length > 0 ? dynProfiles.map(p=>p.key) : (Object.keys(MODULE_PERMISSIONS) as AppRole[]);
  const allModules = dynModules.length > 0 ? dynModules.map(m=>m.key) : Array.from(new Set(Object.values(MODULE_PERMISSIONS).flat()));
  const categories = Array.from(new Set(Object.values(MODULES_INFO).map(m => m.category)).add('Outros'));

  return (
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Agente de codificação do GitHub Copilot
            </CardTitle>
            <CardDescription>
              Todas as permissões abaixo estão configuradas como permitidas para o agente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {GITHUB_COPILOT_AGENT_PERMISSIONS.map(({ category, permissions }) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between gap-3 border-b pb-2">
                  <h3 className="font-semibold">{category}</h3>
                  <Badge className="bg-green-600 text-white">Permitido</Badge>
                </div>
                <div className="grid gap-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                    >
                      <span className="text-sm">{permission}</span>
                      <Badge variant="outline" className="border-green-600 text-green-700">
                        <CheckCircle className="mr-1 h-3.5 w-3.5" />
                        Permitir
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
                            <Badge className={`${ROLE_INFO[(role as AppRole)]?.color || 'bg-gray-500'} text-white text-xs`}>
                              {ROLE_INFO[(role as AppRole)]?.name || role}
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allModules
                      .filter(module => (MODULES_INFO[module]?.category || 'Outros') === category)
                      .map((module) => (
                        <tr key={module} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium sticky left-0 bg-card">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{MODULES_INFO[module]?.icon}</span>
                              <span>{MODULES_INFO[module]?.name || module}</span>
                            </div>
                          </td>
                          {allRoles.map((role) => {
                            const hasAccess = dynProfiles.length > 0 ? !!dynMatrix[module]?.[role] : MODULE_PERMISSIONS[(role as AppRole)]?.includes(module);
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
  );
};

export default Permissions;
