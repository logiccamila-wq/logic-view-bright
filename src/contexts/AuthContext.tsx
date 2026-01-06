import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AppRole =
  | "admin"
  | "driver"
  | "finance"
  | "operations"
  | "commercial"
  | "fleet_maintenance"
  | "maintenance_assistant"
  | "logistics_manager"
  | "maintenance_manager"
  | "super_consultant";

const ROLE_ALIASES: Record<string, AppRole> = {
  motorista: "driver",
  mecanico: "fleet_maintenance",
  auxiliar_manutencao: "maintenance_assistant",
  financeiro: "finance",
  operacoes: "operations",
  comercial: "commercial",
  frota: "fleet_maintenance",
  diretor: "super_consultant",
  diretoria: "super_consultant",
  gerente_logistica: "logistics_manager",
  gerente_manutencao: "maintenance_manager",
  auditor: "super_consultant",
  auditora: "super_consultant",
  consultor: "super_consultant",
  consultora: "super_consultant",
};

function normalizeRoles(rs: string[]): AppRole[] {
  return rs
    .map((r) => (ROLE_ALIASES[r] ? ROLE_ALIASES[r] : (r as AppRole)))
    .filter(Boolean) as AppRole[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  canAccessModule: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Permissões por módulo
const MODULE_PERMISSIONS: Record<AppRole, string[]> = {
  driver: ["dashboard", "fleet", "tms", "driver"],
  finance: ["dashboard", "erp", "reports", "approvals", "control-tower", "finance", "documents"],
  operations: ["dashboard", "operations", "tms", "fleet", "approvals", "control-tower", "documents"],
  admin: [
    "dashboard",
    "wms",
    "tms",
    "oms",
    "scm",
    "crm",
    "erp",
    "eip",
    "fleet",
    "mechanic",
    "driver",
    "reports",
    "settings",
    "users",
    "approvals",
    "control-tower",
    "inventory",
    "finance",
    "documents",
    "developer",
    "innovation",
    "operations",
    "maintenance",
    "iot",
    "logistics-kpi",
    "bank-reconciliation",
    "cost-monitoring",
    "permissions",
  ],
  commercial: ["dashboard", "tms", "crm"],
  fleet_maintenance: ["fleet", "mechanic", "inventory", "documents", "approvals"],
  maintenance_assistant: ["mechanic", "inventory"],
  logistics_manager: [
    "dashboard",
    "tms",
    "fleet",
    "driver",
    "approvals",
    "reports",
    "control-tower",
    "finance",
    "documents",
  ],
  maintenance_manager: [
    "dashboard",
    "fleet",
    "mechanic",
    "approvals",
    "reports",
    "control-tower",
    "inventory",
    "documents",
  ],
  super_consultant: [
    "dashboard",
    "supergestor",
    "reports",
    "developer",
    "finance",
    "documents",
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Buscar roles do usuário
  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_roles").select("*").eq("user_id", userId);

      if (error) {
        // If table doesn't exist or other error, log but don't crash, fallback to empty roles
        console.warn("Error fetching roles (table might be missing):", error);
        setRoles([]);
        return;
      }

      const extracted = (data || []).map((r: any) => {
        const v = r.role ?? r.role_name ?? r.name ?? r.slug ?? r.tipo ?? r.perfil;
        return typeof v === 'string' ? v : '';
      }).filter(Boolean);
      setRoles(normalizeRoles(extracted));
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Listener de auth
  useEffect(() => {
    let mounted = true;

    // Corrigido: retorno correto do onAuthStateChange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_OUT") {
        setRoles([]);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setLoading(true);
        setTimeout(() => fetchUserRoles(session.user.id), 0);
      } else {
        setRoles([]);
        setLoading(false);
      }
    });

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setLoading(true);
        setTimeout(() => fetchUserRoles(session.user.id), 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe(); // Corrigido
    };
  }, []);

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: userRoles } = await supabase.from("user_roles").select("*").eq("user_id", data.user.id);

        let roles = normalizeRoles(
          (userRoles || []).map((r: any) => {
            const v = r.role ?? r.role_name ?? r.name ?? r.slug ?? r.tipo ?? r.perfil;
            return typeof v === 'string' ? v : '';
          }).filter(Boolean)
        );

        if (!roles.length) {
          const e = (email || "").trim().toLowerCase();
          if (e === "logiccamila@gmail.com") roles = ["admin"];
          if (e === "logicdev@optilog.app") roles = ["admin"];
          else if (e === "motorista.teste@optilog.app") roles = ["driver"];
          else if (e === "mecanico.teste@optilog.app") roles = ["fleet_maintenance"];
          setRoles(roles);
        } else {
          setRoles(roles);
        }
        
        // Mecânicos: apenas fleet_maintenance ou maintenance_assistant
        const onlyMechanic = roles.every(r => 
          r === 'fleet_maintenance' || r === 'maintenance_assistant'
        );
        
        // Motorista: apenas driver
        const onlyDriver = roles.length === 1 && roles[0] === 'driver';

        toast.success("Login realizado com sucesso!");

        if (onlyMechanic) {
          navigate("/mechanic");
        } else if (onlyDriver) {
          navigate("/driver");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Erro ao fazer login");
      throw error;
    }
  };

  // Cadastro
  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        await (supabase as any).from("user_roles").insert({
          user_id: data.user.id,
          role: role as any,
        });

        await supabase.from("profiles").insert({
          id: data.user.id,
          email,
          full_name: fullName,
        });

        toast.success("Usuário cadastrado com sucesso!");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Erro ao cadastrar usuário");
      throw error;
    }
  };

  // Logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Erro ao fazer logout");
    } finally {
      setUser(null);
      setSession(null);
      setRoles([]);
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    }
  };

  const hasRole = (role: AppRole) => {
    return roles.includes(role) || roles.includes("admin");
  };

  const canAccessModule = (module: string) => {
    if (roles.includes("admin")) return true;

    return roles.some((role) => MODULE_PERMISSIONS[role]?.includes(module));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        loading,
        signIn,
        signUp,
        signOut,
        hasRole,
        canAccessModule,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
