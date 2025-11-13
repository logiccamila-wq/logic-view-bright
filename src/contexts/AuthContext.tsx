import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AppRole = 'admin' | 'driver' | 'finance' | 'operations' | 'commercial' | 'fleet_maintenance' | 'maintenance_assistant' | 'logistics_manager' | 'maintenance_manager';

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

// Module permissions mapping
const MODULE_PERMISSIONS: Record<AppRole, string[]> = {
  driver: ['dashboard', 'fleet', 'tms', 'driver'],
  finance: ['dashboard', 'erp', 'reports', 'control-tower'],
  operations: ['dashboard', 'operations', 'tms', 'fleet', 'control-tower'],
  admin: ['dashboard', 'wms', 'tms', 'oms', 'scm', 'crm', 'erp', 'fleet', 'mechanic', 'driver', 'reports', 'settings', 'users', 'approvals', 'control-tower'],
  commercial: ['dashboard', 'tms', 'crm'],
  fleet_maintenance: ['dashboard', 'fleet', 'mechanic'],
  maintenance_assistant: ['dashboard', 'mechanic'],
  logistics_manager: ['dashboard', 'tms', 'fleet', 'driver', 'approvals', 'reports', 'control-tower'],
  maintenance_manager: ['dashboard', 'fleet', 'mechanic', 'approvals', 'reports', 'control-tower'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user roles
  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;
      
      setRoles(data?.map((r) => r.role as AppRole) || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setRoles([]);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserRoles(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Assign role to the new user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role });

        if (roleError) throw roleError;

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ 
            id: data.user.id, 
            email,
            full_name: fullName 
          });

        if (profileError) throw profileError;

        toast.success('Usuário cadastrado com sucesso!');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Erro ao cadastrar usuário');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setRoles([]);
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Erro ao fazer logout');
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role) || roles.includes('admin');
  };

  const canAccessModule = (module: string): boolean => {
    if (roles.includes('admin')) return true;
    
    for (const role of roles) {
      if (MODULE_PERMISSIONS[role]?.includes(module)) {
        return true;
      }
    }
    
    return false;
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
