import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Driver {
  id: string;
  employee_id: string;
  categoria_cnh: string;
  validade_cnh: string;
  treinamento_mopp: boolean;
  aptidao_medica: boolean;
  status_operacional: "ATIVO" | "FERIAS" | "AFASTADO";
  created_at?: string;
  updated_at?: string;
  employee?: {
    nome: string;
    cpf: string;
    telefone?: string;
    email?: string;
  };
}

export function useDrivers(searchTerm = "", page = 1, pageSize = 10) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["drivers", searchTerm, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from("drivers")
        .select(
          `
          *,
          employee:employees(nome, cpf, telefone, email)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      if (searchTerm) {
        const { data: employees } = await supabase
          .from("employees")
          .select("id")
          .or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`);

        if (employees && employees.length > 0) {
          const employeeIds = employees.map((e) => e.id);
          query = query.in("employee_id", employeeIds);
        }
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        if (error.code === 'PGRST205' || error.message.includes('drivers')) {
           console.warn('Tabela drivers ausente.');
           return { drivers: [], totalCount: 0, totalPages: 0 };
        }
        throw error;
      }

      return {
        drivers: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });

  const createDriver = useMutation({
    mutationFn: async (driver: Omit<Driver, "id" | "created_at" | "updated_at" | "employee">) => {
      const { data, error } = await supabase
        .from("drivers")
        .insert([driver])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Motorista cadastrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar motorista: ${error.message}`);
    },
  });

  const updateDriver = useMutation({
    mutationFn: async ({ id, ...driver }: Partial<Driver> & { id: string }) => {
      const { data, error } = await supabase
        .from("drivers")
        .update(driver)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Motorista atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar motorista: ${error.message}`);
    },
  });

  const deleteDriver = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drivers").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Motorista excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir motorista: ${error.message}`);
    },
  });

  return {
    drivers: data?.drivers || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    createDriver,
    updateDriver,
    deleteDriver,
  };
}
